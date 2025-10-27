// Generates Mintlify help documentation pages from a Contentful CSV export.
// Usage:
//   node ./lib/genHelpFromCsv.js -i ./lib/contentful-help-export.csv \
//     -o ./help -d ./images/help --update-nav ./docs.json
// Options:
//   -i, --input <file>        CSV export file from Contentful
//   -o, --out <dir>           Root output directory for help articles (default: docs/help)
//   -d, --assets <dir>        Directory to store downloaded images (default: docs/images/help)
//   --update-nav <docs.json>  Update docs.json Help tab navigation
//   --dry-run                 Parse and report without writing files
//   --force                   Overwrite existing article files
//   --verbose                 Extra logging
// Assumptions:
//   CSV columns (headers) include: Name, Slug, Categories, Answer, Meta description, Updated, status
//   Image references appear in markdown as ![alt](//images.ctfassets.net/....)
//   Each row maps to a single article (no multi-category rows). If multiple categories are present (comma separated),
//   the first becomes primary category, remaining appended as tags in frontmatter.

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { createReadStream } from 'node:fs';
import process from 'node:process';
import { parse } from 'csv-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(...args) { console.log('[genHelp]', ...args); }

function parseArgs(argv) {
    const args = { input: null, out: 'docs/help', assets: 'docs/images/help', dryRun: false, force: false, verbose: false, updateNav: null, genIndex: false };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        switch (a) {
            case '-i':
            case '--input': args.input = argv[++i]; break;
            case '-o':
            case '--out': args.out = argv[++i]; break;
            case '-d':
            case '--assets': args.assets = argv[++i]; break;
            case '--update-nav': args.updateNav = argv[++i]; break;
            case '--dry-run': args.dryRun = true; break;
            case '--force': args.force = true; break;
            case '--verbose': args.verbose = true; break;
            case '--gen-index': args.genIndex = true; break;
            case '-h':
            case '--help':
                printHelp();
                process.exit(0);
            default:
                if (a.startsWith('--')) throw new Error(`Unknown flag: ${a}`);
        }
    }
    if (!args.input) throw new Error('Missing --input <file>');
    return args;
}

function printHelp() {
    console.log(`Usage: node lib/genHelpFromCsv.js -i <input.csv> [options]\n` +
        `Options:\n` +
        `  -i, --input <file>        CSV export file from Contentful (required)\n` +
        `  -o, --out <dir>           Output directory for help articles (default docs/help)\n` +
        `  -d, --assets <dir>        Image asset directory (default docs/images/help)\n` +
        `  --update-nav <docs.json>  Update docs.json navigation for Help tab\n` +
        `  --dry-run                 Do not write any files\n` +
        `  --force                   Overwrite existing article files\n` +
        `  --verbose                 Verbose logging\n` +
        `  --gen-index               Generate/overwrite category overview index page (index.mdx)\n` +
        `  -h, --help                Show help`);
}

function slugify(str) {
    return str
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function pathExists(p) {
    try { await access(p); return true; } catch { return false; }
}

async function ensureDir(dir) {
    if (!(await pathExists(dir))) await mkdir(dir, { recursive: true });
}

async function parseCsv(file) {
    return new Promise((resolve, reject) => {
        const records = [];
        createReadStream(file)
            .pipe(parse({ columns: true, relaxQuotes: true, skipEmptyLines: true }))
            .on('data', r => records.push(r))
            .on('error', reject)
            .on('end', () => resolve(records));
    });
}

const IMAGE_REGEX = /!\[[^\]]*\]\(([^)]+)\)/g; // markdown image syntax
const RAW_ASSET_REGEX = /(https?:)?\/\/images\.ctfassets\.net\/[^)\s\"]+/g; // fallback raw URLs

function extractImageUrls(markdown) {
    const urls = new Set();
    let m;
    while ((m = IMAGE_REGEX.exec(markdown)) !== null) {
        const u = m[1];
        if (/images\.ctfassets\.net/.test(u)) urls.add(u);
    }
    while ((m = RAW_ASSET_REGEX.exec(markdown)) !== null) {
        urls.add(m[0]);
    }
    return Array.from(urls);
}

