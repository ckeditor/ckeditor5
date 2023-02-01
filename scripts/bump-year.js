#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

/*

Usage:
node scripts/bump-year.js

Full command to update the entire project:
git pull && node scripts/bump-year.js

And after reviewing the changes:
git commit -am "Internal: Bumped the year." && git push

*/

require( '@ckeditor/ckeditor5-dev-bump-year' )
	.bumpYear( {
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
