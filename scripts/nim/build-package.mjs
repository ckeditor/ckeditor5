#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import upath from 'upath';
import fs from 'fs-extra';
import { build } from '@ckeditor/ckeditor5-dev-build-tools';

( async () => {
	const pkg = await fs.readJson( upath.join( process.cwd(), './package.json' ) );

	await build( {
		input: 'src/index.ts',
		output: upath.resolve( process.cwd(), './dist/index.js' ),
		tsconfig: 'tsconfig.dist.json',
		banner: '../../scripts/nim/banner.mjs',
		external: [
			'ckeditor5',
			...Object.keys( {
				...pkg.dependencies,
				...pkg.peerDependencies
			} )
		],
		clean: true,
		sourceMap: true,
		translations: '**/*.po'
	} );
} )();
