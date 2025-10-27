# Mintlify Starter Kit

Use the starter kit to get your docs deployed and ready to customize.

Click the green **Use this template** button at the top of this repo to copy the Mintlify starter kit. The starter kit contains examples with

- Guide pages
- Navigation
- Customizations
- API reference pages
- Use of popular components

**[Follow the full quickstart guide](https://starter.mintlify.com/quickstart)**

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mint) to preview your documentation changes locally. To install, use the following command:

```
npm i -g mint
```

Run the following command at the root of your documentation, where your `docs.json` is located:

```
mint dev
```

### Generating Help Articles from Contentful CSV

We migrate legacy Help Center articles exported from Contentful (CSV) into Mintlify MDX under `/help`.

1. Place (or update) the export at `./lib/contentful-help-export.csv`.
2. Run the generator script:

```bash
npm run gen:help
```

This will:

- Parse the CSV rows (expects columns: `Name, Slug, Categories, Answer, Meta description, Updated, status`).
- Create MDX files grouped by primary category: `/help/<category>/slug.mdx`.
- Download and rewrite Contentful image asset links to local paths under `/images/help`.
- Update the Help tab navigation in `docs.json`, replacing existing category groups (but preserving the hidden root index page).

Flags (advanced):

```bash
node ./lib/genHelpFromCsv.js -i ./lib/contentful-help-export.csv \
	-o /help -d /images/help --update-nav ./docs.json --dry-run --force --verbose
```

Useful when testing:

- `--dry-run` to see actions without writing.
- `--force` to overwrite existing files.
- `--verbose` for detailed logging.

Regenerating is idempotent; image downloads are cached by filename. To reset, delete `/help` and `/images/help` then re-run.

View your local preview at `http://localhost:3000`.

## Publishing changes

Install our GitHub app from your [dashboard](https://dashboard.mintlify.com/settings/organization/github-app) to propagate changes from your repo to your deployment. Changes are deployed to production automatically after pushing to the default branch.

## Need help?

### Troubleshooting

- If your dev environment isn't running: Run `mint update` to ensure you have the most recent version of the CLI.
- If a page loads as a 404: Make sure you are running in a folder with a valid `docs.json`.

### Resources
- [Mintlify documentation](https://mintlify.com/docs)
