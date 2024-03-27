#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import { rm } from 'fs/promises';
import { createRequire } from 'module';
import upath from 'upath';
import { build } from '@ckeditor/ckeditor5-dev-build-tools';

function dist( path ) {
	return upath.join( process.cwd(), 'dist', path );
}

( async () => {
	const require = createRequire( import.meta.url );
	const pkg = require( upath.join( process.cwd(), 'package.json' ) );

	/**
	 * Use dynamic import when it no longer displays a warning
	 * that JSON imports are an experimental feature.
	 *
	 * const { default: pkg } = await import(
	 *   upath.join( process.cwd(), 'package.json' ),
	 *   { assert: { type: 'json' } }
	 * );
	 */

	await build( {
		input: 'src/index.ts',
		output: dist( 'index.js' ),
		tsconfig: 'tsconfig.kowalski.json',
		banner: '../../scripts/banner.mjs',
		external: Object.keys( {
			...pkg.dependencies,
			...pkg.peerDependencies
		} ),
		clean: true,
		sourceMap: true,
		declarations: true,
		translations: '**/*.po'
	} );

	await rm( dist( 'index.js' ) );
	await rm( dist( 'index.js.map' ) );
} )();
