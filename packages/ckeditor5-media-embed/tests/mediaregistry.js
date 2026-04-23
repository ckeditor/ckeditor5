/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

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

			expect( availableProviders ).to.deep.equal( [ 'dailymotion', 'youtube', 'vimeo' ] );
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

			expect( availableProviders ).to.deep.equal( [ 'dailymotion', 'youtube', 'vimeo', 'spotify' ] );
		} );

		it( 'logs a warning when provider\'s name is not defined', () => {
			const consoleWarnStub = sinon.stub( console, 'warn' );

			const providers = [
				{ url: [ /dailymotion\.com/ ] },
				{ name: 'spotify', url: [] },
				{ name: 'youtube', url: [] },
				{ name: 'vimeo', url: [] }
			];

			const mediaRegistry = new MediaRegistry( {}, { providers } );
			const availableProviders = mediaRegistry.providerDefinitions.map( provider => provider.name );

			expect( availableProviders ).to.deep.equal( [ 'spotify', 'youtube', 'vimeo' ] );
			expect( consoleWarnStub.calledOnce ).to.equal( true );
			expect( consoleWarnStub.firstCall.args[ 0 ] ).to.match( /^media-embed-no-provider-name/ );
			expect( consoleWarnStub.firstCall.args[ 1 ] ).to.deep.equal( { provider: { url: [ /dailymotion\.com/ ] } } );
		} );
	} );

	describe( '_getMedia()', () => {
		let mediaRegistry, htmlSpy;

		beforeEach( () => {
			htmlSpy = sinon.spy();

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

			expect( media ).is.not.null;
			expect( media.url ).to.equal( 'https://www.youtube.com/watch?v=euqbMkM-QQk' );
		} );

		it( 'works fine for url with defined protocol', () => {
			const media = mediaRegistry._getMedia( 'https://youtube.com/watch?v=euqbMkM-QQk' );

			expect( media ).is.not.null;
			expect( media.url ).to.equal( 'https://youtube.com/watch?v=euqbMkM-QQk' );
		} );

		it( 'works fine for url with sub-domain without protocol', () => {
			const media = mediaRegistry._getMedia( 'www.youtube.com/watch?v=euqbMkM-QQk' );

			expect( media ).is.not.null;
			expect( media.url ).to.equal( 'https://www.youtube.com/watch?v=euqbMkM-QQk' );
		} );

		it( 'works fine for url without protocol', () => {
			const media = mediaRegistry._getMedia( 'youtube.com/watch?v=euqbMkM-QQk' );

			expect( media ).is.not.null;
			expect( media.url ).to.equal( 'https://youtube.com/watch?v=euqbMkM-QQk' );
		} );

		it( 'passes the entire match array to render function', () => {
			const media = mediaRegistry._getMedia( 'https://www.youtube.com/watch?v=euqbMkM-QQk&t=93' );

			media._getPreviewHtml();

			expect( htmlSpy.calledOnce ).to.equal( true );
			expect( htmlSpy.firstCall.args[ 0 ] ).to.deep.equal( [
				'youtube.com/watch?v=euqbMkM-QQk&t=93',
				'euqbMkM-QQk',
				'93'
			] );
		} );
	} );

	describe( 'isMediaResizable()', () => {
		let mediaRegistry;

		beforeEach( () => {
			mediaRegistry = new MediaRegistry( {}, {
				providers: [
					{
						name: 'youtube',
						url: /^youtu\.be\/(\w+)/
					},
					{
						name: 'spotify',
						url: /^open\.spotify\.com\/(track\/\w+)/,
						isResizable: false
					}
				]
			} );
		} );

		it( 'returns true for a provider without the isResizable flag', () => {
			expect( mediaRegistry.isMediaResizable( 'https://youtu.be/foo' ) ).to.be.true;
		} );

		it( 'returns false for a provider with isResizable: false', () => {
			expect( mediaRegistry.isMediaResizable( 'https://open.spotify.com/track/foo' ) ).to.be.false;
		} );

		it( 'returns true for a URL that matches no provider', () => {
			expect( mediaRegistry.isMediaResizable( 'https://example.com/unknown' ) ).to.be.true;
		} );

		it( 'returns true for an empty URL', () => {
			expect( mediaRegistry.isMediaResizable( '' ) ).to.be.true;
		} );

		it( 'returns true for a URL that matches a provider with isResizable: true explicitly', () => {
			const registry = new MediaRegistry( {}, {
				providers: [
					{ name: 'example', url: /^example\.com/, isResizable: true }
				]
			} );

			expect( registry.isMediaResizable( 'https://example.com' ) ).to.be.true;
		} );
	} );
} );
