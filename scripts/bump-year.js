#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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

require( '@ckeditor/ckeditor5-dev-env' )
	.bumpYear( {
		initialYear: '2003',
		globPatterns: [
			{ pattern: '*', options: { dot: true } }, // LICENSE.md, .eslintrc.js, etc.
			{ pattern: '!(build|coverage|node_modules|external)/**' }
		],
		cwd: process.cwd()
	} );
