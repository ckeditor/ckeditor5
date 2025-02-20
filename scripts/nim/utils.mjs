/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import fs from 'fs-extra';
import { build } from '@ckeditor/ckeditor5-dev-build-tools';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';

const tsconfig = upath.resolve( CKEDITOR5_ROOT_PATH, 'tsconfig.dist.ckeditor5.json' );
const banner = upath.resolve( CKEDITOR5_ROOT_PATH, 'scripts/nim/banner.mjs' );

export function dist( path ) {
	return upath.join( CKEDITOR5_ROOT_PATH, 'dist', path );
}

export function initializeCKEditor5NpmBuild( overrides = {} ) {
	return build( {
		output: dist( 'ckeditor5.js' ),
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
		translations: 'packages/**/*.po',
		...overrides
	} );
}

export function generateCKEditor5NpmBuild( overrides = {} ) {
	return build( {
		output: dist( 'tmp/ckeditor5.js' ),
		tsconfig,
		banner,
		sourceMap: true,
		external: [
			'ckeditor5'
		],
		...overrides
	} );
}

export function generateCKEditor5BrowserBuild( overrides = {} ) {
	return build( {
		output: dist( 'browser/ckeditor5.js' ),
		tsconfig,
		banner,
		sourceMap: true,
		minify: true,
		browser: true,
		name: 'CKEDITOR',
		external: [],
		...overrides
	} );
}

export async function generateCKEditor5PackageBuild( packagePath, overrides = {} ) {
	const pkg = await fs.readJson( upath.join( packagePath, 'package.json' ) );

	return build( {
		input: 'src/index.ts',
		output: upath.resolve( packagePath, 'dist/index.js' ),
		tsconfig: 'tsconfig.dist.json',
		banner,
		external: [
			'ckeditor5',
			...Object.keys( {
				...pkg.dependencies,
				...pkg.peerDependencies
			} )
		],
		clean: true,
		sourceMap: true,
		translations: '**/*.po',
		...overrides
	} );
}
