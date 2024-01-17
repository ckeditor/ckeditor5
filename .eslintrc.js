/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
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
				' * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			]
		} ],
		'ckeditor5-rules/require-file-extensions-in-imports': [
			'error',
			{
				extensions: [ '.ts', '.js', '.json' ]
			}
		]
	},
	overrides: [
		{
			files: [ '**/tests/**/*.@(js|ts)' ],
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
