/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import snippetAdapter from '../../scripts/docs/snippetadapter.mjs';

// Keep the fixtures independent of the commercial repository and its license configuration.
vi.mock( '../../scripts/constants.mjs', () => ( {
	CKEDITOR5_ROOT_PATH: '/ckeditor5-snippet-fixture',
	CKEDITOR5_COMMERCIAL_PATH: '/ckeditor5-snippet-fixture'
} ) );

describe( 'snippetAdapter asset loading', () => {
	let directory;
	let snippets;
	let input;
	let output;

	beforeEach( async () => {
		directory = await mkdtemp( join( tmpdir(), 'ckeditor5-snippet-adapter-' ) );
		input = join( directory, 'input', 'latest', '_snippets' );
		output = join( directory, 'output', 'latest' );
		snippets = new Set();

		vi.spyOn( console, 'log' ).mockImplementation( () => {} );

		await mkdir( join( input, 'examples' ), { recursive: true } );
		await writeFile( join( input, 'examples', 'bootstrap-ui.html' ), page() );
		await writeFile( join( input, 'examples', 'bootstrap-ui.js' ), '' );
	} );

	afterEach( async () => {
		await rm( directory, { recursive: true, force: true } );
	} );

	it( 'adds premium assets only to documents whose emitted snippets use them, retaining core and CKBox assets', async () => {
		await addSnippet( 'core', 'core', 'import "ckeditor5";' );
		await addSnippet( 'premium', 'premium', 'import "ckeditor5-premium-features";' );
		await addSnippet( 'mixed', 'core', 'import "ckeditor5";' );
		await addSnippet( 'mixed', 'premium', 'import "ckeditor5-premium-features";' );
		await addSnippet( 'html-only', 'html-only' );
		await addSnippet( 'unused', 'unused', 'if (false) { import("ckeditor5-premium-features"); }' );

		await snippetAdapter( snippets, {}, {
			getSnippetPlaceholder: name => `<!--SNIPPET: ${ name }-->`
		} );

		const ckboxDirectory = join( output, 'assets', 'ckbox' );
		const getChunkImports = source => Array.from(
			source.matchAll( /from\s*["'](\.\/chunk-[^"']+\.js)["']/g ),
			match => match[ 1 ]
		);
		const ckboxChunks = getChunkImports( await readFile( join( ckboxDirectory, 'ckbox.js' ), 'utf8' ) );
		const uploaderChunks = getChunkImports( await readFile( join( ckboxDirectory, 'ckboxWidget.js' ), 'utf8' ) );
		const sharedChunks = ckboxChunks.filter( chunk => uploaderChunks.includes( chunk ) );

		// The two module entry points must share their runtime, and every shared chunk must be available immediately.
		expect( sharedChunks.length ).toBeGreaterThan( 0 );

		for ( const chunk of sharedChunks ) {
			expect( await readFile( join( ckboxDirectory, chunk ), 'utf8' ) ).not.toBe( '' );
		}

		for ( const name of [ 'core', 'premium', 'mixed', 'html-only', 'unused' ] ) {
			const content = await readFile( join( output, `${ name }.html` ), 'utf8' );
			const assetTags = content.match( /<link[^>]*>|<style>[^]*?<\/style>/g ).join( '\n' );

			expect( assetTags.includes( '/ckeditor5-premium-features/ckeditor5-premium-features.js' ) ).toBe(
				[ 'premium', 'mixed' ].includes( name )
			);
			expect( assetTags.includes( '/ckeditor5-premium-features/ckeditor5-premium-features.css' ) ).toBe(
				[ 'premium', 'mixed' ].includes( name )
			);
			expect( assetTags ).toContain( '/ckeditor5/ckeditor5.js' );
			expect( assetTags ).toContain( '/ckeditor5/ckeditor5.css' );
			expect( assetTags ).toContain( '/ckbox/ckbox.js' );
			expect( assetTags ).toContain( '/ckbox/ckboxWidget.js' );
			expect( assetTags ).toContain( '/ckbox/ckbox.css' );

			for ( const chunk of sharedChunks ) {
				expect( assetTags ).toContain( `<link rel="modulepreload" href="/assets/ckbox/${ chunk.slice( 2 ) }">` );
			}

			expect( content ).toContain( 'window.CKBox = Object.assign( {}, CKBox, CKBoxUploader );' );
			expect( content ).not.toContain( '<!--SNIPPET:' );
		}
	} );

	async function addSnippet( documentName, snippetName, source ) {
		const html = join( input, `${ snippetName }.html` );
		const js = source === undefined ? undefined : join( input, `${ snippetName }.js` );
		const destinationPath = join( output, `${ documentName }.html` );

		await mkdir( dirname( destinationPath ), { recursive: true } );
		await writeFile( html, `<p>${ snippetName }</p>` );

		if ( js ) {
			await writeFile( js, source );
		}

		snippets.add( {
			destinationPath,
			outputPath: join( output, 'snippets' ),
			snippetName,
			snippetSources: { html, js }
		} );

		const placeholders = Array.from( snippets )
			.filter( snippet => snippet.destinationPath === destinationPath )
			.map( snippet => `<!--SNIPPET: ${ snippet.snippetName }-->` )
			.join( '\n' );

		await writeFile( destinationPath, page( placeholders ) );
	}
} );

function page( content = '' ) {
	return '<html><head><!--UMBERTO: SNIPPET: HEAD--><!--UMBERTO: SNIPPET: CSS--></head>' +
		`<body>${ content }<!--UMBERTO: SNIPPET: JS--></body></html>`;
}
