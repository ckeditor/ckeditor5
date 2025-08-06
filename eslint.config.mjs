/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { readdirSync } from 'fs';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import ckeditor5Rules from 'eslint-plugin-ckeditor5-rules';
import ckeditor5Config from 'eslint-config-ckeditor5';
import ts from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import rootPkgJson from './package.json' with { type: 'json' };
import { CKEDITOR5_PACKAGES_PATH } from './scripts/constants.mjs';

const disallowedImports = Object.keys( rootPkgJson.devDependencies ).filter( pkgName => {
	return pkgName.match( /^(@ckeditor\/)?ckeditor5-(?!dev-)/ );
} );

const projectPackages = readdirSync( CKEDITOR5_PACKAGES_PATH, { withFileTypes: true } )
	.filter( dirent => dirent.isDirectory() )
	.map( dirent => dirent.name );

export default defineConfig( [
	{
		ignores: [
			'.*/',
			'!.changelog/',
			'build/**',
			'coverage/**',
			'dist/**',
			'external/**',
			'packages/*/build/**',
			'packages/*/dist/**',
			'packages/*/src/lib/**',
			'release/**',

			// The CKEditor 5 core DLL build is created from JavaScript files.
			// ESLint should not process compiled TypeScript.
			'src/*.js',
			'**/*.d.ts',

			'packages/ckeditor5-emoji/src/utils/isemojisupported.ts',

			// This file includes JSX which eslint can't parse without additional configuration.
			'docs/_snippets/framework/tutorials/using-react-in-widget.js'
		]
	},
	{
		extends: ckeditor5Config,

		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module'
		},

		linterOptions: {
			reportUnusedDisableDirectives: 'warn',
			reportUnusedInlineConfigs: 'warn'
		},

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'ckeditor5-rules/ckeditor-imports': 'error',
			'ckeditor5-rules/prevent-license-key-leak': 'error',
			'ckeditor5-rules/license-header': [ 'error', {
				headerLines: [
					'/**',
					' * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.',
					' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options',
					' */'
				]
			} ],
			'ckeditor5-rules/require-file-extensions-in-imports': [ 'error', {
				extensions: [ '.ts', '.js', '.json' ]
			} ]
		}
	},
	{
		files: [ 'packages/*/src/**/*.ts' ],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules,
			import: eslintPluginImport
		},

		rules: {
			'import/no-default-export': 'error',
			'ckeditor5-rules/allow-svg-imports-only-in-icons-package': 'error',
			'ckeditor5-rules/ckeditor-plugin-flags': [ 'error', {
				requiredFlags: [ {
					name: 'isOfficialPlugin',
					returnValue: true
				} ],
				disallowedFlags: [ 'isPremiumPlugin' ]
			} ]
		}
	},
	{
		files: [
			'packages/*/@(src|tests)/**/*.js',
			'src/**/*.js'
		],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'no-restricted-imports': [ 'error', {
				'paths': disallowedImports
			} ]
		}
	},
	{
		files: [
			'packages/*/@(src|tests)/**/*.ts',
			'src/**/*.ts'
		],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules,
			ts
		},

		rules: {
			'@typescript-eslint/no-restricted-imports': [ 'error', {
				'paths': disallowedImports
			} ]
		}
	},
	{
		files: [ '**/*.@(js|cjs|mjs)' ],

		languageOptions: {
			globals: {
				...globals.node
			}
		}
	},
	{
		files: [ '**/tests/**/*.@(js|cjs|mjs|ts)' ],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		languageOptions: {
			globals: {
				...globals.browser
			}
		},

		rules: {
			'ckeditor5-rules/ckeditor-imports': 'off',
			'ckeditor5-rules/no-cross-package-imports': 'off',
			'mocha/no-pending-tests': 'off'
		}
	},
	{
		/**
		 * This block is here temporarily to prevent non-migrated packages from printing errors.
		 * Migrated packages should be removed from the list. Once the list is empty,
		 * the rule should be moved to the block above, and this block should be removed.
		 */

		files: [ '**/tests/**/*.@(js|cjs|mjs|ts)' ],

		ignores: [
			'./tests/**',
			'./packages/ckeditor5-adapter-ckfinder/**',
			'./packages/ckeditor5-alignment/**',
			'./packages/ckeditor5-autoformat/**',
			'./packages/ckeditor5-autosave/**',
			'./packages/ckeditor5-basic-styles/**',
			'./packages/ckeditor5-block-quote/**',
			'./packages/ckeditor5-bookmark/**',
			'./packages/ckeditor5-ckbox/**',
			'./packages/ckeditor5-ckfinder/**',
			'./packages/ckeditor5-clipboard/**',
			'./packages/ckeditor5-cloud-services/**',
			'./packages/ckeditor5-code-block/**',
			'./packages/ckeditor5-core/**',
			'./packages/ckeditor5-easy-image/**',
			'./packages/ckeditor5-editor-balloon/**',
			'./packages/ckeditor5-editor-classic/**',
			'./packages/ckeditor5-editor-decoupled/**',
			'./packages/ckeditor5-editor-inline/**',
			'./packages/ckeditor5-editor-multi-root/**',
			'./packages/ckeditor5-emoji/**',
			'./packages/ckeditor5-engine/**',
			'./packages/ckeditor5-enter/**',
			'./packages/ckeditor5-essentials/**',
			'./packages/ckeditor5-find-and-replace/**',
			'./packages/ckeditor5-font/**',
			'./packages/ckeditor5-fullscreen/**',
			'./packages/ckeditor5-heading/**',
			'./packages/ckeditor5-highlight/**',
			'./packages/ckeditor5-horizontal-line/**',
			'./packages/ckeditor5-html-embed/**',
			'./packages/ckeditor5-html-support/**',
			'./packages/ckeditor5-icons/**',
			'./packages/ckeditor5-image/**',
			'./packages/ckeditor5-indent/**',
			'./packages/ckeditor5-language/**',
			'./packages/ckeditor5-link/**',
			'./packages/ckeditor5-list/**',
			'./packages/ckeditor5-markdown-gfm/**',
			'./packages/ckeditor5-media-embed/**',
			'./packages/ckeditor5-mention/**',
			'./packages/ckeditor5-minimap/**',
			'./packages/ckeditor5-page-break/**',
			'./packages/ckeditor5-paragraph/**',
			'./packages/ckeditor5-paste-from-office/**',
			'./packages/ckeditor5-remove-format/**',
			'./packages/ckeditor5-restricted-editing/**',
			'./packages/ckeditor5-select-all/**',
			'./packages/ckeditor5-show-blocks/**',
			'./packages/ckeditor5-source-editing/**',
			'./packages/ckeditor5-special-characters/**',
			'./packages/ckeditor5-style/**',
			'./packages/ckeditor5-table/**',
			'./packages/ckeditor5-theme-lark/**',
			'./packages/ckeditor5-typing/**',
			'./packages/ckeditor5-ui/**',
			'./packages/ckeditor5-undo/**',
			'./packages/ckeditor5-upload/**',
			'./packages/ckeditor5-utils/**',
			'./packages/ckeditor5-watchdog/**',
			'./packages/ckeditor5-widget/**',
			'./packages/ckeditor5-word-count/**'
		],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'ckeditor5-rules/allow-imports-only-from-main-package-entry-point': 'error'
		}
	},
	{
		files: [ '**/tests/manual/**/*.@(js|cjs|mjs|ts)' ],

		languageOptions: {
			globals: {
				CKEditorInspector: true
			}
		}
	},
	{
		files: [ '**/docs/**/*.@(js|cjs|mjs)' ],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		languageOptions: {
			globals: {
				...globals.browser
			}
		},

		rules: {
			'ckeditor5-rules/ckeditor-imports': 'off'
		}
	},
	{
		extends: ckeditor5Config,

		files: [ '.changelog/**/*.md' ],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'ckeditor5-rules/validate-changelog-entry': [ 'error', {
				allowedScopes: [
					...projectPackages,
					'ckeditor5'
				],
				repositoryType: 'mono'
			} ]
		}
	}
] );
