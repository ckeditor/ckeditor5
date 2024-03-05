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
		sourceMap: true,
		declarations: true,
		translations: true,
		clean: true,
		tsconfig,
		banner
	} );

	/**
	 * Experimental: Generate bundled NPM build.
	 */
	console.log( chalk.green( '2/3: Generating bundled NPM build...' ) );

	await build( {
		input: 'src/index.browser.ts',
		output: 'dist/index.bundled.js',
		sourceMap: true,
		bundle: true,
		tsconfig,
		banner
	} );

	/**
	 * Generate browser build.
	 */
	console.log( chalk.green( '3/3: Generating browser build...' ) );

	await build( {
		input: 'src/index.browser.ts',
		output: 'dist/index.browser.js',
		sourceMap: true,
		bundle: true,
		minify: true,
		tsconfig,
		banner
	} );
} )();
