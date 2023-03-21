/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

module.exports = {
	extends: 'ckeditor5',
	ignorePatterns: [
		// The CKEditor 5 core DLL build is created from JavaScript files.
		// ESLint should not process compiled TypeScript.
		'src/*.js'
	],
	rules: {
		'ckeditor5-rules/ckeditor-imports': 'error',
		'ckeditor5-rules/license-header': [ 'error', {
			headerLines: [
				'/**',
				' * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			]
		} ]
	},
	overrides: [
		{
			files: [ '**/*.ts' ],
			rules: {
				'@typescript-eslint/explicit-module-boundary-types': [
					'error',
					{
						'allowedNames': [ 'requires' ],
						'allowArgumentsExplicitlyTypedAsAny': true
					}
				]
			}
		},
		{
			files: [ '**/tests/**/*.js' ],
			rules: {
				'no-unused-expressions': 'off',
				'ckeditor5-rules/ckeditor-imports': 'off',
				'ckeditor5-rules/no-cross-package-imports': 'off'
			}
		},
		{
			files: [ '**/docs/**/*.js' ],
			rules: {
				'ckeditor5-rules/ckeditor-imports': 'off'
			}
		}
	]
};
