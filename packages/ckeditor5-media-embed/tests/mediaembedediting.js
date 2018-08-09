/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import MediaEmbedEditing from '../src/mediaembedediting';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';

describe.only( 'MediaEmbedEditing', () => {
	let editor, model, doc, view;
	const mediaDefinitions = {
		test: {
			url: /(.*)/,
			html: id => `<iframe src="${ id }"></iframe>`
		}
	};

	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		describe( 'config.mediaEmbed.media', () => {
			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ MediaEmbedEditing ],
						mediaEmbed: {
							semanticDataOutput: true
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						view = editor.editing.view;
					} );
			} );

			it( 'upcasts the URL (dailymotion)', () => {
				testMediaConfig( [
					'https://www.dailymotion.com/video/foo',
					'www.dailymotion.com/video/foo',
					'dailymotion.com/video/foo',
				],
				'<iframe src="https://www.dailymotion.com/embed/video/foo" ' +
					'frameborder="0" width="480" height="270" allowfullscreen="" allow="autoplay">' +
				'</iframe>' );
			} );

			it( 'upcasts the URL (instagram)', () => {
				testMediaConfig( [
					'https://www.instagram.com/p/foo',
					'www.instagram.com/p/foo',
					'instagram.com/p/foo',
				],
				'<iframe src="http://instagram.com/p/foo/embed" frameborder="0"></iframe>' );
			} );

			describe( 'spotify', () => {
				it( 'upcasts the URL (artist)', () => {
					testMediaConfig( [
						'https://www.open.spotify.com/artist/foo',
						'www.open.spotify.com/artist/foo',
						'open.spotify.com/artist/foo',
					],
					'<iframe src="https://open.spotify.com/embed/artist/foo" ' +
						'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
					'</iframe>' );
				} );

				it( 'upcasts the URL (album)', () => {
					testMediaConfig( [
						'https://www.open.spotify.com/album/foo',
						'www.open.spotify.com/album/foo',
						'open.spotify.com/album/foo',
					],
					'<iframe src="https://open.spotify.com/embed/album/foo" ' +
						'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
					'</iframe>' );
				} );

				it( 'upcasts the URL (track)', () => {
					testMediaConfig( [
						'https://www.open.spotify.com/track/foo',
						'www.open.spotify.com/track/foo',
						'open.spotify.com/track/foo',
					],
					'<iframe src="https://open.spotify.com/embed/track/foo" ' +
						'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
					'</iframe>' );
				} );
			} );

			it( 'upcasts the URL (youtube)', () => {
				testMediaConfig( [
					'https://www.youtube.com/watch?v=foo',
					'www.youtube.com/watch?v=foo',
					'youtube.com/watch?v=foo',

					'https://www.youtube.com/v/foo',
					'www.youtube.com/v/foo',
					'youtube.com/v/foo',

					'https://www.youtube.com/embed/foo',
					'www.youtube.com/embed/foo',
					'youtube.com/embed/foo',

					'https://youtu.be/foo',
					'youtu.be/foo'
				],
				'<iframe src="https://www.youtube.com/embed/foo" ' +
					'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="">' +
				'</iframe>' );
			} );

			it( 'upcasts the URL (vimeo)', () => {
				testMediaConfig( [
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
				'<iframe src="https://player.vimeo.com/video/1234" ' +
					'frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen="">' +
				'</iframe>' );
			} );
		} );
	} );

	describe( 'init()', () => {
		it( 'should be loaded', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ MediaEmbedEditing ],
				} )
				.then( newEditor => {
					expect( newEditor.plugins.get( MediaEmbedEditing ) ).to.be.instanceOf( MediaEmbedEditing );
				} );
		} );

		it( 'should set proper schema rules', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ MediaEmbedEditing ],
				} )
				.then( newEditor => {
					model = newEditor.model;

					expect( model.schema.checkChild( [ '$root' ], 'media' ) ).to.be.true;
					expect( model.schema.checkAttribute( [ '$root', 'media' ], 'url' ) ).to.be.true;

					expect( model.schema.isObject( 'media' ) ).to.be.true;

					expect( model.schema.checkChild( [ '$root', 'media' ], 'media' ) ).to.be.false;
					expect( model.schema.checkChild( [ '$root', 'media' ], '$text' ) ).to.be.false;
					expect( model.schema.checkChild( [ '$root', '$block' ], 'image' ) ).to.be.false;
				} );
		} );

		describe( 'conversion in the data pipeline', () => {
			describe( 'semanticDataOutput=true', () => {
				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ MediaEmbedEditing ],
							mediaEmbed: {
								semanticDataOutput: true,
								media: mediaDefinitions
							}
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
						setModelData( model, '<media url="http://ckeditor.com"></media>' );

						expect( editor.getData() ).to.equal(
							'<figure class="media">' +
								'<div data-oembed-url="http://ckeditor.com"></div>' +
							'</figure>' );
					} );

					it( 'should convert (no url)', () => {
						setModelData( model, '<media></media>' );

						expect( editor.getData() ).to.equal(
							'<figure class="media">' +
								'<div></div>' +
							'</figure>' );
					} );
				} );

				describe( 'view to model', () => {
					it( 'should convert media figure', () => {
						editor.setData( '<figure class="media"><div data-oembed-url="http://ckeditor.com"></div></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<media url="http://ckeditor.com"></media>' );
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
							'<blockquote><figure class="media"><div data-oembed-url="http://ckeditor.com"></div></figure></blockquote>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<blockquote></blockquote>' );
					} );

					it( 'should not convert if the oembed wrapper is already consumed', () => {
						editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
							const img = data.viewItem.getChild( 0 );
							conversionApi.consumable.consume( img, { name: true } );
						}, { priority: 'high' } );

						editor.setData( '<figure class="media"><div data-oembed-url="http://ckeditor.com"></div></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );

					it( 'should not convert if the figure is already consumed', () => {
						editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.viewItem, { name: true, class: 'image' } );
						}, { priority: 'high' } );

						editor.setData( '<figure class="media"><div data-oembed-url="http://ckeditor.com"></div></figure>' );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '' );
					} );
				} );
			} );

			describe( 'semanticDataOutput=false', () => {
				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ MediaEmbedEditing ],
							mediaEmbed: {
								media: mediaDefinitions
							}
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
							setModelData( model, '<media url="http://ckeditor.com"></media>' );

							expect( editor.getData() ).to.equal(
								'<figure class="media">' +
									'<div data-oembed-url="http://ckeditor.com">' +
										'<iframe src="http://ckeditor.com"></iframe>' +
									'</div>' +
								'</figure>' );
						} );

						it( 'should convert (no url)', () => {
							setModelData( model, '<media></media>' );

							expect( editor.getData() ).to.equal(
								'<figure class="media">' +
									'<div>' +
									'</div>' +
								'</figure>' );
						} );
					} );

					describe( 'view to model', () => {
						it( 'should convert media figure', () => {
							editor.setData(
								'<figure class="media">' +
									'<div data-oembed-url="http://ckeditor.com">' +
										'<iframe src="http://cksource.com"></iframe>' +
									'</div>' +
								'</figure>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '<media url="http://ckeditor.com"></media>' );
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
										'<div data-oembed-url="http://ckeditor.com">' +
											'<iframe src="http://cksource.com"></iframe>' +
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
										'<div data-oembed-url="http://ckeditor.com">' +
											'<iframe src="http://cksource.com"></iframe>' +
										'</div>' +
									'</figure>' +
								'</div>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '' );
						} );

						it( 'should not convert if the figure is already consumed', () => {
							editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
								conversionApi.consumable.consume( data.viewItem, { name: true, class: 'image' } );
							}, { priority: 'high' } );

							editor.setData( '<figure class="media"><div data-oembed-url="http://ckeditor.com"></div></figure>' );

							expect( getModelData( model, { withoutSelection: true } ) )
								.to.equal( '' );
						} );
					} );
				} );
			} );
		} );

		describe( 'conversion in the editing pipeline', () => {
			describe( 'semanticDataOutput=true', () => {
				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ MediaEmbedEditing ],
							mediaEmbed: {
								media: mediaDefinitions,
								semanticDataOutput: true
							}
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

			describe( 'semanticDataOutput=false', () => {
				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ MediaEmbedEditing ],
							mediaEmbed: {
								media: mediaDefinitions
							}
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

			function test() {
				describe( 'model to view', () => {
					it( 'should convert', () => {
						setModelData( model, '<media url="http://ckeditor.com"></media>' );

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="http://ckeditor.com">' +
									'<iframe src="http://ckeditor.com"></iframe>' +
								'</div>' +
							'</figure>'
						);
					} );

					it( 'should convert the url attribute change', () => {
						setModelData( model, '<media url="http://ckeditor.com"></media>' );
						const media = doc.getRoot().getChild( 0 );

						model.change( writer => {
							writer.setAttribute( 'url', 'http://cksource.com', media );
						} );

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="http://cksource.com">' +
									'<iframe src="http://cksource.com"></iframe>' +
								'</div>' +
							'</figure>'
						);
					} );

					it( 'should convert the url attribute removal', () => {
						setModelData( model, '<media url="http://ckeditor.com"></media>' );
						const media = doc.getRoot().getChild( 0 );

						model.change( writer => {
							writer.removeAttribute( 'url', media );
						} );

						expect( getViewData( view, { withoutSelection: true } ) )
							.to.equal(
								'<figure class="ck-widget media" contenteditable="false">' +
									'<div class="ck-media__wrapper">' +
									'</div>' +
								'</figure>'
							);
					} );

					it( 'should not convert the url attribute removal if is already consumed', () => {
						setModelData( model, '<media url="http://ckeditor.com"></media>' );
						const media = doc.getRoot().getChild( 0 );

						editor.editing.downcastDispatcher.on( 'attribute:url:media', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:url' );
						}, { priority: 'high' } );

						model.change( writer => {
							writer.removeAttribute( 'url', media );
						} );

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<figure class="ck-widget media" contenteditable="false">' +
								'<div class="ck-media__wrapper" data-oembed-url="http://ckeditor.com">' +
									'<iframe src="http://ckeditor.com"></iframe>' +
								'</div>' +
							'</figure>'
						);
					} );
				} );
			}
		} );
	} );

	function testMediaConfig( urls, expected ) {
		for ( const url of urls ) {
			editor.setData(
				`<figure class="media"><div data-oembed-url="${ url }"></div></figure>` );

			expect( normalizeHtml( getViewData( view, { withoutSelection: true } ) ) ).to.match(
				new RegExp( '<figure[^>]+>' +
					'<div[^>]+>' +
						`<div[^>]+>${ normalizeHtml( expected ) }</div>` +
					'</div>' +
				'</figure>' ), `assertion for "${ url }"` );
		}
	}
} );
