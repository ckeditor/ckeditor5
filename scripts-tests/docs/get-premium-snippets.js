/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'esbuild';
import getPremiumSnippets from '../../scripts/docs/get-premium-snippets.mjs';

describe( 'getPremiumSnippets', () => {
	let directory;

	beforeEach( async () => {
		directory = await realpath( await mkdtemp( join( tmpdir(), 'ckeditor5-premium-snippets-' ) ) );
	} );

	afterEach( async () => {
		await rm( directory, { recursive: true, force: true } );
	} );

	it( 'finds premium entries through aliases, bundled helpers and dynamic imports, excluding unused imports', async () => {
		const imports = {
			'ckeditor5': '/assets/ckeditor5/ckeditor5.js',
			'ckeditor5-premium-features': '/assets/ckeditor5-premium-features/ckeditor5-premium-features.js',
			'ckeditor5-premium-features/': '/assets/ckeditor5-premium-features/',
			'@ckeditor/ckeditor5-example-premium': '/assets/ckeditor5-premium-features/ckeditor5-premium-features.js',
			'@ckeditor/ckeditor5-example-premium/dist/index.js': '/assets/ckeditor5-premium-features/ckeditor5-premium-features.js'
		};
		const sources = {
			'core': 'import "ckeditor5";',
			'premium': 'import "ckeditor5-premium-features";',
			'alias': 'import "@ckeditor/ckeditor5-example-premium";',
			'nested': 'import "./helper.js";',
			'dynamic': 'window.loadTranslation = () => import("ckeditor5-premium-features/translations/pl.js");',
			'unused': 'if (false) { import("ckeditor5-premium-features"); }'
		};

		await Promise.all( Object.entries( sources ).map( ( [ name, source ] ) =>
			writeFile( join( directory, `${ name }.js` ), source )
		) );
		await writeFile( join( directory, 'helper.js' ), 'import "@ckeditor/ckeditor5-example-premium/dist/index.js";' );

		const { metafile } = await build( {
			entryPoints: Object.keys( sources ).map( name => join( directory, `${ name }.js` ) ),
			outdir: join( directory, 'output' ),
			bundle: true,
			format: 'esm',
			metafile: true,
			write: false,
			external: Object.keys( imports )
		} );

		expect( getPremiumSnippets( metafile, imports ) ).toEqual( new Set(
			[ 'premium', 'alias', 'nested', 'dynamic' ].map( name => join( directory, `${ name }.js` ) )
		) );
	} );
} );
