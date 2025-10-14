#!/usr/bin/env node
// grab all the OpenAPI paths and generate a reference page and the sidebear json for each
// Example output structure:
// {
//   "group": "Endpoints",
//   "openapi": { "source": "/mdocs/api-reference/openapi.json", "directory": "mdocs/api-reference" },
//   "pages": [ { "group": "API keys", "pages": [ "GET /v1/api-keys", ... ] } ]
// }

import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sortOpenApiByTags } from './sortTags.js';

const genRefPages = async (openapiPath, outDir) => {
    const openapiRaw = await fs.promises.readFile(openapiPath, 'utf8');
    let openapi;
    try {
        openapi = JSON.parse(openapiRaw);
    } catch (err) {
        throw new Error(`Could not parse JSON from ${openapiPath}: ${err.message}`);
    }
    const sorted = sortOpenApiByTags(openapi);

    const pages = [];
    const tagMap = {};
    if (Array.isArray(sorted.tags)) {
        for (const tag of sorted.tags) {
            tagMap[tag.name] = { group: tag.name, pages: [] };
            if (tag.description) tagMap[tag.name].description = tag.description;
        }
    }

    for (const [p, methods] of Object.entries(sorted.paths)) {
        for (const [method, op] of Object.entries(methods)) {
            const page = `${method.toUpperCase()} ${p}`;
            if (Array.isArray(op.tags) && op.tags.length > 0) {
                const tagName = op.tags[0];
                if (tagMap[tagName]) {
                    tagMap[tagName].pages.push(page);
                } else {
                    if (!tagMap.Uncategorized) tagMap.Uncategorized = { group: 'Uncategorized', pages: [] };
                    tagMap.Uncategorized.pages.push(page);
                }
            } else {
                if (!tagMap.Uncategorized) tagMap.Uncategorized = { group: 'Uncategorized', pages: [] };
                tagMap.Uncategorized.pages.push(page);
            }
        }
    }

    for (const tagName of Object.keys(tagMap)) {
        pages.push(tagMap[tagName]);
    }

    const out = {
        group: 'Endpoints',
        openapi: {
            source: path.relative(process.cwd(), openapiPath).replace(/\\/g, '/'),
            directory: path.dirname(path.relative(process.cwd(), openapiPath)).replace(/\\/g, '/'),
        },
        pages,
    };

    await fs.promises.mkdir(outDir, { recursive: true });

    // Create introduction MDX file + directory per tag
    for (const tagObj of pages) {
        await createTagIntro(outDir, tagObj);
        // Ensure the tag intro index is the first entry in the sidebar group
        const slug = slugify(tagObj.group || 'untitled');
        const introRef = `mdocs/api-reference/${slug}/index`;
        if (!tagObj.pages.includes(introRef)) {
            tagObj.pages.unshift(introRef);
        }
    }

    // Remove description fields so they are not written to sidebear.json
    for (const grp of out.pages) {
        if (grp && Object.prototype.hasOwnProperty.call(grp, 'description')) {
            delete grp.description;
        }
    }
    const outPath = path.join(outDir, 'sidebear.json');
    await fs.promises.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote ${outPath}`);
};

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function escapeQuotes(s) {
    return s.replace(/"/g, '\\"');
}
async function createTagIntro(baseDir, tagObj) {
    const dirName = slugify(tagObj.group || 'untitled');
    const tagDir = path.join(baseDir, dirName);
    await fs.promises.mkdir(tagDir, { recursive: true });
    const introPath = path.join(tagDir, 'index.mdx');
    if (fs.existsSync(introPath)) return; // do not overwrite
    const lines = [];
    lines.push('---');
    lines.push(`title: "${escapeQuotes(tagObj.group)}"`);
    if (tagObj.description) lines.push(`description: "${escapeQuotes(tagObj.description)}"`);
    lines.push('---', '');
    lines.push(`Introduction to ${tagObj.group} endpoints.`);
    lines.push('');
    await fs.promises.writeFile(introPath, lines.join('\n'), 'utf8');
    console.log(`Created ${introPath}`);
}

export default genRefPages;

// CLI support
function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--openapi' || a === '-i') args.openapi = argv[++i];
        else if (a === '--out' || a === '-o') args.out = argv[++i];
        else if (a === '--help' || a === '-h') args.help = true;
        else if (!args.openapi) args.openapi = a;
        else if (!args.out) args.out = a;
    }
    return args;
}

async function runCLI() {
    const { openapi, out, help } = parseArgs(process.argv);
    if (help || !openapi) {
        console.log(`Usage:
    node lib/genRefPages.js --openapi <openapi.json> --out <outputDir>
    (positional also works) node lib/genRefPages.js <openapi.json> <outputDir>

Options:
    -i, --openapi   Path to OpenAPI JSON/YAML
    -o, --out       Output directory (default: directory of the OpenAPI file)
    -h, --help      Show help

Generates: <out>/sidebear.json plus per-tag introduction MDX folders`);
        process.exit(help ? 0 : 1);
    }

    const resolvedOpenapi = path.resolve(openapi);
    const outDir = path.resolve(out || path.dirname(resolvedOpenapi));

    try {
        await genRefPages(resolvedOpenapi, outDir);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
    runCLI();
}
