/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { KnipConfig } from 'knip';

/**
 * Configuration for the dependency checks (`pnpm run check-dependencies`), which runs Knip
 * with this configuration twice:
 *
 *   --dependencies                        (unused and unlisted packages)
 *   --dependencies --production --strict  (misplaced `dependencies` vs `devDependencies`)
 *
 * Strict isolation is limited to production code. Development tooling can still use dependencies
 * declared in the root workspace during the default pass.
 *
 * Patterns marked with the `!` suffix describe production code. They must match the folders
 * that end up in the published packages (`src`, `theme`, `bin`, `lang`).
 */

/**
 * Common configuration for the `packages/*` workspaces. Knip supports workspace configuration
 * only in the root config and a specific workspace entry does not merge with the `packages/*`
 * one, so single-package overrides go through this helper instead of repeating the patterns.
 */
// The `entry` and `project` options receive the same patterns: for dependency checks every
// analyzed file acts as an entry point, and restricting `project` prevents Knip from pulling
// unrelated files into the analysis.
const packageFiles = [
	'src/**/*.{js,ts}!',
	'theme/**/*.css!',
	'bin/**/*.{js,mjs,cjs}!',
	'lang/**/*.ts!',
	'tests/**/*.{js,ts}',
	'manual/**/*.{js,ts}',
	'scripts/**/*.{js,mjs,cjs,ts}',
	'docs/**/*.{js,ts}'
];

const rootFiles = [ 'scripts/**/*.{js,mjs,cjs,ts,mts}', 'docs/**/*.{js,mjs,ts}', '*.{mjs,mts}' ];

const packageWorkspace = ( ignoreDependencies: Array<string> = [] ) => ( {
	// Snippets are merged into a single directory during the documentation build;
	// all `@snippets` imports resolve to the root `docs/_snippets` sources.
	paths: {
		'@snippets/*': [ '../../docs/_snippets/*' ],
		'@assets/*': [ '../../docs/assets/*' ]
	},
	entry: packageFiles,
	project: packageFiles,
	ignoreDependencies
} );

const config: KnipConfig = {
	compilers: {
		// Extracts `@import` statements from plain CSS files, so packages imported in `theme/`
		// participate in the dependency checks. See https://knip.dev/features/compilers.
		css: ( text: string ) => [ ...text.matchAll( /(?<=@)import[^;]+/g ) ].join( '\n' ),

		// Translation declarations preserve this type-only import in published packages. Treat it as
		// production usage even when the generated `dist/translations/*.d.ts` files do not exist yet.
		ts: ( text: string ) => text.replace(
			'import type { Translations } from \'@ckeditor/ckeditor5-utils\';',
			'import { Translations } from \'@ckeditor/ckeditor5-utils\';'
		)
	},

	workspaces: {
		'.': {
			entry: rootFiles,
			project: rootFiles,
			// Aliases used by documentation snippets, resolved by the snippet adapter
			// (see `scripts/docs/snippetadapter.mjs`).
			paths: {
				'@snippets/*': [ 'docs/_snippets/*' ],
				'@assets/*': [ 'docs/assets/*' ]
			},
			ignoreDependencies: [
				// Imported by documentation snippets. The package comes from the commercial
				// repository and is resolvable only in the commercial development environment,
				// so it cannot be declared here.
				'ckeditor5-premium-features',

				// Built into documentation assets by `scripts/docs/snippetadapter.mjs`, which
				// references them only through string literals (esbuild entry points and
				// generated import maps), invisible to static analysis.
				'@ckbox/uploader',
				'ckbox',

				// Referenced by name (not imported) in `scripts/release/validatepackages.mjs`.
				'publint',

				// Resolved and spawned dynamically by `scripts/ci/check-dependencies-versions-match.mjs`.
				'syncpack'
			]
		},
		'packages/ckeditor5-ui': packageWorkspace( [
			// Required by the published type declarations. It is referenced through the
			// `color-convert/conversions.js` subpath, which Knip does not pair with `@types`.
			'@types/color-convert'
		] ),
		'packages/*': packageWorkspace()
	}
};

export default config;
