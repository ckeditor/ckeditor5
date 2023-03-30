/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

module.exports = {
	extends: 'ckeditor5',
	ignorePatterns: [
		'**/*.d.ts'
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
