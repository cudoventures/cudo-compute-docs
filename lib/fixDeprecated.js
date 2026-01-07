#!/usr/bin/env node
// Fixes deprecated items in OpenAPI schema by adding 'deprecated: true' flag
// to any schema, property, or operation that has 'DEPRECATED' in its description
// but is missing the deprecated field.
// Usage:
//   node ./lib/fixDeprecated.js

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAPI_PATH = path.join(__dirname, '../docs/openapi.json');

/**
 * Recursively searches through an object and adds 'deprecated: true' 
 * to any schema, property, or operation that has 'DEPRECATED' or 'deprecated' 
 * in its description but is missing the deprecated field.
 */
function fixDeprecated(obj, parentPath = '') {
  let changesCount = 0;

  if (typeof obj !== 'object' || obj === null) {
    return changesCount;
  }

  // Check if this object has a description with 'deprecated' in it
  if (obj.description && typeof obj.description === 'string') {
    const hasDeprecatedInDescription = /deprecated/i.test(obj.description);
    
    if (hasDeprecatedInDescription && !obj.hasOwnProperty('deprecated')) {
      // Add deprecated: true
      obj.deprecated = true;
      changesCount++;
      console.log(`✓ Added 'deprecated: true' at: ${parentPath || 'root'}`);
      console.log(`  Description: ${obj.description.substring(0, 80)}...`);
    } else if (hasDeprecatedInDescription && obj.deprecated === false) {
      // Fix incorrect deprecated: false
      obj.deprecated = true;
      changesCount++;
      console.log(`✓ Changed 'deprecated: false' to 'deprecated: true' at: ${parentPath || 'root'}`);
      console.log(`  Description: ${obj.description.substring(0, 80)}...`);
    }
  }

  // Recursively process all properties
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
      const newPath = parentPath ? `${parentPath}.${key}` : key;
      changesCount += fixDeprecated(obj[key], newPath);
    }
  }

  return changesCount;
}

async function main() {
  console.log('Reading OpenAPI schema...');
  
  // Read the OpenAPI file
  const openApiContent = await fs.readFile(OPENAPI_PATH, 'utf8');
  const openApiSchema = JSON.parse(openApiContent);
  
  console.log('Searching for deprecated items without proper flag...\n');
  
  // Fix deprecated items
  const changesCount = fixDeprecated(openApiSchema);
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total changes made: ${changesCount}`);
  console.log('='.repeat(60));
  
  if (changesCount > 0) {
    // Write the updated schema back to file
    const updatedContent = JSON.stringify(openApiSchema, null, 2);
    await fs.writeFile(OPENAPI_PATH, updatedContent + '\n', 'utf8');
    console.log('\n✓ OpenAPI schema updated successfully!');
    console.log(`  File: ${OPENAPI_PATH}`);
  } else {
    console.log('\n✓ No changes needed - all deprecated items are properly marked.');
  }
}

// Run the script
try {
  await main();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

export { fixDeprecated };
