/**
 * @module sortTags
 *
 * Utilities to reorder an OpenAPI document's paths, operations, and tag list
 * according to the declared tag order (doc.tags) followed by any undeclared
 * but used tags (sorted alphabetically). Intended for producing a stable,
 * human-friendly diff and navigation order.
 *
 * CLI Usage:
 *   Install / link (examples):
 *     1) Via local file:
 *        node ./docs/lib/sortTags.js -i openapi.json
 *     2) If published as a package (hypothetical name "sort-tags"):
 *        npx sort-tags -i openapi.json
 *
 *   Basic:
 *     sort-tags openapi.json
 *       Overwrites the input file with a tag-sorted version.
 *
 *   Specify output:
 *     sort-tags openapi.json sorted.json
 *     sort-tags -i openapi.json -o sorted.json
 *
 *   Pretty-print JSON (2-space indent):
 *     sort-tags openapi.json --pretty
 *     sort-tags -i openapi.json -o sorted.json -p
 *
 *   Show help:
 *     sort-tags --help
 *
 * Exit codes:
 *   0 on success
 *   1 on argument or processing error
 *
 * Programmatic Usage:
 *   import { sortOpenApiByTags, runSortTagsCli } from './docs/lib/sortTags.js';
 *
 *   // Sort an already loaded OpenAPI document object:
 *   const sorted = sortOpenApiByTags(doc);
 *
 *   // Run the CLI logic (parses argv, reads/writes files):
 *   await runSortTagsCli(['-i', 'openapi.json', '-o', 'sorted.json', '--pretty']);
 */

/**
 * Sort an OpenAPI specification object by tag order.
 * Reorders:
 *   1) The paths (top-level doc.paths keys) based on the earliest tag appearing in their operations.
 *   2) The operations within each path by tag order then method name.
 *   3) The doc.tags array itself, preserving original tag objects in used order.
 *
 * Tag ordering logic:
 *   - Start with declared tags in doc.tags that are actually referenced.
 *   - Append any tags used in operations but not declared, sorted alphabetically.
 *
 * Operations without tags are pushed to the end (MAX_SAFE_INTEGER rank).
 *
 * @param {object} doc - The OpenAPI document (must contain at least a paths object).
 * @returns {object} A new OpenAPI document with sorted paths, operations, and tag list.
 */

/**
 * Execute the CLI:
 *   Parses arguments, reads the input JSON file, sorts tags, writes output.
 *
 * Recognized flags:
 *   -i, --in, --input   Input file path (JSON)
 *   -o, --out, --output Output file path (defaults to overwrite input)
 *   -p, --pretty        Pretty-print (2 space indentation)
 *   -h, --help          Show usage and exit
 *
 * @async
 * @param {string[]} [argv=process.argv.slice(2)] Command-line arguments array.
 * @returns {Promise<void>} Resolves when processing and writing is complete.
 */

import { promises as fs } from 'fs';
import path from 'path';


console.log('sortTags module loaded');

/**
 * Sort an OpenAPI document's paths and operations by tag order.
 * @param {object} doc
 * @returns {object}
 */
export function sortOpenApiByTags(doc) {
    if (!doc.paths) return doc;
    const tagOrder = [];
    const declaredTags = Array.isArray(doc.tags) ? doc.tags.map(t => t.name) : [];
    const usedTags = new Set();
    for (const pathItem of Object.values(doc.paths)) {
        if (!pathItem) continue;
        for (const op of getOperations(pathItem)) {
            if (op.tags) op.tags.forEach(t => usedTags.add(t));
        }
    }
    for (const t of declaredTags) {
        if (usedTags.has(t)) tagOrder.push(t);
    }
    const undeclared = [...usedTags].filter(t => !declaredTags.includes(t)).sort();
    tagOrder.push(...undeclared);
    const tagIndex = new Map();
    tagOrder.forEach((t, i) => tagIndex.set(t, i));

    const pathSortKey = (pathItem) => {
        let best = Number.MAX_SAFE_INTEGER;
        for (const op of getOperations(pathItem)) {
            if (op.tags && op.tags.length) {
                for (const t of op.tags) {
                    const idx = tagIndex.has(t) ? tagIndex.get(t) : Number.MAX_SAFE_INTEGER - 1;
                    if (idx < best) best = idx;
                }
            }
        }
        return best;
    };

    const pathEntries = Object.entries(doc.paths);
    pathEntries.sort((a, b) => {
        const [pathA, itemA] = a;
        const [pathB, itemB] = b;
        const keyA = pathSortKey(itemA || {});
        const keyB = pathSortKey(itemB || {});
        if (keyA !== keyB) return keyA - keyB;
        return pathA.localeCompare(pathB);
    });

    const sortedPaths = {};
    for (const [p, item] of pathEntries) {
        if (!item) {
            sortedPaths[p] = item;
            continue;
        }
        const opEntries = getOperationEntries(item);
        opEntries.sort((a, b) => {
            const rankA = operationTagRank(a[1], tagIndex);
            const rankB = operationTagRank(b[1], tagIndex);
            if (rankA !== rankB) return rankA - rankB;
            return a[0].localeCompare(b[0]);
        });
        const newItem = { ...copyNonOperationFields(item) };
        for (const [method, op] of opEntries) {
            newItem[method] = op;
        }
        sortedPaths[p] = newItem;
    }

    if (Array.isArray(doc.tags)) {
        const tagMap = new Map(doc.tags.map(t => [t.name, t]));
        doc.tags = tagOrder.filter(n => tagMap.has(n)).map(n => tagMap.get(n));
    }
    return { ...doc, paths: sortedPaths };
}

