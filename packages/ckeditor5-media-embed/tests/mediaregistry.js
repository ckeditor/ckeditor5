/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaRegistry } from '../src/mediaregistry.js';

describe( 'MediaRegistry', () => {
	describe( 'constructor()', () => {
		it( 'filters out providers that should be removed', () => {
			const providers = [
				{ name: 'dailymotion', url: [] },
				{ name: 'spotify', url: [] },
				{ name: 'youtube', url: [] },
				{ name: 'vimeo', url: [] }
			];
			const removeProviders = [ 'spotify' ];

			const mediaRegistry = new MediaRegistry( {}, { providers, removeProviders } );
			const availableProviders = mediaRegistry.providerDefinitions.map( provider => provider.name );

			expect( availableProviders ).toEqual( [ 'dailymotion', 'youtube', 'vimeo' ] );
		} );

		it( 'allows extending providers using `extraProviders` option', () => {
			const providers = [
				{ name: 'dailymotion', url: [] },
				{ name: 'youtube', url: [] },
				{ name: 'vimeo', url: [] }
			];
			const extraProviders = [
				{ name: 'spotify', url: [] }
			];

			const mediaRegistry = new MediaRegistry( {}, { providers, extraProviders } );
			const availableProviders = mediaRegistry.providerDefinitions.map( provider => provider.name );

			expect( availableProviders ).toEqual( [ 'dailymotion', 'youtube', 'vimeo', 'spotify' ] );
		} );

		it( 'logs a warning when provider\'s name is not defined', () => {
			const consoleWarnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const providers = [
				{ url: [ /dailymotion\.com/ ] },
				{ name: 'spotify', url: [] },
				{ name: 'youtube', url: [] },
				{ name: 'vimeo', url: [] }
			];

			const mediaRegistry = new MediaRegistry( {}, { providers } );
			const availableProviders = mediaRegistry.providerDefinitions.map( provider => provider.name );

			expect( availableProviders ).toEqual( [ 'spotify', 'youtube', 'vimeo' ] );
			expect( consoleWarnStub ).toHaveBeenCalledOnce();
			expect( consoleWarnStub.mock.calls[ 0 ][ 0 ] ).toMatch( /^media-embed-no-provider-name/ );
			expect( consoleWarnStub.mock.calls[ 0 ][ 1 ] ).toEqual( { provider: { url: [ /dailymotion\.com/ ] } } );

			vi.restoreAllMocks();
		} );
	} );

	describe( '_getMedia()', () => {
		let mediaRegistry, htmlSpy;

		beforeEach( () => {
			htmlSpy = vi.fn();

			mediaRegistry = new MediaRegistry( {}, {
				providers: [
					{
						name: 'youtube',
						url: [
							/^(?:m\.)?youtube\.com\/watch\?v=([\w-]+)(?:&t=(\d+))?/,
							/^(?:m\.)?youtube\.com\/v\/([\w-]+)(?:\?t=(\d+))?/,
							/^youtube\.com\/embed\/([\w-]+)(?:\?start=(\d+))?/,
							/^youtu\.be\/([\w-]+)(?:\?t=(\d+))?/
						],
						html: htmlSpy
					}
				]
			} );
		} );

		it( 'works fine for url with sub-domain and the protocol', () => {
			const media = mediaRegistry._getMedia( 'https://www.youtube.com/watch?v=euqbMkM-QQk' );

			expect( media ).not.toBeNull();
			expect( media.url ).toBe( 'https://www.youtube.com/watch?v=euqbMkM-QQk' );
		} );

		it( 'works fine for url with defined protocol', () => {
			const media = mediaRegistry._getMedia( 'https://youtube.com/watch?v=euqbMkM-QQk' );

			expect( media ).not.toBeNull();
			expect( media.url ).toBe( 'https://youtube.com/watch?v=euqbMkM-QQk' );
		} );

		it( 'works fine for url with sub-domain without protocol', () => {
			const media = mediaRegistry._getMedia( 'www.youtube.com/watch?v=euqbMkM-QQk' );

			expect( media ).not.toBeNull();
			expect( media.url ).toBe( 'https://www.youtube.com/watch?v=euqbMkM-QQk' );
		} );

		it( 'works fine for url without protocol', () => {
			const media = mediaRegistry._getMedia( 'youtube.com/watch?v=euqbMkM-QQk' );

			expect( media ).not.toBeNull();
			expect( media.url ).toBe( 'https://youtube.com/watch?v=euqbMkM-QQk' );
		} );

		it( 'passes the entire match array to render function', () => {
			const media = mediaRegistry._getMedia( 'https://www.youtube.com/watch?v=euqbMkM-QQk&t=93' );

			media._getPreviewHtml();

			expect( htmlSpy ).toHaveBeenCalledOnce();
			expect( Array.from( htmlSpy.mock.calls[ 0 ][ 0 ] ) ).toEqual( [
				'youtube.com/watch?v=euqbMkM-QQk&t=93',
				'euqbMkM-QQk',
				'93'
			] );
		} );
	} );
} );