function buildFrontmatter(row, category, tags) {
    const fm = {
        title: row['Name']?.trim() || row['Slug'],
        description: (row['Meta description'] || '').trim() || snippet(row['Answer'] || '', 180),
        category,
        updated: row['Updated'] || undefined,
        status: row['status'] || undefined,
        tags: tags.length ? tags : undefined
    };
    const orderedKeys = ['title', 'description', 'category', 'updated', 'status', 'tags'];
    const lines = ['---'];
    for (const k of orderedKeys) {
        if (fm[k] === undefined || fm[k] === '') continue;
        if (Array.isArray(fm[k])) {
            lines.push(`${k}:`);
            fm[k].forEach(v => lines.push(`  - ${v}`));
        } else {
            // escape colon
            const val = String(fm[k]).replace(/"/g, '"');
            lines.push(`${k}: ${val}`);
        }
    }
    lines.push('---', '');
    return lines.join('\n');
}

function snippet(text, max) {
    const plain = text.replace(/\r/g, '').replace(/\n+/g, ' ').trim();
    if (plain.length <= max) return plain;
    return plain.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

async function downloadImage(url, assetsDir, { dryRun, verbose }) {
    let full = url;
    if (full.startsWith('//')) full = 'https:' + full;
    const fileName = path.basename(new URL(full).pathname).split('?')[0];
    const outPath = path.join(assetsDir, fileName);
    if (await pathExists(outPath)) {
        if (verbose) log('Image cached', fileName);
        return outPath;
    }
    if (dryRun) {
        log('[dry] Would download', full, '->', outPath);
        return outPath;
    }
    const res = await fetch(full);
    if (!res.ok) throw new Error('Failed to download image ' + full + ' status ' + res.status);
    await ensureDir(assetsDir);
    await pipeline(res.body, createWriteStream(outPath));
    if (verbose) log('Downloaded', fileName);
    return outPath;
}

function rewriteImageUrls(markdown, mapping, articleDir) {
    // mapping: originalUrl -> absolutePath
    let updated = markdown;
    for (const [orig, localPath] of mapping.entries()) {
        const rel = path.relative(articleDir, localPath).split(path.sep).join('/');
        const pattern = new RegExp(orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        updated = updated.replace(pattern, rel.startsWith('.') ? rel : './' + rel);
        // Also handle protocol-less form
        if (orig.startsWith('//')) {
            const alt = 'https:' + orig;
            const altPattern = new RegExp(alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            updated = updated.replace(altPattern, rel.startsWith('.') ? rel : './' + rel);
        }
    }
    return updated;
}

async function updateDocsNav(docsJsonPath, categoryMap, outRoot) {
    const raw = await readFile(docsJsonPath, 'utf8');
    const json = JSON.parse(raw);
    const helpTab = json.navigation?.tabs?.find(t => t.tab === 'Help');
    if (!helpTab) throw new Error('Help tab not found in docs.json');
    const helpGroup = helpTab.groups.find(g => g.group === 'Help');
    if (!helpGroup) throw new Error('Help group not found under Help tab');
    // Preserve hidden root page(s)
    const preserved = helpGroup.pages.filter(p => typeof p === 'object' && p.hidden);
    const newGroups = [];
    for (const [category, pages] of Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
        newGroups.push({ group: category, pages: pages.map(p => p.replace(/\\.mdx$/, '')) });
    }
    helpGroup.pages = [...preserved, ...newGroups];
    await writeFile(docsJsonPath, JSON.stringify(json, null, 2) + '\n');
    log('Updated docs.json navigation with', newGroups.length, 'categories');
}

function buildIndexPage(categoryMap, outDir) {
    const lines = [
        '---',
        'title: Help',
        'description: Browse help topics and find quick answers.',
        '---',
        '',
        'import { Card, Cards } from "@/components";',
        '',
        '> Browse by category',
        ''
    ];
    // Sort categories alphabetically
    const categories = Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [category, pages] of categories) {
        // Use first article as sample for snippet if possible by reading its file content (already built in memory earlier)
        // We'll just show count.
        lines.push(`### ${category}`);
        lines.push('');
        lines.push('<Cards columns={3}>');
        // Show up to 6 articles
        const sample = pages.slice(0, 6);
        for (const p of sample) {
            const slug = p.split('/').pop();
            const title = slug.replace(/-/g, ' ');
            lines.push(`<Card title={"${title}"} href={"/${p}"} />`);
        }
        if (pages.length > sample.length) {
            lines.push(`<Card title="View all ${pages.length} articles" href={"/${pages[0].split('/').slice(0, -1).join('/')}" />`);
        }
        lines.push('</Cards>', '');
    }
    return lines.join('\n');
}

async function main() {
    const args = parseArgs(process.argv);
    if (args.verbose) log('Args', args);
    const rows = await parseCsv(args.input);
    if (!rows.length) {
        log('No rows found in CSV. Exiting.');
        return;
    }
    await ensureDir(args.out);
    await ensureDir(args.assets);
    const articleRecords = [];
    const usedSlugs = new Set();
    const categoryPages = new Map(); // category -> array of page paths (without extension for docs.json)
    for (const row of rows) {
        const name = row['Name']?.trim();
        const slugRaw = (row['Slug'] || name || '').trim();
        if (!slugRaw) { if (args.verbose) log('Skipping row without slug/name'); continue; }
        let slug = slugify(slugRaw);
        while (usedSlugs.has(slug)) slug = slug + '-2'; // simple disambiguation
        usedSlugs.add(slug);
        const categoriesRaw = (row['Categories'] || '').split(',').map(s => s.trim()).filter(Boolean);
        const primaryCategory = categoriesRaw[0] || 'General';
        const tags = categoriesRaw.slice(1);
        const categorySlug = slugify(primaryCategory);
        const articleDir = path.join(args.out, categorySlug);
        const articlePath = path.join(articleDir, slug + '.mdx');
        const markdown = row['Answer'] || '';
        const imageUrls = extractImageUrls(markdown);
        const imageMap = new Map();
        for (const url of imageUrls) {
            try {
                const localPath = await downloadImage(url, args.assets, args);
                imageMap.set(url, localPath);
            } catch (e) {
                log('WARN image failed', url, e.message);
            }
        }
        const rewritten = rewriteImageUrls(markdown, imageMap, articleDir);
        const fm = buildFrontmatter(row, primaryCategory, tags);
        const finalContent = fm + rewritten.trim() + '\n';
        articleRecords.push({ category: primaryCategory, categorySlug, slug, path: articlePath, content: finalContent });
    }
    // Write files
    for (const rec of articleRecords) {
        await ensureDir(path.dirname(rec.path));
        if (await pathExists(rec.path) && !args.force) {
            log('Skip existing (use --force to overwrite)', rec.path);
        } else if (args.dryRun) {
            log('[dry] Would write', rec.path);
        } else {
            await writeFile(rec.path, rec.content, 'utf8');
            log('Wrote', rec.path);
        }
        const pageRef = rec.path.replace(/\.mdx$/, '').split(path.sep).join('/');
        if (!categoryPages.has(rec.category)) categoryPages.set(rec.category, []);
        categoryPages.get(rec.category).push(pageRef);
    }
    if (args.updateNav && !args.dryRun) {
        await updateDocsNav(args.updateNav, categoryPages, args.out);
    } else if (args.updateNav && args.dryRun) {
        log('[dry] Would update docs.json with categories:', Array.from(categoryPages.keys()).join(', '));
    }
    if (args.genIndex) {
        const indexPath = path.join(args.out, 'index.mdx');
        const content = buildIndexPage(categoryPages, args.out);
        if (args.dryRun) {
            log('[dry] Would write index overview', indexPath);
        } else {
            await writeFile(indexPath, content, 'utf8');
            log('Wrote index overview', indexPath);
        }
    }
    log('Done. Articles processed:', articleRecords.length);
}

main().catch(err => { console.error(err); process.exit(1); });

