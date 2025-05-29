/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import globals from 'globals';
import { defineConfig } from 'eslint/config';
import ckeditor5Rules from 'eslint-plugin-ckeditor5-rules';
import ckeditor5Config from 'eslint-config-ckeditor5';
import ts from 'typescript-eslint';

import rootPkgJson from './package.json' with { type: 'json' };

const disallowedImports = Object.keys( rootPkgJson.devDependencies ).filter( pkgName => {
	return pkgName.match( /^(@ckeditor\/)?ckeditor5-(?!dev-)/ );
} );

export default defineConfig( [
	{
		ignores: [
			'.*/',
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
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
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
	}
] );
