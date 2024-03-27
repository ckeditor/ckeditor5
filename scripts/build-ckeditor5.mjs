#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import upath from 'upath';
import chalk from 'chalk';
import { build } from '@ckeditor/ckeditor5-dev-build-tools';

function dist( path ) {
	return upath.join( process.cwd(), 'dist', path );
}

( async () => {
	/**
	 * Paths to the `tsconfig` and `banner` files relative to the root of the repository.
	 */
	const tsconfig = 'tsconfig.ckeditor5.kowalski.json';
	const banner = 'scripts/banner.mjs';

	/**
	 * Step 1
	 */
	console.log( chalk.green( '1/2: Generating NPM build...' ) );

	await build( {
		output: dist( 'index.js' ),
		tsconfig,
		banner,
		external: [],
		sourceMap: true,

		/**
		 * Because this build runs first, it cleans up the old output folder
		 * and generates TypeScript declarations and translation files.
		 * We don't want to do this for other bundles.
		 */
		clean: true,
		declarations: true,
		translations: 'packages/**/*.po'
	} );

	/**
	 * Step 2
	 */
	console.log( chalk.green( '2/2: Generating browser build...' ) );

	await build( {
		output: dist( 'index.browser.js' ),
		tsconfig,
		banner,
		external: [],
		sourceMap: true,
		minify: true
	} );
} )();
