#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import upath from 'upath';
import { build } from '@ckeditor/ckeditor5-dev-build-tools';

( async () => {
	const { default: pkg } = await import(
		upath.resolve( process.cwd(), './package.json' ),
		{ with: { type: 'json' } }
	);

	await build( {
		input: 'src/index.ts',
		output: upath.resolve( process.cwd(), './dist/index.js' ),
		tsconfig: 'tsconfig.kowalski.json',
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
