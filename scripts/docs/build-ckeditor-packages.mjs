#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import url from 'url';
import upath from 'upath';
import fs from 'fs-extra';
import { CKEDITOR5_ROOT_PATH, CKEDITOR5_COMMERCIAL_PATH } from '../constants.mjs';
import generateCKEditor5DocsBuild from './generate-ckeditor5-docs-build.mjs';
import parseArguments from '../docs/parse-arguments.mjs';

buildCKEditorPackages()
	.catch( () => {
		process.exitCode = 1;
	} );

async function buildCKEditorPackages() {
	const options = parseArguments( process.argv.slice( 2 ) );

	console.log( 'Started building `ckeditor5`.' );

	const basePath = upath.join( CKEDITOR5_ROOT_PATH, 'build', 'docs-assets' );

	await fs.emptyDir( basePath );

	const output = path => upath.join( basePath, path );

	await generateCKEditor5DocsBuild( output( 'ckeditor5/ckeditor5.js' ) );

	console.log( 'Finished building `ckeditor5`.' );

	if ( options.skipCommercial ) {
		console.log( 'Skipping `ckeditor5-premium-features`.' );
	} else if ( await fs.pathExists( CKEDITOR5_COMMERCIAL_PATH ) ) {
		console.log( 'Started building `ckeditor5-premium-features`.' );

		const scriptPath = upath.join( CKEDITOR5_COMMERCIAL_PATH, 'scripts', 'docs', 'generate-ckeditor5-premium-features-docs-build.mjs' );
		const { href } = url.pathToFileURL( scriptPath );
		const { default: generateCKEditor5PremiumFeaturesDocsBuild } = await import( href );

		await generateCKEditor5PremiumFeaturesDocsBuild( output( 'ckeditor5-premium-features/ckeditor5-premium-features.js' ) );

		console.log( 'Finished building `ckeditor5-premium-features`.' );
	}
}
