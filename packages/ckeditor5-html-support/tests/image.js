/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/

import { range } from 'lodash-es';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Image from '@ckeditor/ckeditor5-image/src/image';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { getModelDataWithAttributes } from './_utils/utils';
import GeneralHtmlSupport from '../src/generalhtmlsupport';

/* global document */

describe( 'ImageElementSupport', () => {
	let editor, model, editorElement, dataFilter;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image, ImageCaption, Paragraph, GeneralHtmlSupport ]
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

	describe( 'BlockImage', () => {
		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
			'<figure class="image" data-figure="figure">' +
				'<img src="/assets/sample.png" data-image="image">' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png"></imageBlock>',
				attributes: {
					1: {
						attributes: {
							'data-image': 'image'
						}
					},
					2: {
						attributes: {
							'data-figure': 'figure'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml =
			'<figure class="image foobar">' +
				'<img class="foobar" src="/assets/sample.png">' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png"></imageBlock>',
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
				name: /^(figure|img|figcaption)$/,
				styles: 'color'
			} ] );

			const expectedHtml =
			'<figure class="image" style="color:red;">' +
				'<img style="color:red;" src="/assets/sample.png">' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png"></imageBlock>',
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
				name: /^(figure|img|figcaption)$/,
				attributes: /^data-.*$/
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				attributes: /^data-.*$/
			} ] );

			editor.setData(
				'<figure class="image" data-figure="figure">' +
					'<img data-image="image" src="/assets/sample.png">' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock src="/assets/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<img src="/assets/sample.png">' +
				'</figure>'
			);
		} );

		it( 'should disallow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				classes: 'foobar'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				classes: 'foobar'
			} ] );

			editor.setData(
				'<figure class="image foobar">' +
					'<image class="foobar" src="/assets/sample.png">' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock src="/assets/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<img src="/assets/sample.png">' +
				'</figure>'
			);
		} );

		it( 'should disallow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				styles: 'color'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				styles: 'color'
			} ] );

			editor.setData(
				'<figure class="image" style="color:red;">' +
					'<img style="color:red;" src="/assets/sample.png">' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock src="/assets/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<img src="/assets/sample.png">' +
				'</figure>'
			);
		} );

		it( 'should not break figure integration for other features', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|figcaption|img)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<figure class="image" data-figure="image">' +
					'<img src="/assets/sample.png" data-image="image">' +
				'</figure>' +
				'<figure data-figure="standalone">' +
					'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png"></imageBlock>' +
					'<htmlFigure htmlAttributes="(3)">' +
						'<htmlFigcaption htmlAttributes="(4)">foobar</htmlFigcaption>' +
					'</htmlFigure>',
				attributes: {
					1: {
						attributes: {
							'data-image': 'image'
						}
					},
					2: {
						attributes: {
							'data-figure': 'image'
						}
					},
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

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlAttributes',
				'htmlFigureAttributes'
			].forEach( attributeName => {
				editor.conversion.for( 'downcast' ).add( dispatcher => {
					dispatcher.on( `attribute:${ attributeName }:imageBlock`, ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'high' } );
				} );
			} );

			dataFilter.allowElement( /^(figure|img)$/ );
			dataFilter.allowAttributes( {
				name: /^(figure|figcaption|img)$/,
				attributes: { 'data-foo': true }
			} );

			editor.setData(
				'<figure class="image" data-foo="foo">' +
					'<img src="/assets/sample.png" data-foo="foo">' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="image"><img src="/assets/sample.png"></figure>'
			);
		} );
	} );

	describe( 'BlockImage with link', () => {
		// TODO:
	} );

	describe( 'BlockImage with caption', () => {
		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
			'<figure class="image" data-figure="figure">' +
				'<img src="/assets/sample.png" data-image="image">' +
				'<figcaption data-figcaption="figcaption">A caption</figcaption>' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png">' +
					'<caption htmlAttributes="(3)">A caption</caption>' +
				'</imageBlock>',
				attributes: {
					1: {
						attributes: {
							'data-image': 'image'
						}
					},
					2: {
						attributes: {
							'data-figure': 'figure'
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

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml =
			'<figure class="image foobar">' +
				'<img class="foobar" src="/assets/sample.png">' +
				'<figcaption class="foobar">A caption</figcaption>' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png">' +
					'<caption htmlAttributes="(3)">A caption</caption>' +
				'</imageBlock>',
				attributes: range( 1, 4 ).reduce( ( attributes, index ) => {
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
				name: /^(figure|img|figcaption)$/,
				styles: 'color'
			} ] );

			const expectedHtml =
			'<figure class="image" style="color:red;">' +
				'<img style="color:red;" src="/assets/sample.png">' +
				'<figcaption style="color:red;">A caption</figcaption>' +
			'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png">' +
					'<caption htmlAttributes="(3)">A caption</caption>' +
				'</imageBlock>',
				attributes: range( 1, 4 ).reduce( ( attributes, index ) => {
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
				name: /^(figure|img|figcaption)$/,
				attributes: /^data-.*$/
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				attributes: /^data-.*$/
			} ] );

			editor.setData(
				'<figure class="image" data-figure="figure">' +
					'<img data-image="image" src="/assets/sample.png">' +
					'<figcaption data-figcaption="figcaption">A caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock src="/assets/sample.png"><caption>A caption</caption></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<img src="/assets/sample.png">' +
					'<figcaption>A caption</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should disallow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				classes: 'foobar'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				classes: 'foobar'
			} ] );

			editor.setData(
				'<figure class="image foobar">' +
					'<image class="foobar" src="/assets/sample.png">' +
					'<figcaption class="foobar">A caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock src="/assets/sample.png"><caption>A caption</caption></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<img src="/assets/sample.png">' +
					'<figcaption>A caption</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should disallow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				styles: 'color'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				styles: 'color'
			} ] );

			editor.setData(
				'<figure class="image" style="color:red;">' +
					'<img style="color:red;" src="/assets/sample.png">' +
					'<figcaption style="color:red;">A caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock src="/assets/sample.png"><caption>A caption</caption></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<img src="/assets/sample.png">' +
					'<figcaption>A caption</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should not break figure integration for other features', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|figcaption|img)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<figure class="image" data-figure="image">' +
					'<img src="/assets/sample.png" data-image="image">' +
				'</figure>' +
				'<figure data-figure="standalone">' +
					'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png"></imageBlock>' +
					'<htmlFigure htmlAttributes="(3)">' +
						'<htmlFigcaption htmlAttributes="(4)">foobar</htmlFigcaption>' +
					'</htmlFigure>',
				attributes: {
					1: {
						attributes: {
							'data-image': 'image'
						}
					},
					2: {
						attributes: {
							'data-figure': 'image'
						}
					},
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

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlAttributes',
				'htmlFigureAttributes'
			].forEach( attributeName => {
				editor.conversion.for( 'downcast' ).add( dispatcher => {
					dispatcher.on( `attribute:${ attributeName }:imageBlock`, ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'high' } );
				} );
			} );

			dataFilter.allowElement( /^(figure|img)$/ );
			dataFilter.allowAttributes( {
				name: /^(figure|figcaption|img)$/,
				attributes: { 'data-foo': true }
			} );

			editor.setData(
				'<figure class="image" data-foo="foo">' +
					'<img src="/assets/sample.png" data-foo="foo">' +
					'<figcaption data-foo="foo">A caption</figcaption>' +
				'</figure>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<img src="/assets/sample.png">' +
					'<figcaption>A caption</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should handle mixed allowed and disallowed attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				attributes: /^data-.*$/,
				classes: [ 'allow', 'disallow' ],
				styles: [ 'color', 'background' ]
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				attributes: 'data-disallow',
				classes: 'disallow',
				styles: 'background'
			} ] );

			/* eslint-disable max-len */
			editor.setData(
				'<figure class="image allow disallow invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
					'<img src="/assets/sample.png" class="allow disallow invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
					'<figcaption class="allow disallow invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">A caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
				'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png"><caption htmlAttributes="(3)">A caption</caption></imageBlock>',
				attributes: range( 1, 4 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						attributes: {
							'data-allow': 'allow'
						},
						styles: {
							color: 'red'
						},
						classes: [ 'allow' ]
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="image allow" style="color:red;" data-allow="allow">' +
					'<img class="allow" style="color:red;" src="/assets/sample.png" data-allow="allow">' +
					'<figcaption class="allow" style="color:red;" data-allow="allow">A caption</figcaption>' +
				'</figure>'
			);
			/* eslint-enable max-len */
		} );
	} );
} );
