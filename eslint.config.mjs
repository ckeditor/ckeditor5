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

const disallowedPackageImportsPattern = `@ckeditor/ckeditor5-(?!${ allowedPackageNames.join( '|' ) })`;
const disallowedPackageImportsMessage = 'External `@ckeditor/ckeditor5-*` imports are forbidden.';

const disallowedRelativePathImportsPattern = [ './**/src/**', '../**/src/**' ];
const disallowedRelativePathImportsMessage = 'Imports to the `src` directory from within the `src` directory are forbidden.';

export default defineConfig( [
	{
		ignores: [
			'.*/',
			'!.changelog/',
			'build/**',
			'coverage/**',
			'coverage-vitest/**',
			'dist/**',
			'packages/*/build/**',
			'packages/*/coverage/**',
			'packages/*/dist/**',
			'packages/*/src/lib/**',
			'release/**',

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
			} ],
			'ckeditor5-rules/require-as-const-returns-in-methods': [ 'error', {
				methodNames: [ 'pluginName' ]
			} ]
		}
	},
	{
		files: [
			'packages/**/*.css',
			'docs/**/*.css'
		],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'ckeditor5-rules/license-header': [ 'error', {
				headerLines: [
					'/*',
					' * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.',
					' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options',
					' */'
				]
			} ]
		}
	},
	{
		// `ck-content-variable-name` is activated by the eslint-config-ckeditor5 only for `**/theme/**/*.css`.
		files: [ '**/theme/**/*.css' ],

		rules: {
			'ckeditor5-rules/ck-content-variable-name': [ 'error', {
				ignoredVariableSubstrings: [ '-suggestion-', '-comment-', '-color-base-' ]
			} ]
		}
	},
	{
		files: [ '**/*.css' ],

		rules: {
			// TODO: remove this entry once the upstream config enforces this.
			'css/no-important': 'error',

			// TODO (RTL): off pending a migration of physical properties/values to logical. Step 1
			// (required first): fix the ~10 logical-*value* cases in source - text-align/float/resize
			// `right`/`left`/`vertical` - which have no allow option, so they block enabling. Then, as a
			// gradual follow-up, replace `off` with the allow-list below (it permits the physical
			// properties/units already in use, silencing the bulk so only new ones are flagged) and
			// shrink that list over time as each property is migrated to logical.
			// 'css/prefer-logical-properties': [ 'error', {
			//     allowProperties: [
			//         // sizing
			//         'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
			//         // margin / padding
			//         'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
			//         'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
			//         // inset
			//         'top', 'bottom', 'left', 'right',
			//         // border (side / width / color)
			//         'border-top', 'border-bottom', 'border-left', 'border-right', 'border-top-width',
			//         'border-top-color', 'border-bottom-color', 'border-left-color',
			//         // border radius
			//         'border-top-left-radius', 'border-top-right-radius',
			//         'border-bottom-left-radius', 'border-bottom-right-radius',
			//         // overflow / misc
			//         'overflow-x', 'overflow-y', 'scroll-margin-top', 'overscroll-behavior-y'
			//     ],
			//     allowUnits: [ 'vh', 'vw' ]
			// } ],
			'css/prefer-logical-properties': 'off',

			// The features marked with TODO are used but are not yet baseline "widely available", so they are
			// temporarily white-listed locally. The rest are acceptable (supported in practice or handled by the build).
			// All TODOs should be fixed in source and have the exceptions removed afterwards.
			'css/use-baseline': [ 'error', {
				available: 'widely',

				allowSelectors: [
					// https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector
					// handled by LightningCSS at build (never ships nested)
					'nesting',
					// https://developer.mozilla.org/en-US/docs/Web/CSS/:has
					// Baseline 2023, all modern browsers
					'has'
				],

				allowProperties: [
					// https://developer.mozilla.org/en-US/docs/Web/CSS/user-select
					// Not Baseline because Safari has never shipped an unprefixed version - every usage in
					// this codebase already pairs it with `-webkit-user-select`, so this is a syntax
					// limitation, not a cross-browser behavior gap.
					'user-select',
					// https://developer.mozilla.org/en-US/docs/Web/CSS/resize
					// Not Baseline solely because Firefox for Android and Safari on iOS recognize it but apply
					// no effect (mobile browsers show no resize handle regardless of this property) - a no-op
					// gap on the browsers where it doesn't apply, not a real cross-browser risk.
					'resize',
					// https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap
					// Baseline "newly available" - already supported across major browsers since March
					// 2024 and on track to reach "widely available" around September 2026.
					'text-wrap',
					// TODO: fix https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior
					'transition-behavior',
					// https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior
					// https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-y
					// Not Baseline solely because of a partial-implementation caveat noting no effect on
					// non-scrollable containers - uniform across browsers and irrelevant to every usage here,
					// which is always on a genuinely scrollable element. Core behavior (preventing scroll
					// chaining) has been supported by Chrome, Firefox, Safari, and Edge since 2017-2022.
					'overscroll-behavior',
					'overscroll-behavior-y'
				],

				allowAtRules: [
					// TODO: fix https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style
					'starting-style'
				],

				allowPropertyValues: {
					// TODO: fix https://developer.mozilla.org/en-US/docs/Web/CSS/break-after
					'break-after': [ 'column' ],
					// TODO: fix https://developer.mozilla.org/en-US/docs/Web/CSS/break-before
					'break-before': [ 'avoid' ],
					// TODO: fix https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration
					'text-decoration': [ 'currentColor' ]
				}
			} ]
		}
	},
	{
		// Less strict checks for non-production code.
		files: [ '**/manual/**/*.css' ],

		rules: {
			'css/no-important': 'off',
			'css/prefer-logical-properties': 'off',
			'css/use-baseline': 'off'
		}
	},
	{
		files: [ 'packages/*/src/**/*.ts' ],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'ckeditor5-rules/validate-module-tag': 'error',
			'ckeditor5-rules/no-default-export': 'error',
			'ckeditor5-rules/allow-svg-imports-only-in-icons-package': 'error',
			'ckeditor5-rules/allow-css-imports-only-in-main-package-entry-point': 'error',
			'ckeditor5-rules/no-literal-dollar-root': [ 'error', {
				allowedPackages: [ 'ckeditor5-engine', 'ckeditor5-core' ],
				allowedCalls: [ 'is' ]
			} ],
			'ckeditor5-rules/require-explicit-data-context': 'error',
			'ckeditor5-rules/ckeditor-plugin-flags': [ 'error', {
				requiredFlags: [ {
					name: 'isOfficialPlugin',
					returnValue: true
				} ]
			} ],
			'@typescript-eslint/no-restricted-imports': [ 'error',
				{
					patterns: [
						{
							group: disallowedRelativePathImportsPattern,
							message: disallowedRelativePathImportsMessage
						},
						{
							regex: disallowedPackageImportsPattern,
							message: disallowedPackageImportsMessage
						},
						{
							regex: '^es-toolkit$',
							message: 'Import from `es-toolkit/compat` instead.'
						}
					]
				}
			]
		}
	},
	{
		files: [
			'packages/*/@(src|tests)/**/*.js',
			'**/docs/**/_snippets/**/*.js'
		],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'no-restricted-imports': [ 'error', {
				patterns: [
					{
						regex: disallowedPackageImportsPattern,
						message: disallowedPackageImportsMessage
					},
					{
						regex: '^es-toolkit$',
						message: 'Import from `es-toolkit/compat` instead.'
					}
				]
			} ]
		}
	},
	{
		files: [
			'packages/*/tests/**/*.ts'
		],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'@typescript-eslint/no-restricted-imports': [ 'error', {
				patterns: [
					{
						regex: disallowedPackageImportsPattern,
						message: disallowedPackageImportsMessage
					},
					{
						regex: '^es-toolkit$',
						message: 'Import from `es-toolkit/compat` instead.'
					}
				]
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
