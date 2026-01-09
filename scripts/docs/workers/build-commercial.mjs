#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import url from 'node:url';
import upath from 'upath';
import { CKEDITOR5_COMMERCIAL_PATH, DOCUMENTATION_ASSETS_PATH, IS_ISOLATED_REPOSITORY } from '../../constants.mjs';

try {
	if ( process.argv.includes( '--skip-commercial' ) || IS_ISOLATED_REPOSITORY ) {
		console.log( 'Skipping `ckeditor5-premium-features`.' );
	} else {
		console.log( 'Started building `ckeditor5-premium-features`.' );

		const scriptPath = upath.join( CKEDITOR5_COMMERCIAL_PATH, 'scripts', 'docs', 'generate-ckeditor5-premium-features-docs-build.mjs' );
		const { href } = url.pathToFileURL( scriptPath );
		const { default: generateCKEditor5PremiumFeaturesDocsBuild } = await import( href );

		await generateCKEditor5PremiumFeaturesDocsBuild(
			upath.join( DOCUMENTATION_ASSETS_PATH, 'ckeditor5-premium-features', 'ckeditor5-premium-features.js' ),
			process.argv.includes( '--skip-obfuscation' )
		);

		console.log( 'Finished building `ckeditor5-premium-features`.' );
	}
} catch ( error ) {
	console.error( error );
	process.exitCode = 1;
}
