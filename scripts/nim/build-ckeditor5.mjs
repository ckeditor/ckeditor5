#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { rm, copyFile } from 'fs/promises';
import chalk from 'chalk';
import {
	dist,
	generateCKEditor5BrowserBuild,
	generateCKEditor5NpmBuild,
	initializeCKEditor5NpmBuild
} from './utils.mjs';

( async () => {
	/**
	 * Step 1
	 */
	console.log( chalk.cyan( '1/3: Generating NPM build...' ) );

	await initializeCKEditor5NpmBuild();

	await rm( dist( 'ckeditor5.js' ) );
	await rm( dist( 'ckeditor5.js.map' ) );

	/**
	 * Step 2
	 */
	console.log( chalk.cyan( '2/3: Generating `ckeditor5.js` for the NPM build...' ) );

	await generateCKEditor5NpmBuild();

	await copyFile( dist( 'tmp/ckeditor5.js' ), dist( 'ckeditor5.js' ) );
	await copyFile( dist( 'tmp/ckeditor5.js.map' ), dist( 'ckeditor5.js.map' ) );
	await rm( dist( 'tmp' ), { recursive: true } );

	/**
	 * Step 3
	 */
	console.log( chalk.cyan( '3/3: Generating browser build...' ) );

	await generateCKEditor5BrowserBuild();
} )();
