#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import { rm, copyFile } from 'fs/promises';
import upath from 'upath';
import chalk from 'chalk';
import { build } from '@ckeditor/ckeditor5-dev-build-tools';
import constants from './release/utils/constants.js';

function dist( path ) {
	return upath.join( constants.CKEDITOR5_ROOT_PATH, 'dist', path );
}

( async () => {
	/**
	 * Paths to the `tsconfig` and `banner` files relative to the root of the repository.
	 */
	const tsconfig = 'tsconfig.dist.ckeditor5.json';
	const banner = 'scripts/banner.mjs';

	/**
	 * Step 1
	 */
	console.log( chalk.cyan( '1/3: Generating NPM build...' ) );

	await build( {
		output: dist( 'index.js' ),
		tsconfig,
		banner,
		sourceMap: true,
		external: [],

		/**
		 * Because this build runs first, it cleans up the old output folder
		 * and generates TypeScript declarations and translation files.
		 * We don't want to repeat this in other steps.
		 */
		clean: true,
		declarations: true,
		translations: 'packages/**/*.po'
	} );

	await rm( dist( 'index.js' ) );
	await rm( dist( 'index.js.map' ) );

	/**
	 * Step 2
	 */
	console.log( chalk.cyan( '2/3: Generating `index.js` for the NPM build...' ) );

	await build( {
		output: dist( 'tmp/index.js' ),
		tsconfig,
		banner,
		sourceMap: true,
		external: [
			'ckeditor5'
		]
	} );

	await copyFile( dist( 'tmp/index.js' ), dist( 'index.js' ) );
	await copyFile( dist( 'tmp/index.js.map' ), dist( 'index.js.map' ) );
	await rm( dist( 'tmp' ), { recursive: true } );

	/**
	 * Step 3
	 */
	console.log( chalk.cyan( '3/3: Generating browser build...' ) );

	await build( {
		output: dist( 'browser/index.js' ),
		tsconfig,
		banner,
		sourceMap: true,
		minify: true,
		browser: true,
		name: 'ckeditor5',
		external: []
	} );
} )();
