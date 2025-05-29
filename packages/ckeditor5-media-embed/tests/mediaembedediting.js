/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import MediaEmbedEditing from '../src/mediaembedediting.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { escapeRegExp } from 'es-toolkit/compat';

describe( 'MediaEmbedEditing', () => {
	let editor, model, doc, view;

	testUtils.createSinonSandbox();

	const testProviders = {
		A: {
			name: 'A',
			url: /^foo\.com\/(\w+)/,
			html: match => `A, id=${ match[ 1 ] }`
		},
		B: {
			name: 'B',
			url: /^bar\.com\/(\w+)/,
			html: match => `B, id=${ match[ 1 ] }`
		},
		C: {
			name: 'C',
			url: /^\w+\.com\/(\w+)/,
			html: match => `C, id=${ match[ 1 ] }`
		},

		extraA: {
			name: 'extraA',
			url: /^foo\.com\/(\w+)/,
			html: match => `extraA, id=${ match[ 1 ] }`
		},
		extraB: {
			name: 'extraB',
			url: /^\w+\.com\/(\w+)/,
			html: match => `extraB, id=${ match[ 1 ] }`
		},

		previewLess: {
			name: 'preview-less',
			url: /^https:\/\/preview-less/
		},
		allowEverything: {
			name: 'allow-everything',
			url: /(.*)/,
			html: match => `allow-everything, id=${ match[ 1 ] }`
		}
	};

	afterEach( () => {
		sinon.restore();
	} );

	it( 'should be named', () => {
		expect( MediaEmbedEditing.pluginName ).to.equal( 'MediaEmbedEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedEditing.isPremiumPlugin ).to.be.false;
	} );

	describe( 'constructor()', () => {
		describe( 'configuration', () => {
			describe( '#providers', () => {
				it( 'should warn when provider has no name', () => {
					const consoleWarnStub = sinon.stub( console, 'warn' );
					const provider = {
						url: /.*/
					};

					return createTestEditor( {
						providers: [ provider ]
					} ).then( () => {
						expect( consoleWarnStub.calledOnce ).to.equal( true );
						expect( consoleWarnStub.firstCall.args[ 0 ] ).to.match( /^media-embed-no-provider-name/ );
						expect( consoleWarnStub.firstCall.args[ 1 ].provider ).to.deep.equal( provider );
					} );
				} );

				it( 'can override all providers', () => {
					return createTestEditor( {
						providers: []
					} ).then( editor => {
						editor.setData( '<figure class="media"><div data-oembed-url="foo.com"></div></figure>' );

						expect( getViewData( editor.editing.view, { withoutSelection: true, renderRawElements: true } ) ).to.equal( '' );
					} );
				} );

				it( 'upcast media according to the order', () => {
					return createTestEditor( {
						providers: [
							testProviders.A,
							testProviders.B,
							testProviders.C
						]
					} ).then( editor => {
						editor.setData( '<figure class="media"><div data-oembed-url="foo.com/123"></div></figure>' );

						expect( getViewData( editor.editing.view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://foo.com/123">' +
									'A, id=123' +
								'</div>' +
							'</figure>'
						);

						editor.setData( '<figure class="media"><div data-oembed-url="bar.com/123"></div></figure>' );

						expect( getViewData( editor.editing.view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://bar.com/123">' +
									'B, id=123' +
								'</div>' +
							'</figure>'
						);

						editor.setData( '<figure class="media"><div data-oembed-url="anything.com/123"></div></figure>' );

						expect( getViewData( editor.editing.view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://anything.com/123">' +
									'C, id=123' +
								'</div>' +
							'</figure>'
						);
					} );
				} );

				describe( 'default value', () => {
					beforeEach( () => {
						return createTestEditor()
							.then( newEditor => {
								editor = newEditor;
								view = editor.editing.view;
							} );
					} );

					describe( 'with preview', () => {
						it( 'upcasts the URL (dailymotion)', () => {
							testMediaUpcast( [
								'https://www.dailymotion.com/video/foo',
								'www.dailymotion.com/video/foo',
								'dailymotion.com/video/foo',
								'https://dai.ly/foo',
								'dai.ly/foo'
							],
							'<div style="position: relative; padding-bottom: 100%; height: 0; ">' +
								'<iframe src="https://www.dailymotion.com/embed/video/foo" ' +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" width="480" height="270" allowfullscreen="" allow="autoplay">' +
								'</iframe>' +
							'</div>' );
						} );

						describe( 'spotify', () => {
							it( 'upcasts the URL (artist)', () => {
								testMediaUpcast( [
									'https://www.open.spotify.com/artist/foo',
									'www.open.spotify.com/artist/foo',
									'open.spotify.com/artist/foo'
								],
								'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 126%;">' +
									'<iframe src="https://open.spotify.com/embed/artist/foo" ' +
										'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
										'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
									'</iframe>' +
								'</div>' );
							} );

							it( 'upcasts the URL (album)', () => {
								testMediaUpcast( [
									'https://www.open.spotify.com/album/foo',
									'www.open.spotify.com/album/foo',
									'open.spotify.com/album/foo'
								],
								'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 126%;">' +
									'<iframe src="https://open.spotify.com/embed/album/foo" ' +
										'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
										'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
									'</iframe>' +
								'</div>' );
							} );

							it( 'upcasts the URL (track)', () => {
								testMediaUpcast( [
									'https://www.open.spotify.com/track/foo',
									'www.open.spotify.com/track/foo',
									'open.spotify.com/track/foo'
								],
								'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 126%;">' +
									'<iframe src="https://open.spotify.com/embed/track/foo" ' +
										'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
										'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
									'</iframe>' +
								'</div>' );
							} );
						} );

						it( 'upcasts the URL (youtube)', () => {
							testMediaUpcast( [
								'https://www.youtube.com/shorts/foo',
								'www.youtube.com/shorts/foo',
								'youtube.com/shorts/foo',

								'https://www.youtube.com/watch?v=foo',
								'www.youtube.com/watch?v=foo',
								'youtube.com/watch?v=foo',
								'https://m.youtube.com/watch?v=foo',
								'm.youtube.com/watch?v=foo',

								'https://www.youtube.com/v/foo',
								'www.youtube.com/v/foo',
								'youtube.com/v/foo',
								'https://m.youtube.com/v/foo',
								'm.youtube.com/v/foo',

								'https://www.youtube.com/embed/foo',
								'www.youtube.com/embed/foo',
								'youtube.com/embed/foo',

								'https://youtu.be/foo',
								'youtu.be/foo'
							],
							'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
								'<iframe src="https://www.youtube.com/embed/foo" ' +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="">' +
								'</iframe>' +
							'</div>' );
						} );

						// See: https://github.com/ckeditor/ckeditor5-media-embed/issues/26
						it( 'upcasts the URL that contains a dash (youtube)', () => {
							testMediaUpcast( [
								'https://www.youtube.com/watch?v=euqbMkM-QQk'
							],
							'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
								'<iframe src="https://www.youtube.com/embed/euqbMkM-QQk" ' +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="">' +
								'</iframe>' +
							'</div>' );
						} );

						it( 'upcasts the URL that contains a timestamp', () => {
							testMediaUpcast( [
								'https://youtu.be/aEZw6KFTm6s?t=93'
							],
							'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
								'<iframe src="https://www.youtube.com/embed/aEZw6KFTm6s?start=93" ' +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="">' +
								'</iframe>' +
							'</div>' );
						} );

						it( 'upcasts the URL (vimeo)', () => {
							testMediaUpcast( [
								'https://www.vimeo.com/1234',
								'www.vimeo.com/1234',
								'vimeo.com/1234',

								'https://www.vimeo.com/foo/foo/video/1234',
								'www.vimeo.com/foo/foo/video/1234',
								'vimeo.com/foo/foo/video/1234',

								'https://www.vimeo.com/album/foo/video/1234',
								'www.vimeo.com/album/foo/video/1234',
								'vimeo.com/album/foo/video/1234',

								'https://www.vimeo.com/channels/foo/1234',
								'www.vimeo.com/channels/foo/1234',
								'vimeo.com/channels/foo/1234',

								'https://www.vimeo.com/groups/foo/videos/1234',
								'www.vimeo.com/groups/foo/videos/1234',
								'vimeo.com/groups/foo/videos/1234',

								'https://www.vimeo.com/ondemand/foo/1234',
								'www.vimeo.com/ondemand/foo/1234',
								'vimeo.com/ondemand/foo/1234',

								'https://www.player.vimeo.com/video/1234',
								'www.player.vimeo.com/video/1234',
								'player.vimeo.com/video/1234'
							],
							'<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
								'<iframe src="https://player.vimeo.com/video/1234" ' +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
									'frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen="">' +
								'</iframe>' +
							'</div>' );
						} );
					} );

					describe( 'preview-less', () => {
						it( 'upcasts the URL (instagram)', () => {
							testMediaUpcast( [
								'https://www.instagram.com/p/foo',
								'www.instagram.com/p/foo',
								'instagram.com/p/foo',

								'https://www.instagram.com/reel/Foo/',
								'www.instagram.com/reel/Foo/',
								'instagram.com/reel/Foo/'
							] );
						} );

						it( 'upcasts the URL (twitter)', () => {
							testMediaUpcast( [
								'https://www.twitter.com/foo/bar',
								'www.twitter.com/foo/bar',
								'twitter.com/foo/bar',

								'https://www.x.com/foo/bar',
								'www.x.com/foo/bar',
								'x.com/foo/bar'
							] );
						} );

						it( 'upcasts the URL (google maps)', () => {
							testMediaUpcast( [
								'https://www.google.com/maps/foo',
								'www.google.com/maps/foo',
								'google.com/maps/foo'
							] );
						} );

						it( 'upcasts the URL (google maps short URL)', () => {
							testMediaUpcast( [
								'https://goo.gl/maps/foo',
								'goo.gl/maps/foo'
							] );
						} );

						it( 'upcasts the URL (google maps for Android)', () => {
							testMediaUpcast( [
								'https://maps.google.com',
								'https://maps.app.goo.gl',
								'maps.google.com',
								'maps.app.goo.gl'
							] );
						} );

						it( 'upcasts the URL (flickr)', () => {
							testMediaUpcast( [
								'https://www.flickr.com/foo/bar',
								'www.flickr.com/foo/bar',
								'flickr.com/foo/bar'
							] );
						} );

						it( 'upcasts the URL (facebook)', () => {
							testMediaUpcast( [
								'https://www.facebook.com/foo/bar',
								'www.facebook.com/foo/bar',
								'facebook.com/foo/bar'
							] );
						} );
					} );
				} );
			} );

			describe( '#extraProviders', () => {
				it( 'should warn when provider has no name', () => {
					const consoleWarnStub = sinon.stub( console, 'warn' );
					const provider = {
						url: /.*/
					};

					return createTestEditor( {
						extraProviders: [ provider ]
					} ).then( () => {
						expect( consoleWarnStub.calledOnce ).to.equal( true );
						expect( consoleWarnStub.firstCall.args[ 0 ] ).to.match( /^media-embed-no-provider-name/ );
						expect( consoleWarnStub.firstCall.args[ 1 ].provider ).to.deep.equal( provider );
					} );
				} );

				it( 'extend #providers but with the lower priority', () => {
					return createTestEditor( {
						providers: [
							testProviders.A
						],
						extraProviders: [
							testProviders.extraA,
							testProviders.extraB
						]
					} ).then( editor => {
						editor.setData( '<figure class="media"><div data-oembed-url="foo.com/123"></div></figure>' );

						expect( getViewData( editor.editing.view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://foo.com/123">' +
									'A, id=123' +
								'</div>' +
							'</figure>'
						);

						editor.setData( '<figure class="media"><div data-oembed-url="anything.com/123"></div></figure>' );

						expect( getViewData( editor.editing.view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://anything.com/123">' +
									'extraB, id=123' +
								'</div>' +
							'</figure>'
						);
					} );
				} );
			} );

			describe( '#removeProviders', () => {
				it( 'removes #providers', () => {
					return createTestEditor( {
						providers: [
							testProviders.A,
							testProviders.B
						],
						removeProviders: [ 'A' ]
					} ).then( editor => {
						editor.setData(
							'<figure class="media"><div data-oembed-url="foo.com/123"></div></figure>' +
							'<figure class="media"><div data-oembed-url="bar.com/123"></div></figure>' );

						expect( getViewData( editor.editing.view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://bar.com/123">' +
									'B, id=123' +
								'</div>' +
							'</figure>'
						);
					} );
				} );

				it( 'removes #extraProviders', () => {
					return createTestEditor( {
						providers: [],
						extraProviders: [
							testProviders.A,
							testProviders.B
						],
						removeProviders: [ 'A' ]
					} ).then( editor => {
						editor.setData(
							'<figure class="media"><div data-oembed-url="foo.com/123"></div></figure>' +
							'<figure class="media"><div data-oembed-url="bar.com/123"></div></figure>' );

						expect( getViewData( editor.editing.view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://bar.com/123">' +
									'B, id=123' +
								'</div>' +
							'</figure>'
						);
					} );
				} );

				it( 'removes even when the name of the provider repeats', () => {
					return createTestEditor( {
						providers: [
							testProviders.A,
							testProviders.A
						],
						extraProviders: [
							testProviders.A,
							testProviders.A,
							testProviders.B
						],
						removeProviders: [ 'A' ]
					} ).then( editor => {
						editor.setData(
							'<figure class="media"><div data-oembed-url="foo.com/123"></div></figure>' +
							'<figure class="media"><div data-oembed-url="bar.com/123"></div></figure>' );

						expect( getViewData( editor.editing.view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://bar.com/123">' +
									'B, id=123' +
								'</div>' +
							'</figure>'
						);
					} );
				} );
			} );
		} );
	} );

	describe( 'init()', () => {
		const providerDefinitions = [
			testProviders.previewLess,
			testProviders.allowEverything
		];

		it( 'should be loaded', () => {
			return createTestEditor()
				.then( newEditor => {
					expect( newEditor.plugins.get( MediaEmbedEditing ) ).to.be.instanceOf( MediaEmbedEditing );
				} );
		} );

		it( 'should set proper schema rules', () => {
			return createTestEditor()
				.then( newEditor => {
					model = newEditor.model;

					expect( model.schema.checkChild( [ '$root' ], 'media' ) ).to.be.true;
					expect( model.schema.checkAttribute( [ '$root', 'media' ], 'url' ) ).to.be.true;

					expect( model.schema.isObject( 'media' ) ).to.be.true;

					expect( model.schema.checkChild( [ '$root', 'media' ], 'media' ) ).to.be.false;
					expect( model.schema.checkChild( [ '$root', 'media' ], '$text' ) ).to.be.false;
					expect( model.schema.checkChild( [ '$root', '$block' ], 'imageBlock' ) ).to.be.false;
				} );
		} );

		it( 'inherits attributes from $blockObject', () => {
			return createTestEditor()
				.then( newEditor => {
					model = newEditor.model;

					model.schema.extend( '$blockObject', {
						allowAttributes: 'foo'
					} );

					expect( model.schema.checkAttribute( 'media', 'foo' ) ).to.be.true;
				} );
		} );

		describe( 'conversion in the data pipeline', () => {
			describe( 'elementName#o-embed', () => {
				beforeEach( () => {
					return createTestEditor( {
						elementName: 'o-embed',
						providers: providerDefinitions
					} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							doc = model.document;
							view = editor.editing.view;
						} );
				} );

				describe( 'model to view', () => {
					it( 'should convert', () => {
						setModelData( model, '<media url="https://ckeditor.com"></media>' );

						expect( editor.getData() ).to.equal(
							'<figure class="media">' +
								'<o-embed url="https://ckeditor.com"></o-embed>' +
							'</figure>' );
					} );

					it( 'should convert (no url)', () => {
						setModelData( model, '<media></media>' );

						expect( editor.getData() ).to.equal(
							'<figure class="media">' +
								'<o-embed></o-embed>' +
							'</figure>' );
					} );

					it( 'should convert (preview-less media)', () => {
						setModelData( model, '<media url="https://preview-less"></media>' );

						expect( editor.getData() ).to.equal(
							'<figure class="media">' +
								'<o-embed url="https://preview-less"></o-embed>' +
							'</figure>' );
					} );
				} );

				describe( 'view to model', () => {
					it( 'should convert media figure', () => {
						editor.setData( '<figure class="media"><o-embed url="https://ckeditor.com"></o-embed></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<media url="https://ckeditor.com"></media>' );
					} );

					it( 'should not convert if there is no media class', () => {
						editor.setData( '<figure class="quote">My quote</figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not convert if there is no o-embed wrapper inside #1', () => {
						editor.setData( '<figure class="media"></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not convert if there is no o-embed wrapper inside #2', () => {
						editor.setData( '<figure class="media">test</figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not convert when the wrapper has no data-o-embed-url attribute', () => {
						editor.setData( '<figure class="media"><div></div></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not convert in the wrong context', () => {
						model.schema.register( 'blockquote', { inheritAllFrom: '$block' } );
						model.schema.addChildCheck( ( ctx, childDef ) => {
							if ( ctx.endsWith( '$root' ) && childDef.name == 'media' ) {
								return false;
							}
						} );

						editor.conversion.elementToElement( { model: 'blockquote', view: 'blockquote' } );

						editor.setData(
							'<blockquote><figure class="media"><o-embed url="https://ckeditor.com"></o-embed></figure></blockquote>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<blockquote></blockquote>' );
					} );

					it( 'should not convert if the o-embed wrapper is already consumed', () => {
						editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
							const img = data.viewItem.getChild( 0 );
							conversionApi.consumable.consume( img, { name: true } );
						}, { priority: 'high' } );

						editor.setData( '<figure class="media"><o-embed url="https://ckeditor.com"></o-embed></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not consume if the media element was not converted', () => {
						editor.data.upcastDispatcher.on( 'element:o-embed', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.viewItem, { name: true } );
							data.modelRange = conversionApi.writer.createRange( data.modelCursor );
						}, { priority: 'highest' } );

						editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.test( data.viewItem, { name: true, classes: 'media' } ) ).to.be.true;
						}, { priority: 'low' } );

						editor.setData( '<figure class="media"><o-embed url="https://ckeditor.com"></o-embed></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should consume the figure element before the o-embed conversion starts', () => {
						editor.data.upcastDispatcher.on( 'element:o-embed', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.test( data.viewItem.parent, { name: true, classes: 'media' } ) ).to.be.false;
						}, { priority: 'low' } );

						editor.setData( '<figure class="media"><o-embed url="https://ckeditor.com"></o-embed></figure>' );
					} );

					it( 'should not convert if the figure is already consumed', () => {
						editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.viewItem, { name: true, class: 'media' } );
						}, { priority: 'high' } );

						editor.setData( '<figure class="media"><o-embed url="https://ckeditor.com"></o-embed></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not left unconverted figure media element', () => {
						editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.test( data.viewItem, { name: true, classes: 'media' } ) ).to.be.false;
						}, { priority: 'low' } );

						editor.setData( '<figure class="media"><o-embed url="https://ckeditor.com">foo bar</o-embed></figure>' );
					} );

					it( 'should discard the contents of the media', () => {
						editor.setData( '<figure class="media"><o-embed url="https://ckeditor.com">foo bar</o-embed></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<media url="https://ckeditor.com"></media>' );
					} );

					it( 'should not convert unknown media', () => {
						return createTestEditor( {
							providers: [
								testProviders.A
							]
						} )
							.then( newEditor => {
								newEditor.setData(
									'<figure class="media">' +
										'<div data-oembed-url="foo.com/123"></div>' +
									'</figure>' +
									'<figure class="media">' +
										'<div data-oembed-url="unknown.media/123"></div>' +
									'</figure>' );

								expect( getModelData( newEditor.model, { withoutSelection: true } ) )
									.to.equal( '<media url="foo.com/123"></media>' );

								return newEditor.destroy();
							} );
					} );

					it( 'should not consume media figure if media url is not matched with any provider url', () => {
						return createTestEditor( {
							providers: [
								testProviders.A
							]
						} ).then( newEditor => {
							let wasConsumed = false;

							newEditor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
								wasConsumed = !conversionApi.consumable.test( data.viewItem, { name: true } );
							}, { priority: 'lowest' } );

							newEditor.setData( '<figure class="media"><o-embed url="https://ckeditor.com"></o-embed></figure>' );

							expect( getModelData( newEditor.model, { withoutSelection: true } ) ).to.equal( '' );
							expect( wasConsumed ).to.be.false;

							return newEditor.destroy();
						} );
					} );
				} );
			} );

			describe( 'previewsInData=false', () => {
				beforeEach( () => {
					return createTestEditor( {
						providers: providerDefinitions
					} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							doc = model.document;
							view = editor.editing.view;
						} );
				} );

				describe( 'model to view', () => {
					it( 'should convert', () => {
						setModelData( model, '<media url="https://ckeditor.com"></media>' );

						expect( editor.getData() ).to.equal(
							'<figure class="media">' +
								'<oembed url="https://ckeditor.com"></oembed>' +
							'</figure>' );
					} );

					it( 'should convert (no url)', () => {
						setModelData( model, '<media></media>' );

						expect( editor.getData() ).to.equal(
							'<figure class="media">' +
								'<oembed></oembed>' +
							'</figure>' );
					} );

					it( 'should convert (preview-less media)', () => {
						setModelData( model, '<media url="https://preview-less"></media>' );

						expect( editor.getData() ).to.equal(
							'<figure class="media">' +
								'<oembed url="https://preview-less"></oembed>' +
							'</figure>' );
					} );
				} );

				describe( 'view to model', () => {
					it( 'should convert media figure', () => {
						editor.setData( '<figure class="media"><oembed url="https://ckeditor.com"></oembed></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<media url="https://ckeditor.com"></media>' );
					} );

					it( 'should not convert if there is no media class', () => {
						editor.setData( '<figure class="quote">My quote</figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not convert if there is no oembed wrapper inside #1', () => {
						editor.setData( '<figure class="media"></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not convert if there is no oembed wrapper inside #2', () => {
						editor.setData( '<figure class="media">test</figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not convert when the wrapper has no data-oembed-url attribute', () => {
						editor.setData( '<figure class="media"><div></div></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not convert in the wrong context', () => {
						model.schema.register( 'blockquote', { inheritAllFrom: '$block' } );
						model.schema.addChildCheck( ( ctx, childDef ) => {
							if ( ctx.endsWith( '$root' ) && childDef.name == 'media' ) {
								return false;
							}
						} );

						editor.conversion.elementToElement( { model: 'blockquote', view: 'blockquote' } );

						editor.setData(
							'<blockquote><figure class="media"><oembed url="https://ckeditor.com"></oembed></figure></blockquote>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<blockquote></blockquote>' );
					} );

					it( 'should not convert if the oembed wrapper is already consumed', () => {
						editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
							const img = data.viewItem.getChild( 0 );
							conversionApi.consumable.consume( img, { name: true } );
						}, { priority: 'high' } );

						editor.setData( '<figure class="media"><oembed url="https://ckeditor.com"></oembed></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not convert if the figure is already consumed', () => {
						editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.viewItem, { name: true, class: 'media' } );
						}, { priority: 'high' } );

						editor.setData( '<figure class="media"><oembed url="https://ckeditor.com"></oembed></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should discard the contents of the media', () => {
						editor.setData( '<figure class="media"><oembed url="https://ckeditor.com">foo bar</oembed></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<media url="https://ckeditor.com"></media>' );
					} );

					it( 'should not convert unknown media', () => {
						return createTestEditor( {
							providers: [
								testProviders.A
							]
						} )
							.then( newEditor => {
								newEditor.setData(
									'<figure class="media"><oembed url="unknown.media"></oembed></figure>' +
									'<figure class="media"><oembed url="foo.com/123"></oembed></figure>' );

								expect( getModelData( newEditor.model, { withoutSelection: true } ) )
									.to.equal( '<media url="foo.com/123"></media>' );

								return newEditor.destroy();
							} );
					} );
				} );
			} );

			describe( 'previewsInData=true', () => {
				beforeEach( () => {
					return createTestEditor( {
						providers: providerDefinitions,
						previewsInData: true
					} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							doc = model.document;
							view = editor.editing.view;
						} );
				} );

				describe( 'conversion in the data pipeline', () => {
					describe( 'model to view', () => {
						it( 'should convert', () => {
							setModelData( model, '<media url="https://ckeditor.com"></media>' );

							expect( editor.getData() ).to.equal(
								'<figure class="media">' +
									'<div data-oembed-url="https://ckeditor.com">' +
										'allow-everything, id=https://ckeditor.com' +
									'</div>' +
								'</figure>' );
						} );

						it( 'should convert (no url)', () => {
							setModelData( model, '<media></media>' );

							expect( editor.getData() ).to.equal(
								'<figure class="media">' +
									'<oembed>' +
									'</oembed>' +
								'</figure>' );
						} );

						it( 'should convert (preview-less media)', () => {
							setModelData( model, '<media url="https://preview-less"></media>' );

							expect( editor.getData() ).to.equal(
								'<figure class="media">' +
									'<oembed url="https://preview-less"></oembed>' +
								'</figure>' );
						} );

						it( 'should output unfiltered data', () => {
							const provider = {
								name: 'test',
								url: 'foo.com',
								html: () => {
									return '<div onclick="action()">foo</div>';
								}
							};

							return createTestEditor( {
								providers: [ provider ],
								previewsInData: true
							} )
								.then( editor => {
									setModelData( editor.model, '<media url="https://foo.com"></media>' );

									expect( editor.getData() ).to.equal(
										'<figure class="media">' +
											'<div data-oembed-url="https://foo.com">' +
												'<div onclick="action()">foo</div>' +
											'</div>' +
										'</figure>' );
								} );
						} );
					} );

					describe( 'view to model', () => {
						it( 'should convert media figure', () => {
							editor.setData(
								'<figure class="media">' +
									'<div data-oembed-url="https://ckeditor.com">' +
										'allow-everything, id=https://cksource.com></iframe>' +
									'</div>' +
								'</figure>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '<media url="https://ckeditor.com"></media>' );
						} );

						it( 'should not convert if there is no media class', () => {
							editor.setData( '<figure class="quote">My quote</figure>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '' );
						} );

						it( 'should not convert if there is no oembed wrapper inside #1', () => {
							editor.setData( '<figure class="media"></figure>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '' );
						} );

						it( 'should not convert if there is no oembed wrapper inside #2', () => {
							editor.setData( '<figure class="media">test</figure>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '' );
						} );

						it( 'should not convert in the wrong context', () => {
							model.schema.register( 'div', { inheritAllFrom: '$block' } );
							model.schema.addChildCheck( ( ctx, childDef ) => {
								if ( ctx.endsWith( '$root' ) && childDef.name == 'media' ) {
									return false;
								}
							} );

							editor.conversion.elementToElement( { model: 'div', view: 'div' } );

							editor.setData(
								'<div>' +
									'<figure class="media">' +
										'<div data-oembed-url="https://ckeditor.com">' +
											'<iframe src="this should be discarded"></iframe>' +
										'</div>' +
									'</figure>' +
								'</div>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '<div></div>' );
						} );

						it( 'should not convert if the oembed wrapper is already consumed', () => {
							editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
								const img = data.viewItem.getChild( 0 );
								conversionApi.consumable.consume( img, { name: true } );
							}, { priority: 'high' } );

							editor.setData(
								'<div>' +
									'<figure class="media">' +
										'<div data-oembed-url="https://ckeditor.com">' +
											'<iframe src="this should be discarded"></iframe>' +
										'</div>' +
									'</figure>' +
								'</div>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '' );
						} );

						it( 'should not convert if the figure is already consumed', () => {
							editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
								conversionApi.consumable.consume( data.viewItem, { name: true, class: 'media' } );
							}, { priority: 'high' } );

							editor.setData( '<figure class="media"><div data-oembed-url="https://ckeditor.com"></div></figure>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '' );
						} );

						it( 'should discard the contents of the media', () => {
							editor.setData(
								'<figure class="media">' +
									'<div data-oembed-url="https://ckeditor.com">' +
										'foo bar baz' +
									'</div>' +
								'</figure>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '<media url="https://ckeditor.com"></media>' );
						} );

						it( 'should not convert unknown media', () => {
							return createTestEditor( {
								providers: [
									testProviders.A
								]
							} )
								.then( newEditor => {
									newEditor.setData(
										'<figure class="media">' +
											'<div data-oembed-url="foo.com/123"></div>' +
										'</figure>' +
										'<figure class="media">' +
											'<div data-oembed-url="unknown.media/123"></div>' +
										'</figure>' );

									expect( getModelData( newEditor.model, { withoutSelection: true } ) )
										.to.equal( '<media url="foo.com/123"></media>' );

									return newEditor.destroy();
								} );
						} );
					} );
				} );
			} );
		} );

		describe( 'conversion in the editing pipeline', () => {
			describe( 'previewsInData=false', () => {
				beforeEach( () => {
					return createTestEditor( {
						providers: providerDefinitions
					} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							doc = model.document;
							view = editor.editing.view;
						} );
				} );

				test();
			} );

			describe( 'previewsInData=true', () => {
				beforeEach( () => {
					return createTestEditor( {
						providers: providerDefinitions,
						previewsInData: true
					} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							doc = model.document;
							view = editor.editing.view;
						} );
				} );

				test();
			} );

			it( 'should apply filtering to the output', () => {
				testUtils.sinon.stub( console, 'warn' )
					.withArgs( sinon.match( /^domconverter-unsafe-attribute-detected/ ) )
					.callsFake( () => {} );

				const provider = {
					name: 'test',
					url: 'foo.com',
					html: () => {
						return '<div onclick="action()">foo</div>';
					}
				};

				return createTestEditor( {
					providers: [
						provider
					]
				} ).then( editor => {
					editor.setData( '<figure class="media"><div data-oembed-url="foo.com"></div></figure>' );

					expect( getViewData( editor.editing.view, {
						withoutSelection: true,
						renderRawElements: true,
						domConverter: editor.editing.view.domConverter
					} ) ).to.equal(
						'<figure class="ck-widget media" contenteditable="false">' +
							'<div class="ck-media__wrapper" data-oembed-url="https://foo.com">' +
								'<div data-ck-unsafe-attribute-onclick="action()">foo</div>' +
							'</div>' +
						'</figure>'
					);
				} );
			} );

			function test() {
				describe( 'model to view', () => {
					it( 'should convert', () => {
						setModelData( model, '<media url="https://ckeditor.com"></media>' );

						expect( getViewData( view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://ckeditor.com">' +
									'allow-everything, id=https://ckeditor.com' +
								'</div>' +
							'</figure>'
						);
					} );

					it( 'should convert the url attribute change', () => {
						setModelData( model, '<media url="https://ckeditor.com"></media>' );
						const media = doc.getRoot().getChild( 0 );

						model.change( writer => {
							writer.setAttribute( 'url', 'https://cksource.com', media );
						} );

						expect( getViewData( view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://cksource.com">' +
									'allow-everything, id=https://cksource.com' +
								'</div>' +
							'</figure>'
						);
					} );

					it( 'should convert the url attribute removal', () => {
						setModelData( model, '<media url="https://ckeditor.com"></media>' );
						const media = doc.getRoot().getChild( 0 );

						model.change( writer => {
							writer.removeAttribute( 'url', media );
						} );

						expect( getViewData( view, { withoutSelection: true, renderRawElements: true } ) )
							.to.equal(
								'<figure class="ck-widget media" contenteditable="false">' +
									'<div class="ck-media__wrapper">' +
									'</div>' +
								'</figure>'
							);
					} );

					it( 'should not convert the url attribute removal if is already consumed', () => {
						setModelData( model, '<media url="https://ckeditor.com"></media>' );
						const media = doc.getRoot().getChild( 0 );

						editor.editing.downcastDispatcher.on( 'attribute:url:media', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:url' );
						}, { priority: 'high' } );

						model.change( writer => {
							writer.removeAttribute( 'url', media );
						} );

						expect( getViewData( view, { withoutSelection: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://ckeditor.com">' +
									'allow-everything, id=https://ckeditor.com' +
								'</div>' +
							'</figure>'
						);
					} );

					// Related to https://github.com/ckeditor/ckeditor5/issues/407.
					it( 'should not discard internals (e.g. UI) injected by other features when converting the url attribute', () => {
						setModelData( model, '<media url="https://ckeditor.com"></media>' );
						const media = doc.getRoot().getChild( 0 );

						editor.editing.view.change( writer => {
							const widgetViewElement = editor.editing.mapper.toViewElement( media );

							const externalUIElement = writer.createUIElement( 'div', null, function( domDocument ) {
								const domElement = this.toDomElement( domDocument );

								domElement.innerHTML = 'external UI';

								return domElement;
							} );

							writer.insert( writer.createPositionAt( widgetViewElement, 'end' ), externalUIElement );
						} );

						expect( getViewData( view, { withoutSelection: true, renderUIElements: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://ckeditor.com">' +
									'allow-everything, id=https://ckeditor.com' +
								'</div>' +
								'<div>external UI</div>' +
							'</figure>'
						);

						model.change( writer => {
							writer.setAttribute( 'url', 'https://cksource.com', media );
						} );

						expect( getViewData( view, { withoutSelection: true, renderUIElements: true, renderRawElements: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="https://cksource.com">' +
									'allow-everything, id=https://cksource.com' +
								'</div>' +
								'<div>external UI</div>' +
							'</figure>'
						);
					} );
				} );
			}
		} );
	} );

	function testMediaUpcast( urls, expected ) {
		for ( const url of urls ) {
			editor.setData( `<figure class="media"><div data-oembed-url="${ url }"></div></figure>` );

			const viewData = getViewData( view, { withoutSelection: true, renderRawElements: true } );
			let expectedRegExp;

			const expectedUrl = escapeRegExp( url.match( /^https?:\/\// ) ? url : 'https://' + url );

			if ( expected ) {
				expectedRegExp = new RegExp(
					'<figure[^>]+>' +
						'<div[^>]+>' +
							normalizeHtml( escapeRegExp( expected ) ) +
						'</div>' +
					'</figure>' );
			} else {
				expectedRegExp = new RegExp(
					'<figure[^>]+>' +
						'<div[^>]+>' +
							'<div class="ck ck-media__placeholder ck-reset_all">' +
								'<div class="ck-media__placeholder__icon">.*</div>' +
								'<a ' +
									'class="ck-media__placeholder__url" ' +
									'data-cke-tooltip-text="Open media in new tab" ' +
									`href="${ expectedUrl }" ` +
									'rel="noopener noreferrer" ' +
									'target="_blank"' +
								'>' +
										`<span class="ck-media__placeholder__url__text">${ expectedUrl }</span>` +
								'</a>' +
							'</div>' +
						'</div>' +
					'</figure>' );
			}

			expect( normalizeHtml( viewData ) ).to.match( expectedRegExp, `assertion for "${ url }"` );
		}
	}

	function createTestEditor( mediaEmbedConfig ) {
		return VirtualTestEditor
			.create( {
				plugins: [ MediaEmbedEditing ],
				mediaEmbed: mediaEmbedConfig
			} );
	}
} );
