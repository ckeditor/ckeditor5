#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

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
			pattern: '!(build|coverage|external)/**',
			options: {
				ignore: [
					'**/ckeditor5-*/build/**',
					'**/ckeditor5-*/lang/translations/*.po'
				]
			}
		},
		{
			pattern: '.husky/*'
		},
		{
			pattern: 'packages/*/.eslintrc.js'
		}
	]
} );
