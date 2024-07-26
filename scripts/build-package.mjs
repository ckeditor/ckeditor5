#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import { createRequire } from 'module';
import upath from 'upath';
import { build } from '@ckeditor/ckeditor5-dev-build-tools';

( async () => {
	const require = createRequire( import.meta.url );
	const pkg = require( upath.resolve( process.cwd(), './package.json' ) );

	await build( {
		input: 'src/index.ts',
		output: upath.resolve( process.cwd(), './dist/index.js' ),
		tsconfig: 'tsconfig.dist.json',
		banner: '../../scripts/banner.mjs',
		external: [
			'ckeditor5',
			...Object.keys( {
				...pkg.dependencies,
				...pkg.peerDependencies
			} )
		],
		clean: true,
		sourceMap: true,
		declarations: true,
		translations: '**/*.po'
	} );
} )();
