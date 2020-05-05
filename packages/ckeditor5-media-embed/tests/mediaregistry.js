/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import MediaRegistry from '../src/mediaregistry';

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
							/^youtube\.com\/watch\?v=([\w-]+)/,
							/^youtube\.com\/v\/([\w-]+)/,
							/^youtube\.com\/embed\/([\w-]+)/,
							/^youtu\.be\/([\w-]+)/
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
			const media = mediaRegistry._getMedia( 'https://www.youtube.com/watch?v=euqbMkM-QQk' );

			media._getPreviewHtml();

			expect( htmlSpy.calledOnce ).to.equal( true );
			expect( htmlSpy.firstCall.args[ 0 ] ).to.deep.equal( [
				'youtube.com/watch?v=euqbMkM-QQk',
				'euqbMkM-QQk'
			] );
		} );
	} );
} );
