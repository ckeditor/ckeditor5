#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import chalk from 'chalk';
import { build } from '@ckeditor/ckeditor5-dev-build-tools';

( async () => {
	/**
	 * Paths to the `tsconfig` and `banner` files relative to the root of the repository.
	 */
	const tsconfig = 'tsconfig.ckeditor5.kowalski.json';
	const banner = 'scripts/banner.mjs';

	/**
	 * Generate NPM build.
	 */
	console.log( chalk.green( '1/3: Generating NPM build...' ) );

	await build( {
		input: 'src/index.ts',
		tsconfig,
		banner,
		sourceMap: true,

		/**
		 * Because this build runs first, it cleans up the old output folder
		 * and generates TypeScript declarations and translation files.
		 * We don't want to do this for other bundles.
		 */
		clean: true,
		declarations: true,
		translations: true
	} );

	/**
	 * Experimental: Generate bundled NPM build.
	 */
	console.log( chalk.green( '2/3: Generating bundled NPM build...' ) );

	await build( {
		input: 'src/index.browser.ts',
		output: 'dist/index.bundled.js',
		tsconfig,
		banner,
		sourceMap: true,
		bundle: true
	} );

	/**
	 * Generate browser build.
	 */
	console.log( chalk.green( '3/3: Generating browser build...' ) );

	await build( {
		input: 'src/index.browser.ts',
		output: 'dist/index.browser.js',
		tsconfig,
		banner,
		sourceMap: true,
		bundle: true,
		minify: true
	} );
} )();
