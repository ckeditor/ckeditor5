#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { bumpYear } from '@ckeditor/ckeditor5-dev-bump-year';

bumpYear( {
	cwd: process.cwd(),
	globPatterns: [
		{ // LICENSE.md, .eslintrc.js, etc.
			pattern: '*',
			options: {
				dot: true
			}
		},
		{
			pattern: '!(build|coverage|external|release)/**',
			options: {
				ignore: [
					'**/ckeditor5-*/build/**',
					'packages/ckeditor5-emoji/src/utils/isemojisupported.ts'
				]
			}
		},
		{
			pattern: '.husky/*'
		},
		{
			pattern: '.circleci/*'
		},
		{
			pattern: 'packages/*/.eslintrc.js'
		}
	]
} );
