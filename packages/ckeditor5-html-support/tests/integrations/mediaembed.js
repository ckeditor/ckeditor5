/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import GeneralHtmlSupport from '../../src/generalhtmlsupport';
import { getModelDataWithAttributes } from '../_utils/utils';
import { range } from 'lodash-es';

/* global document */

describe( 'MediaEmbedElementSupport', () => {
	describe( 'MediaEmbed feature is available', () => {
		let editor, model, editorElement, dataFilter;

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, GeneralHtmlSupport, MediaEmbed ]
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

			const expectedHtml =
			'<figure class="media" data-figure="data-figure-value">' +
				'<oembed url="https://www.youtube.com/watch?v=ZVv7UMQPEWk" data-oembed="data-oembed-value"></oembed>' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<media htmlAttributes="(1)" htmlFigureAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
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
				'<media htmlAttributes="(1)" htmlFigureAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
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
				'<media htmlAttributes="(1)" htmlFigureAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
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
				'<media htmlAttributes="(1)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
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
				'<htmlFigure htmlAttributes="(2)">' +
					'<htmlFigcaption htmlAttributes="(3)">foobar</htmlFigcaption>' +
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
				'htmlAttributes',
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
					'<media htmlAttributes="(1)" htmlFigureAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
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
				'<media htmlAttributes="(1)" htmlFigureAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
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
				'<media htmlAttributes="(1)" htmlFigureAttributes="(2)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
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
				'<media htmlAttributes="(1)" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></media>',
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
				'<htmlFigure htmlAttributes="(2)">' +
					'<htmlFigcaption htmlAttributes="(3)">foobar</htmlFigcaption>' +
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
				'htmlAttributes',
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
				'<htmlFigure htmlAttributes="(1)">' +
					'<paragraph>' +
						'<htmlOembed htmlAttributes="(2)" htmlContent=""></htmlOembed>' +
					'</paragraph>' +
				'</htmlFigure>',
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
					},
					3: ''
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
				'<htmlFigure htmlAttributes="(1)">' +
					'<paragraph>' +
						'<htmlOembed htmlAttributes="(2)" htmlContent=""></htmlOembed>' +
					'</paragraph>' +
				'</htmlFigure>',
				attributes: {
					1: {
						classes: [ 'media', 'foobar' ]
					},
					2: {
						classes: [ 'foobar' ]
					},
					3: ''
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
				'<htmlFigure htmlAttributes="(1)">' +
					'<paragraph>' +
						'<htmlOembed htmlAttributes="(2)" htmlContent=""></htmlOembed>' +
					'</paragraph>' +
				'</htmlFigure>',
				attributes: {
					1: {
						styles: { color: 'red' }
					},
					2: {
						styles: { color: 'red' }
					},
					3: ''
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
				'<paragraph><htmlOembed htmlAttributes="(1)" htmlContent=""></htmlOembed></paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'foo',
							'url': 'https://www.youtube.com/watch?v=ZVv7UMQPEWk'
						}
					},
					2: ''
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p><oembed data-foo="foo" url="https://www.youtube.com/watch?v=ZVv7UMQPEWk"></oembed></p>'
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
				'<htmlFigure htmlAttributes="(1)">' +
					'<paragraph>' +
						'<htmlOembed htmlContent=""></htmlOembed>' +
					'</paragraph>' +
				'</htmlFigure>' +
				'<htmlFigure htmlAttributes="(2)">' +
					'<htmlFigcaption htmlAttributes="(3)">foobar</htmlFigcaption>' +
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
				'htmlAttributes',
				'htmlFigureAttributes'
			].forEach( attributeName => {
				editor.conversion.for( 'downcast' )
					.add( dispatcher => {
						dispatcher.on( `attribute:${ attributeName }:htmlOembed`, ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } );
					} )
					.add( dispatcher => {
						dispatcher.on( `attribute:${ attributeName }:htmlFigure`, ( evt, data, conversionApi ) => {
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
				'<figure><p><oembed></oembed></p></figure>'
			);
		} );
	} );
} );
