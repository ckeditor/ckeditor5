/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';
import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';
import { getModelDataWithAttributes } from '../_utils/utils.js';
import { range } from 'es-toolkit/compat';
import MediaEmbedElementSupport from '../../src/integrations/mediaembed.js';

describe( 'MediaEmbedElementSupport', () => {
	describe( 'MediaEmbed feature is available', () => {
		let editor, model, editorElement, dataFilter;

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, MediaEmbed, GeneralHtmlSupport ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;

					dataFilter = editor.plugins.get( 'DataFilter' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( MediaEmbedElementSupport.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( MediaEmbedElementSupport.isPremiumPlugin ).to.be.false;
		} );

		it( 'should be named', () => {
			expect( editor.plugins.has( 'MediaEmbedElementSupport' ) ).to.be.true;
		} );

		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
			'<figure class="media" data-figure="data-figure-value">' +
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-oembed="data-oembed-value"></oembed>' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<media htmlFigureAttributes="(1)" htmlOembedAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk">' +
					'</media>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'data-figure-value'
						}
					},
					2: {
						attributes: {
							'data-oembed': 'data-oembed-value'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml =
			'<figure class="media foobar">' +
				'<oembed class="foobar" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media htmlFigureAttributes="(1)" htmlOembedAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
				attributes: range( 1, 3 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						classes: [ 'foobar' ]
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should allow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				styles: 'color'
			} ] );

			const expectedHtml =
			'<figure class="media" style="color:red;">' +
				'<oembed style="color:red;" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media htmlFigureAttributes="(1)" htmlOembedAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
				attributes: range( 1, 3 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						styles: {
							color: 'red'
						}
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should disallow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				attributes: /^data-.*$/
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|oembed)$/,
				attributes: /^data-.*$/
			} ] );

			editor.setData(
				'<figure class="media" data-figure="data-figure-value">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-oembed="data-oembed-value"></oembed>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);
		} );

		it( 'should disallow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				classes: 'foobar'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|oembed)$/,
				classes: 'foobar'
			} ] );

			editor.setData(
				'<figure class="media foobar">' +
					'<oembed class="foobar" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);
		} );

		it( 'should disallow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				styles: 'color'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|oembed)$/,
				styles: 'color'
			} ] );

			editor.setData(
				'<figure class="media" style="color:red;">' +
					'<oembed style="color:red;" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);
		} );

		it( 'should not set attributes on non existing figure', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				attributes: true
			} ] );

			editor.setData(
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media htmlOembedAttributes="(1)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo',
							'url': 'https://www.youtube.com/watch?v=ZVv7UMQPEWk'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed>' +
				'</figure>'
			);
		} );

		it( 'should not break figure integration for other features', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|figcaption|oembed)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<figure class="media" data-figure="oembed">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>' +
				'<figure data-figure="standalone">' +
					'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media htmlFigureAttributes="(1)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>' +
				'<htmlFigure htmlFigureAttributes="(2)">' +
					'<htmlFigcaption htmlFigcaptionAttributes="(3)">foobar</htmlFigcaption>' +
				'</htmlFigure>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'oembed'
						}
					},
					2: {
						attributes: {
							'data-figure': 'standalone'
						}
					},
					3: {
						attributes: {
							'data-figcaption': 'figcaption'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should not double convert figure element', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^.*$/,
				styles: true,
				attributes: true,
				classes: true
			} ] );

			const expectedHtml =
				'<figure class="media">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should not consume media figure element that is already consumed (upcast)', () => {
			editor.conversion.for( 'upcast' )
				.add( dispatcher => {
					dispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.viewItem, { name: true, classes: 'media' } );
					}, { priority: 'highest' } );
				} );

			dataFilter.allowElement( /^(figure|oembed)$/ );
			dataFilter.allowAttributes( {
				name: /^(figure|oembed)$/,
				attributes: { 'data-foo': true }
			} );

			editor.setData(
				'<figure class="media" data-foo="foo">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal( '' );
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlOembedAttributes',
				'htmlFigureAttributes'
			].forEach( attributeName => {
				editor.conversion.for( 'downcast' )
					.add( dispatcher => {
						dispatcher.on( `attribute:${ attributeName }:media`, ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } );
					} );
			} );

			dataFilter.allowElement( /^(figure|oembed)$/ );
			dataFilter.allowAttributes( {
				name: /^(figure|oembed)$/,
				attributes: { 'data-foo': true }
			} );

			editor.setData(
				'<figure class="media" data-foo="foo">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);
		} );

		it( 'should create a marker before GHS converts attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /.*/,
				attributes: true,
				styles: true,
				classes: true
			} ] );

			editor.conversion.for( 'upcast' ).dataToMarker( {
				view: 'commented'
			} );

			editor.setData(
				'<figure class="media" data-commented-end-after="foo:id" data-commented-start-before="foo:id">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);

			const marker = model.markers.get( 'commented:foo:id' );

			expect( marker.getStart().path ).to.deep.equal( [ 0 ] );
			expect( marker.getEnd().path ).to.deep.equal( [ 1 ] );
		} );

		it( 'should create a marker before GHS converts attributes (without the figure element)', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /.*/,
				attributes: true,
				styles: true,
				classes: true
			} ] );

			editor.conversion.for( 'upcast' ).dataToMarker( {
				view: 'commented'
			} );

			editor.setData(
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"' +
				' data-commented-end-after="foo:id" data-commented-start-before="foo:id"></oembed>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);

			const marker = model.markers.get( 'commented:foo:id' );

			expect( marker.getStart().path ).to.deep.equal( [ 0 ] );
			expect( marker.getEnd().path ).to.deep.equal( [ 1 ] );
		} );
	} );

	describe( 'MediaEmbed feature with custom element name', () => {
		let editor, model, editorElement, dataFilter;

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, GeneralHtmlSupport, MediaEmbed ],
					mediaEmbed: {
						elementName: 'custom-oembed'
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;

					dataFilter = editor.plugins.get( 'DataFilter' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|custom-oembed)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
			'<figure class="media" data-figure="data-figure-value">' +
				'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-oembed="data-oembed-value"></custom-oembed>' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<media' +
						' htmlCustomOembedAttributes="(1)"' +
						' htmlFigureAttributes="(2)"' +
						' url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"' +
						'>' +
					'</media>',
				attributes: {
					1: {
						attributes: {
							'data-oembed': 'data-oembed-value'
						}
					},
					2: {
						attributes: {
							'data-figure': 'data-figure-value'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|custom-oembed)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml =
			'<figure class="media foobar">' +
				'<custom-oembed class="foobar" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></custom-oembed>' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<media' +
						' htmlCustomOembedAttributes="(1)"' +
						' htmlFigureAttributes="(2)"' +
						' url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"' +
					'>' +
					'</media>',
				attributes: range( 1, 3 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						classes: [ 'foobar' ]
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should allow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|custom-oembed)$/,
				styles: 'color'
			} ] );

			const expectedHtml =
			'<figure class="media" style="color:red;">' +
				'<custom-oembed style="color:red;" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></custom-oembed>' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<media' +
						' htmlCustomOembedAttributes="(1)"' +
						' htmlFigureAttributes="(2)"' +
						' url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"' +
						'>' +
					'</media>',
				attributes: range( 1, 3 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						styles: {
							color: 'red'
						}
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should disallow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|custom-oembed)$/,
				attributes: /^data-.*$/
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|custom-oembed)$/,
				attributes: /^data-.*$/
			} ] );

			editor.setData(
				'<figure class="media" data-figure="data-figure-value">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-oembed="data-oembed-value"></custom-oembed>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></custom-oembed>' +
				'</figure>'
			);
		} );

		it( 'should disallow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|custom-oembed)$/,
				classes: 'foobar'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|custom-oembed)$/,
				classes: 'foobar'
			} ] );

			editor.setData(
				'<figure class="media foobar">' +
					'<custom-oembed class="foobar" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></custom-oembed>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></custom-oembed>' +
				'</figure>'
			);
		} );

		it( 'should disallow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|custom-oembed)$/,
				styles: 'color'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|custom-oembed)$/,
				styles: 'color'
			} ] );

			editor.setData(
				'<figure class="media" style="color:red;">' +
					'<custom-oembed style="color:red;" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></custom-oembed>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></custom-oembed>' +
				'</figure>'
			);
		} );

		it( 'should not set attributes on non existing figure', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|custom-oembed)$/,
				attributes: true
			} ] );

			editor.setData(
				'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></custom-oembed>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<media' +
						' htmlCustomOembedAttributes="(1)"' +
						' url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"' +
						'>' +
					'</media>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo',
							'url': 'https://www.youtube.com/watch?v=ZVv7UMQPEWk'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></custom-oembed>' +
				'</figure>'
			);
		} );

		it( 'should not break figure integration for other features', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|figcaption|custom-oembed)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<figure class="media" data-figure="oembed">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></custom-oembed>' +
				'</figure>' +
				'<figure data-figure="standalone">' +
					'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<media htmlFigureAttributes="(1)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>' +
				'<htmlFigure htmlFigureAttributes="(2)">' +
					'<htmlFigcaption htmlFigcaptionAttributes="(3)">foobar</htmlFigcaption>' +
				'</htmlFigure>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'oembed'
						}
					},
					2: {
						attributes: {
							'data-figure': 'standalone'
						}
					},
					3: {
						attributes: {
							'data-figcaption': 'figcaption'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should not consume media figure element that is already consumed (upcast)', () => {
			editor.conversion.for( 'upcast' )
				.add( dispatcher => {
					dispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.viewItem, { name: true, classes: 'media' } );
					}, { priority: 'highest' } );
				} );

			dataFilter.allowElement( /^(figure|custom-oembed)$/ );
			dataFilter.allowAttributes( {
				name: /^(figure|custom-oembed)$/,
				attributes: { 'data-foo': true }
			} );

			editor.setData(
				'<figure class="media" data-foo="foo">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></custom-oembed>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal( '' );
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlCustomOembedAttributes',
				'htmlFigureAttributes'
			].forEach( attributeName => {
				editor.conversion.for( 'downcast' )
					.add( dispatcher => {
						dispatcher.on( `attribute:${ attributeName }:media`, ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } );
					} );
			} );

			dataFilter.allowElement( /^(figure|custom-oembed)$/ );
			dataFilter.allowAttributes( {
				name: /^(figure|custom-oembed)$/,
				attributes: { 'data-foo': true }
			} );

			editor.setData(
				'<figure class="media" data-foo="foo">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></custom-oembed>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></custom-oembed>' +
				'</figure>'
			);
		} );

		it( 'should create a marker before GHS converts attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /.*/,
				attributes: true,
				styles: true,
				classes: true
			} ] );

			editor.conversion.for( 'upcast' ).dataToMarker( {
				view: 'commented'
			} );

			editor.setData(
				'<figure class="media" data-foo="foo" data-commented-end-after="foo:id" data-commented-start-before="foo:id">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></custom-oembed>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="media" data-foo="foo">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></custom-oembed>' +
				'</figure>'
			);

			const marker = model.markers.get( 'commented:foo:id' );

			expect( marker.getStart().path ).to.deep.equal( [ 0 ] );
			expect( marker.getEnd().path ).to.deep.equal( [ 1 ] );
		} );

		it( 'should create a marker before GHS converts attributes(without figure)', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /.*/,
				attributes: true,
				styles: true,
				classes: true
			} ] );

			editor.conversion.for( 'upcast' ).dataToMarker( {
				view: 'commented'
			} );

			editor.setData(
				'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"' +
				' data-foo="foo" data-commented-end-after="foo:id" data-commented-start-before="foo:id"></custom-oembed>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="media">' +
					'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></custom-oembed>' +
				'</figure>'
			);

			const marker = model.markers.get( 'commented:foo:id' );

			expect( marker.getStart().path ).to.deep.equal( [ 0 ] );
			expect( marker.getEnd().path ).to.deep.equal( [ 1 ] );
		} );

		// it( 'should allow modifying styles, classes and attributes ', () => {
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(figure|custom-oembed|div|p)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<figure class="media foo" data-figure="data-figure-value">' +
		// 			'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" class="foobar"' +
		// 			' style="color:green;" data-oembed="data-oembed-value"></custom-oembed>' +
		// 		'</figure>'
		// 	);

		// 	const mediaElement = model.document.getRoot().getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlAttributes', 'styles', {
		// 			'background-color': 'blue',
		// 			color: 'red'
		// 		} );
		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlFigureAttributes', 'styles', {
		// 			'font-size': '12px',
		// 			'text-align': 'center'
		// 		} );

		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlAttributes', 'attributes', {
		// 			'data-oembed': 'foo'
		// 		} );
		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlFigureAttributes', 'attributes', {
		// 			'data-figure': 'bar'
		// 		} );

		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlAttributes', 'classes', [ 'bar', 'baz' ] );
		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlFigureAttributes', 'classes', [ 'foobar' ] );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
		// 		data:
		// 			'<media htmlAttributes="(1)" htmlFigureAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
		// 		attributes: {
		// 			1: {
		// 				attributes: {
		// 					'data-oembed': 'foo'
		// 				},
		// 				classes: [ 'bar', 'baz' ],
		// 				styles: {
		// 					'background-color': 'blue',
		// 					color: 'red'
		// 				}
		// 			},
		// 			2: {
		// 				attributes: {
		// 					'data-figure': 'bar'
		// 				},
		// 				classes: [ 'foobar' ],
		// 				styles: {
		// 					'font-size': '12px',
		// 					'text-align': 'center'
		// 				}
		// 			}
		// 		}
		// 	} );

		// 	// TODO: this should pass, but oembed attributes are not applied in the editing view.
		// 	// Should be fixed by https://github.com/ckeditor/ckeditor5/issues/11532
		// 	// expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
		// 	// 	'<figure class="ck-widget ck-widget_selected media foobar" contenteditable="false"' +
		// 	// 			' style="font-size:12px;text-align:center;" data-figure="bar">' +
		// 	// 		'<div class="ck-media__wrapper" data-oembed-url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"' +
		// 	// 			' data-oembed="foo" class="bar baz" style="background-color:blue;color:red;">' +
		// 	// 		'</div>' +
		// 	// 		'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
		// 	// 	'</figure>'
		// 	// );

		// 	expect( editor.getData() ).to.equal(
		// 		'<figure class="media foobar" style="font-size:12px;text-align:center;" data-figure="bar">' +
		// 			'<custom-oembed class="bar baz" style="background-color:blue;color:red;"' +
		// 			' url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"' +
		// 			' data-oembed="foo"></custom-oembed>' +
		// 		'</figure>'
		// 	);
		// } );

		// it( 'should allow removing all styles, classes and attributes ', () => {
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(figure|custom-oembed|div|p)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<figure class="media foo" data-figure="data-figure-value">' +
		// 			'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" class="foobar"' +
		// 			' style="color:green;" data-oembed="data-oembed-value"></custom-oembed>' +
		// 		'</figure>'
		// 	);

		// 	const mediaElement = model.document.getRoot().getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlFigureAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlAttributes', 'attributes', null );
		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlFigureAttributes', 'attributes', null );
		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlAttributes', 'classes', null );
		// 		setModelHtmlAttribute( writer, mediaElement, 'htmlFigureAttributes', 'classes', null );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
		// 		data:
		// 			'<media url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
		// 		attributes: {}
		// 	} );

		// 	expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
		// 		'<figure class="ck-widget ck-widget_selected media" contenteditable="false">' +
		// 			'<div class="ck-media__wrapper" data-oembed-url="https://www.youtube.com/watch?v=ZVv7UMQPEWk">' +
		// 			'</div>' +
		// 			'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
		// 		'</figure>'
		// 	);

		// 	expect( editor.getData() ).to.equal(
		// 		'<figure class="media">' +
		// 			'<custom-oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></custom-oembed>' +
		// 		'</figure>'
		// 	);
		// } );
	} );

	// Even though the support of media embed feature by GHS alone seems lacking (e.g. extra paragraphs in the model, output)
	// we still wanted to keep track of the state of that kind of conversion.
	describe( 'Oembed supported solely by GHS', () => {
		let editor, model, editorElement, dataFilter;

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, GeneralHtmlSupport ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;

					dataFilter = editor.plugins.get( 'DataFilter' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				attributes: /^data-.*$/
			} ] );

			editor.setData(
				'<figure data-figure="data-figure-value">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-oembed="data-oembed-value"></oembed>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<htmlFigure htmlFigureAttributes="(1)">' +
					'<paragraph>' +
						'<htmlOembed htmlContent="" htmlOembedAttributes="(2)"></htmlOembed>' +
					'</paragraph>' +
				'</htmlFigure>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'data-figure-value'
						}
					},
					2: '',
					3: {
						attributes: {
							'data-oembed': 'data-oembed-value'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure data-figure="data-figure-value">' +
					'<p>' +
						'<oembed data-oembed="data-oembed-value"></oembed>' +
					'</p>' +
				'</figure>'
			);
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				classes: [ 'media', 'foobar' ]
			} ] );

			editor.setData(
				'<figure class="media foobar">' +
				'<oembed class="foobar" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<htmlFigure htmlFigureAttributes="(1)">' +
					'<paragraph>' +
						'<htmlOembed htmlContent="" htmlOembedAttributes="(2)"></htmlOembed>' +
					'</paragraph>' +
				'</htmlFigure>',
				attributes: {
					1: {
						classes: [ 'media', 'foobar' ]
					},
					2: '',
					3: {
						classes: [ 'foobar' ]
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="media foobar"><p><oembed class="foobar"></oembed></p></figure>'
			);
		} );

		it( 'should allow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				styles: 'color'
			} ] );

			const inputHtml =
			'<figure class="media" style="color:red;">' +
				'<oembed style="color:red;" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
			'</figure>';

			editor.setData( inputHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<htmlFigure htmlFigureAttributes="(1)">' +
					'<paragraph>' +
						'<htmlOembed htmlContent="" htmlOembedAttributes="(2)"></htmlOembed>' +
					'</paragraph>' +
				'</htmlFigure>',
				attributes: {
					1: {
						styles: { color: 'red' }
					},
					2: '',
					3: {
						styles: { color: 'red' }
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure style="color:red;"><p><oembed style="color:red;"></oembed></p></figure>'
			);
		} );

		it( 'should disallow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				attributes: /^data-.*$/
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|oembed)$/,
				attributes: /^data-.*$/
			} ] );

			editor.setData(
				'<figure class="media" data-figure="data-figure-value">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-oembed="data-oembed-value"></oembed>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<htmlFigure><paragraph><htmlOembed htmlContent=""></htmlOembed></paragraph></htmlFigure>',
				attributes: {
					1: ''
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure><p><oembed></oembed></p></figure>'
			);
		} );

		it( 'should disallow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				classes: 'foobar'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|oembed)$/,
				classes: 'foobar'
			} ] );

			editor.setData(
				'<figure class="media foobar">' +
					'<oembed class="foobar" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<htmlFigure><paragraph><htmlOembed htmlContent=""></htmlOembed></paragraph></htmlFigure>',
				attributes: {
					1: ''
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure><p><oembed></oembed></p></figure>'
			);
		} );

		it( 'should disallow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				styles: 'color'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|oembed)$/,
				styles: 'color'
			} ] );

			editor.setData(
				'<figure class="media" style="color:red;">' +
					'<oembed style="color:red;" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<htmlFigure><paragraph><htmlOembed htmlContent=""></htmlOembed></paragraph></htmlFigure>',
				attributes: {
					1: ''
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure><p><oembed></oembed></p></figure>'
			);
		} );

		it( 'should not set attributes on non existing figure', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|oembed)$/,
				attributes: true
			} ] );

			editor.setData(
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<paragraph><htmlOembed htmlContent="" htmlOembedAttributes="(1)"></htmlOembed></paragraph>',
				attributes: {
					1: '',
					2: {
						attributes: {
							'data-foo': 'foo',
							'url': 'https://www.youtube.com/watch?v=ZVv7UMQPEWk'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p><oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed></p>'
			);
		} );

		it( 'should not break figure integration for other features', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|figcaption|oembed)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<figure class="media" data-figure="oembed">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
				'</figure>' +
				'<figure data-figure="standalone">' +
					'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<htmlFigure htmlFigureAttributes="(1)">' +
					'<paragraph>' +
						'<htmlOembed htmlContent=""></htmlOembed>' +
					'</paragraph>' +
				'</htmlFigure>' +
				'<htmlFigure htmlFigureAttributes="(2)">' +
					'<htmlFigcaption htmlFigcaptionAttributes="(3)">foobar</htmlFigcaption>' +
				'</htmlFigure>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'oembed'
						}
					},
					2: '',
					3: {
						attributes: {
							'data-figure': 'standalone'
						}
					},
					4: {
						attributes: {
							'data-figcaption': 'figcaption'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<figure data-figure="oembed">' +
					'<p>' +
						'<oembed></oembed>' +
					'</p>' +
				'</figure>' +
				'<figure data-figure="standalone">' +
					'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlOembedAttributes',
				'htmlFigureAttributes'
			].forEach( attributeName => {
				editor.conversion.for( 'downcast' ).add( dispatcher => {
					dispatcher.on( `attribute:${ attributeName }:htmlOembed`, ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'high' } );
				} );
			} );

			editor.conversion.for( 'downcast' ).add( dispatcher => {
				dispatcher.on( 'attribute:htmlFigureAttributes:htmlFigure', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, evt.name );
				}, { priority: 'high' } );
			} );

			dataFilter.allowElement( /^(figure|oembed)$/ );
			dataFilter.allowAttributes( {
				name: /^(figure|oembed)$/,
				attributes: { 'data-foo': true }
			} );

			editor.setData(
				'<figure class="media" data-foo="foo">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure><p><oembed></oembed></p></figure>'
			);
		} );

		it( 'should create a marker before GHS converts attributes (with marker on the figure element)', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /.*/,
				attributes: true,
				styles: true,
				classes: true
			} ] );

			editor.conversion.for( 'upcast' ).dataToMarker( {
				view: 'commented'
			} );

			// Apply filtering rules added after initial data load.
			editor.setData( '' );

			editor.setData(
				'<figure class="media" data-foo="foo" data-commented-end-after="foo:id" data-commented-start-before="foo:id">' +
					'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="media" data-foo="foo">' +
					'<p><oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-foo="foo"></oembed></p>' +
				'</figure>'
			);

			const marker = model.markers.get( 'commented:foo:id' );

			expect( marker.getStart().path ).to.deep.equal( [ 0 ] );
			expect( marker.getEnd().path ).to.deep.equal( [ 1 ] );
		} );

		// it( 'should allow modifying styles, classes and attributes ', () => {
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(figure|oembed|div|p)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<figure class="foo" data-figure="data-figure-value">' +
		// 			'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" class="foobar"' +
		// 			' style="color:green;" data-oembed="data-oembed-value"></oembed>' +
		// 		'</figure>'
		// 	);

		// 	const figureElement = model.document.getRoot().getChild( 0 );
		// 	const oEmbedElement = model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, oEmbedElement, 'htmlAttributes', 'styles', {
		// 			'background-color': 'blue',
		// 			color: 'red'
		// 		} );
		// 		setModelHtmlAttribute( writer, figureElement, 'htmlAttributes', 'styles', {
		// 			'font-size': '12px',
		// 			'text-align': 'center'
		// 		} );

		// 		setModelHtmlAttribute( writer, oEmbedElement, 'htmlAttributes', 'attributes', {
		// 			'data-oembed': 'foo'
		// 		} );
		// 		setModelHtmlAttribute( writer, figureElement, 'htmlAttributes', 'attributes', {
		// 			'data-figure': 'bar'
		// 		} );

		// 		setModelHtmlAttribute( writer, oEmbedElement, 'htmlAttributes', 'classes', [ 'bar', 'baz' ] );
		// 		setModelHtmlAttribute( writer, figureElement, 'htmlAttributes', 'classes', [ 'foobar' ] );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
		// 		data:
		// 		'<htmlFigure htmlAttributes="(1)">' +
		// 			'<paragraph>' +
		// 				'<htmlOembed htmlAttributes="(2)" htmlContent=""></htmlOembed>' +
		// 			'</paragraph>' +
		// 		'</htmlFigure>',
		// 		attributes: {
		// 			1: {
		// 				attributes: {
		// 					'data-figure': 'bar'
		// 				},
		// 				classes: [ 'foobar' ],
		// 				styles: {
		// 					'font-size': '12px',
		// 					'text-align': 'center'
		// 				}
		// 			},
		// 			2: {
		// 				attributes: {
		// 					'data-oembed': 'foo'
		// 				},
		// 				classes: [ 'bar', 'baz' ],
		// 				styles: {
		// 					'background-color': 'blue',
		// 					color: 'red'
		// 				}
		// 			},
		// 			3: ''
		// 		}
		// 	} );

		// 	// TODO: this should pass, but oembed attributes are not applied in the editing view.
		// 	// Should be fixed by https://github.com/ckeditor/ckeditor5/issues/11532
		// 	// expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
		// 	// 	'<figure class="ck-widget ck-widget_selected foobar" contenteditable="false"' +
		// 	// 			' style="font-size:12px;text-align:center;" data-figure="bar">' +
		// 	// 		'<div class="ck-media__wrapper" data-oembed-url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"' +
		// 	// 			' data-oembed="foo" class="bar baz" style="background-color:blue;color:red;">' +
		// 	// 		'</div>' +
		// 	// 		'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
		// 	// 	'</figure>'
		// 	// );

		// 	expect( editor.getData() ).to.equal(
		// 		'<figure class="foobar" style="font-size:12px;text-align:center;" data-figure="bar">' +
		// 			'<p><oembed class="bar baz" style="background-color:blue;color:red;"' +
		// 			' url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"' +
		// 			' data-oembed="foo"></oembed></p>' +
		// 		'</figure>'
		// 	);
		// } );

		// it( 'should allow removing all styles, classes and attributes ', () => {
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(figure|oembed)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<figure class="media foo" data-figure="data-figure-value">' +
		// 			'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" class="foobar"' +
		// 			' style="color:green;" data-oembed="data-oembed-value"></oembed>' +
		// 		'</figure>'
		// 	);

		// 	const figureElement = model.document.getRoot().getChild( 0 );
		// 	const oEmbedElement = model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, oEmbedElement, 'htmlAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, figureElement, 'htmlAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, oEmbedElement, 'htmlAttributes', 'attributes', null );
		// 		setModelHtmlAttribute( writer, figureElement, 'htmlAttributes', 'attributes', null );
		// 		setModelHtmlAttribute( writer, oEmbedElement, 'htmlAttributes', 'classes', null );
		// 		setModelHtmlAttribute( writer, figureElement, 'htmlAttributes', 'classes', null );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
		// 		data:
		// 			'<htmlFigure>' +
		// 				'<paragraph>' +
		// 					'<htmlOembed htmlContent=""></htmlOembed>' +
		// 				'</paragraph>' +
		// 			'</htmlFigure>',
		// 		attributes: {
		// 			1: ''
		// 		}
		// 	} );

		// 	// TODO: This test passes, but I think it's wrong.
		// 	expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
		// 		'<figure>' +
		// 			'<p>' +
		// 				'<span class="ck-widget html-object-embed" contenteditable="false" data-html-object-embed-label="HTML object">' +
		// 					'<oembed class="html-object-embed__content"></oembed>' +
		// 				'</span>' +
		// 			'</p>' +
		// 		'</figure>'
		// 	);

		// 	// TODO: This test fails, but shouldn't.
		// 	expect( editor.getData() ).to.equal(
		// 		'<figure class="media">' +
		// 			'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed>' +
		// 		'</figure>'
		// 	);
		// } );
	} );
} );
