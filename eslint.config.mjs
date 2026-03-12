/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { readdirSync } from 'node:fs';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import ckeditor5Rules from 'eslint-plugin-ckeditor5-rules';
import ckeditor5Config from 'eslint-config-ckeditor5';
import { CKEDITOR5_PACKAGES_PATH } from './scripts/constants.mjs';

const projectPackages = readdirSync( CKEDITOR5_PACKAGES_PATH, { withFileTypes: true } )
	.filter( dirent => dirent.isDirectory() )
	.map( dirent => dirent.name );

const allowedPackageNames = [
	'inspector',
	'mermaid',
	...projectPackages
		.map( projectPackage => projectPackage.replace( /ckeditor5-?/, '' ) )
		.filter( Boolean )
];

const disallowedImportsPattern = `@ckeditor/ckeditor5-(?!${ allowedPackageNames.join( '|' ) })`;
const disallowedImportsMessage = 'External `@ckeditor/ckeditor5-*` imports are forbidden.';

export default defineConfig( [
	{
		ignores: [
			'.*/',
			'!.changelog/',
			'build/**',
			'coverage/**',
			'dist/**',
			'packages/*/build/**',
			'packages/*/dist/**',
			'packages/*/src/lib/**',
			'release/**',

			// The CKEditor 5 core DLL build is created from JavaScript files.
			// ESLint should not process compiled TypeScript.
			'packages/ckeditor5/src/*.js',
			'**/*.d.ts',

			'packages/ckeditor5-emoji/src/utils/isemojisupported.ts',

			// This file includes JSX which eslint can't parse without additional configuration.
			'docs/_snippets/framework/tutorials/using-react-in-widget.js',

			// Editor builds in memory leak detection test.
			'scripts/memory/assets/'
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
					' * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.',
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
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'ckeditor5-rules/no-default-export': 'error',
			'ckeditor5-rules/allow-svg-imports-only-in-icons-package': 'error',
			'ckeditor5-rules/ckeditor-plugin-flags': [ 'error', {
				requiredFlags: [ {
					name: 'isOfficialPlugin',
					returnValue: true
				} ]
			} ]
		}
	},
	{
		files: [
			'packages/*/@(src|tests)/**/*.js',
			'**/docs/**/_snippets/**/*.js',
			'src/**/*.js'
		],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'no-restricted-imports': [ 'error', {
				patterns: [ {
					regex: disallowedImportsPattern,
					message: disallowedImportsMessage
				} ]
			} ]
		}
	},
	{
		files: [
			'packages/*/@(src|tests)/**/*.ts',
			'src/**/*.ts'
		],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'@typescript-eslint/no-restricted-imports': [ 'error', {
				patterns: [ {
					regex: disallowedImportsPattern,
					message: disallowedImportsMessage
				} ]
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
			'ckeditor5-rules/allow-imports-only-from-main-package-entry-point': 'error',
			'ckeditor5-rules/ckeditor-imports': 'off',
			'ckeditor5-rules/no-cross-package-imports': 'off',
			'mocha/no-pending-tests': 'off'
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
		files: [ 'scripts/memory/page-test.js' ],

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
				allowedScopes: projectPackages,
				repositoryType: 'mono'
			} ]
		}
	}
] );