function getOperations(pathItem) {
    return getOperationEntries(pathItem).map(e => e[1]);
}

function getOperationEntries(pathItem) {
    const methods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
    const entries = [];
    for (const m of methods) {
        const op = pathItem[m];
        if (op) entries.push([m, op]);
    }
    return entries;
}

function operationTagRank(op, tagIndex) {
    if (!op.tags || op.tags.length === 0) return Number.MAX_SAFE_INTEGER;
    let best = Number.MAX_SAFE_INTEGER;
    for (const t of op.tags) {
        if (tagIndex.has(t)) {
            const idx = tagIndex.get(t);
            if (idx < best) best = idx;
        }
    }
    return best;
}

function copyNonOperationFields(item) {
    const { get, put, post, delete: del, options, head, patch, trace, ...rest } = item;
    return rest;
}

function parseArgs(argv) {
    let input = '';
    let output;
    let pretty = false;
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        switch (a) {
            case '-i':
            case '--in':
            case '--input':
                input = argv[++i];
                break;
            case '-o':
            case '--out':
            case '--output':
                output = argv[++i];
                break;
            case '-p':
            case '--pretty':
                pretty = true;
                break;
            case '-h':
            case '--help':
                printHelpAndExit();
                break;
            default:
                if (!input) input = a;
                else if (!output) output = a;
                break;
        }
    }
    if (!input) {
        console.error('Missing input file.');
        printHelpAndExit(1);
    }
    return { input, output, pretty };
}

function printHelpAndExit(code = 0) {
    console.log(
        'Usage: sort-tags <input> [output] [options]\n' +
        'Options:\n' +
        '  -i, --in <file>       Input OpenAPI JSON file (positional also ok)\n' +
        '  -o, --out <file>      Output file (defaults to overwrite input)\n' +
        '  -p, --pretty          Pretty-print JSON\n' +
        '  -h, --help            Show help\n'
    );
    process.exit(code);
}

async function loadDocument(file) {
    const data = await fs.readFile(file, 'utf8');
    try {
        return JSON.parse(data);
    } catch {
        throw new Error('Failed to parse JSON: ' + file);
    }
}

async function writeDocument(file, doc, pretty) {
    const json = JSON.stringify(doc, null, pretty ? 2 : 0);
    await fs.writeFile(file, json + (pretty ? '\n' : ''), 'utf8');
}

export async function runSortTagsCli(argv = process.argv.slice(2)) {
    const opts = parseArgs(argv);
    const inputPath = path.resolve(opts.input);
    const outputPath = path.resolve(opts.output || opts.input);
    const doc = await loadDocument(inputPath);
    const sorted = sortOpenApiByTags(doc);
    await writeDocument(outputPath, sorted, opts.pretty);
    if (outputPath === inputPath) {
        console.log('Sorted tags written back to:', inputPath);
    } else {
        console.log('Sorted tags written to:', outputPath);
    }
}

const isMain = typeof require !== 'undefined'
    ? require.main === module
    : (process.argv[1] && new URL(import.meta.url).pathname === path.resolve(process.argv[1]));

if (isMain) {
    runSortTagsCli().catch(err => {
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
    });
}


