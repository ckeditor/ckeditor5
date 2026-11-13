/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import { loadExternalMediaProviders } from '../src/externalmediaproviders.js';

const gumletConfig = {
	providers: [ {
		name: 'gumlet',
		url: [
			'^play\\.gumlet\\.io/embed/([a-zA-Z0-9_-]+)',
			'^gumlet\\.tv/watch/([a-zA-Z0-9_-]+)'
		],
		embedUrl: 'https://play.gumlet.io/embed/$1'
	} ]
};

function mockFetch( body, status = 200 ) {
	return vi.fn().mockResolvedValue( {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body
	} );
}

describe( 'loadExternalMediaProviders()', () => {
	it( 'loads and compiles URL patterns for a declarative provider', async () => {
		const fetcher = mockFetch( gumletConfig );
		const providers = await loadExternalMediaProviders( fetcher, '/media.json' );

		expect( fetcher ).toHaveBeenCalledWith( '/media.json', { credentials: 'same-origin' } );
		expect( providers ).toHaveLength( 1 );
		expect( providers[ 0 ].name ).toBe( 'gumlet' );

		for ( const url of [ 'play.gumlet.io/embed/example-123', 'gumlet.tv/watch/example-123' ] ) {
			const matched = providers[ 0 ].url.find( pattern => pattern.test( url ) );
			const match = url.match( matched );

			expect( match ).not.toBeNull();
			expect( providers[ 0 ].html( match ) ).toContain( 'src="https://play.gumlet.io/embed/example-123"' );
		}
	} );

	it( 'allows an absent optional config file', async () => {
		await expect( loadExternalMediaProviders( mockFetch( null, 404 ) ) ).resolves.toEqual( [] );
	} );

	it( 'rejects server errors rather than silently disabling providers', async () => {
		await expect( loadExternalMediaProviders( mockFetch( null, 500 ) ) ).rejects.toThrow( /HTTP 500/ );
	} );

	it( 'rejects invalid JSON schema', async () => {
		await expect( loadExternalMediaProviders( mockFetch( { providers: 'wrong' } ) ) ).rejects.toThrow( /Invalid/ );
	} );

	it( 'rejects unsafe embed URL protocols', async () => {
		const config = { providers: [ { name: 'unsafe', url: '^example\\.com/(.*)', embedUrl: 'javascript:alert(1)' } ] };
		await expect( loadExternalMediaProviders( mockFetch( config ) ) ).rejects.toThrow( /HTTPS/ );
	} );

	it( 'escapes values before writing them into iframe attributes', async () => {
		const config = { providers: [ {
			name: 'escaped',
			url: '^example\\.com/(.+)$',
			embedUrl: 'https://video.example.com/embed/$1'
		} ] };
		const providers = await loadExternalMediaProviders( mockFetch( config ) );
		const match = 'example.com/x" onload="alert(1)'.match( providers[ 0 ].url[ 0 ] );
		const html = providers[ 0 ].html( match );

		expect( html ).toContain( 'x%22%20onload%3D%22alert(1)' );
		expect( html ).not.toContain( 'onload="' );
	} );

	it( 'keeps encoded query parameters in the static template', async () => {
		const config = { providers: [ {
			name: 'query',
			url: '^example\\.com/([a-z0-9-]+)$',
			embedUrl: 'https://player.example.com/embed/$1?autoplay=0&muted=1'
		} ] };
		const providers = await loadExternalMediaProviders( mockFetch( config ) );

		expect( providers[ 0 ].html( 'example.com/video-id'.match( providers[ 0 ].url[ 0 ] ) ) )
			.toContain( 'src="https://player.example.com/embed/video-id?autoplay=0&amp;muted=1"' );
	} );
} );
