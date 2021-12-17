/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/

import { range } from 'lodash-es';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { getModelDataWithAttributes } from '../_utils/utils';
import GeneralHtmlSupport from '../../src/generalhtmlsupport';

/* global document */

describe( 'ImageElementSupport', () => {
	let editor, model, editorElement, dataFilter;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image, ImageCaption, LinkImage, Paragraph, GeneralHtmlSupport ]
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
				data: '<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png"></imageBlock>',
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
				data: '<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png"></imageBlock>',
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
				data: '<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png"></imageBlock>',
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
				data: '<imageBlock src="/assets/sample.png"></imageBlock>',
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
				data: '<imageBlock src="/assets/sample.png"></imageBlock>',
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
				data: '<imageBlock src="/assets/sample.png"></imageBlock>',
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

		it( 'should not double convert figure element', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^.*$/,
				styles: true,
				attributes: true,
				classes: true
			} ] );

			const expectedHtml =
				'<figure class="image">' +
					'<img src="/assets/sample.png">' +
				'</figure>';

			editor.setData( expectedHtml );

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
		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|a)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<figure class="image" data-figure="figure">' +
					'<a href="www.example.com" data-link="link"><img src="/assets/sample.png" data-image="image"></a>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" htmlLinkAttributes="(3)" ' +
						'linkHref="www.example.com" src="/assets/sample.png">' +
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
							'data-link': 'link'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|a)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml =
				'<figure class="image foobar">' +
					'<a class="foobar" href="www.example.com">' +
						'<img class="foobar" src="/assets/sample.png">' +
					'</a>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" htmlLinkAttributes="(3)" ' +
						'linkHref="www.example.com" src="/assets/sample.png">' +
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
				name: /^(figure|img|a)$/,
				styles: 'color'
			} ] );

			const expectedHtml =
				'<figure class="image" style="color:red;">' +
					'<a style="color:red;" href="www.example.com">' +
						'<img style="color:red;" src="/assets/sample.png">' +
					'</a>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" htmlLinkAttributes="(3)" ' +
						'linkHref="www.example.com" src="/assets/sample.png">' +
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
				name: /^(figure|img|a)$/,
				attributes: /^data-.*$/
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(figure|img|a)$/,
				attributes: /^data-.*$/
			} ] );

			editor.setData(
				'<figure class="image" data-figure="figure">' +
					'<a href="www.example.com" data-link="link">' +
						'<img data-image="image" src="/assets/sample.png">' +
					'</a>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<imageBlock linkHref="www.example.com" src="/assets/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<a href="www.example.com">' +
						'<img src="/assets/sample.png">' +
					'</a>' +
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
					'<a class="foobar" href="www.example.com">' +
						'<image class="foobar" src="/assets/sample.png">' +
					'</a>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<imageBlock linkHref="www.example.com" src="/assets/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<a href="www.example.com">' +
						'<img src="/assets/sample.png">' +
					'</a>' +
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
					'<a href="www.example.com" style="color:red;">' +
						'<img style="color:red;" src="/assets/sample.png">' +
					'</a>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<imageBlock linkHref="www.example.com" src="/assets/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<figure class="image">' +
					'<a href="www.example.com">' +
						'<img src="/assets/sample.png">' +
					'</a>' +
				'</figure>'
			);
		} );

		it( 'should not break figure integration for other features', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|figcaption|img|a)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<figure class="image" data-figure="image">' +
					'<a href="www.example.com" data-link="link">' +
						'<img src="/assets/sample.png" data-image="image">' +
					'</a>' +
				'</figure>' +
				'<figure data-figure="standalone">' +
					'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" htmlLinkAttributes="(3)" ' +
						'linkHref="www.example.com" src="/assets/sample.png">' +
					'</imageBlock>' +
					'<htmlFigure htmlAttributes="(4)">' +
						'<htmlFigcaption htmlAttributes="(5)">foobar</htmlFigcaption>' +
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
							'data-link': 'link'
						}
					},
					4: {
						attributes: {
							'data-figure': 'standalone'
						}
					},
					5: {
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

		it( 'should keep both links inside figure processed separately', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption|a)$/,
				attributes: /^data-.*$/,
				classes: 'foobar',
				styles: 'color'
			} ] );

			const expectedHtml =
				'<figure class="image foobar" style="color:red;" data-figure="figure">' +
					'<a class="foobar" style="color:red;" href="www.example.com" data-link="link">' +
						'<img class="foobar" style="color:red;" src="/assets/sample.png" data-image="image">' +
					'</a>' +
					'<figcaption class="foobar" style="color:red;" data-figcaption="figcaption">' +
						'<a class="foobar" style="color:red;" href="www.example.com/2" data-link2="link2">foobar</a>' +
					'</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" htmlLinkAttributes="(3)" ' +
						'linkHref="www.example.com" src="/assets/sample.png">' +
						'<caption htmlAttributes="(4)">' +
							'<$text htmlA="(5)" linkHref="www.example.com/2">foobar</$text>' +
						'</caption>' +
					'</imageBlock>',
				attributes: {
					1: {
						attributes: {
							'data-image': 'image'
						},
						classes: [
							'foobar'
						],
						styles: {
							'color': 'red'
						}
					},
					2: {
						attributes: {
							'data-figure': 'figure'
						},
						classes: [
							'foobar'
						],
						styles: {
							'color': 'red'
						}
					},
					3: {
						attributes: {
							'data-link': 'link'
						},
						classes: [
							'foobar'
						],
						styles: {
							'color': 'red'
						}
					},
					4: {
						attributes: {
							'data-figcaption': 'figcaption'
						},
						classes: [
							'foobar'
						],
						styles: {
							'color': 'red'
						}
					},
					5: {
						attributes: {
							'data-link2': 'link2'
						},
						classes: [
							'foobar'
						],
						styles: {
							'color': 'red'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );
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
				data: '<imageBlock src="/assets/sample.png"><caption>A caption</caption></imageBlock>',
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
				data: '<imageBlock src="/assets/sample.png"><caption>A caption</caption></imageBlock>',
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
				data: '<imageBlock src="/assets/sample.png"><caption>A caption</caption></imageBlock>',
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
					'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/assets/sample.png">' +
						'<caption htmlAttributes="(3)">A caption</caption>' +
					'</imageBlock>',
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

	describe( 'InlineImage', () => {
		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml = '<p data-paragraph="paragraph"><img src="/assets/sample.png" data-image="image"></p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlAttributes="(1)">' +
						'<imageInline htmlAttributes="(2)" src="/assets/sample.png"></imageInline>' +
					'</paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-paragraph': 'paragraph'
						}
					},
					2: {
						attributes: {
							'data-image': 'image'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml = '<p class="foobar"><img class="foobar" src="/assets/sample.png"></p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlAttributes="(1)">' +
						'<imageInline htmlAttributes="(2)" src="/assets/sample.png"></imageInline>' +
					'</paragraph>',
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
				name: /^(img|p)$/,
				styles: 'color'
			} ] );

			const expectedHtml = '<p style="color:red;"><img style="color:red;" src="/assets/sample.png"></p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlAttributes="(1)">' +
						'<imageInline htmlAttributes="(2)" src="/assets/sample.png"></imageInline>' +
					'</paragraph>',
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
				name: /^(img|p)$/,
				attributes: /^data-.*$/
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(img|p)$/,
				attributes: /^data-.*$/
			} ] );

			editor.setData(
				'<p data-paragraph="paragraph"><img data-image="image" src="/assets/sample.png"></p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<p><img src="/assets/sample.png"></p>'
			);
		} );

		it( 'should disallow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p)$/,
				classes: 'foobar'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(img|p)$/,
				classes: 'foobar'
			} ] );

			editor.setData(
				'<p class="foobar"><image class="foobar" src="/assets/sample.png"></p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<p><img src="/assets/sample.png"></p>'
			);
		} );

		it( 'should disallow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p)$/,
				styles: 'color'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(img|p)$/,
				styles: 'color'
			} ] );

			editor.setData(
				'<p style="color:red;">' +
					'<img style="color:red;" src="/assets/sample.png">' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).to.equal(
				'<p>' +
					'<img src="/assets/sample.png">' +
				'</p>'
			);
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlAttributes',
				'htmlFigureAttributes'
			].forEach( attributeName => {
				editor.conversion.for( 'downcast' ).add( dispatcher => {
					dispatcher.on( `attribute:${ attributeName }:imageInline`, ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'high' } );
				} );
			} );

			dataFilter.allowElement( /^(img|p)$/ );
			dataFilter.allowAttributes( {
				name: /^(img|p)$/,
				attributes: { 'data-foo': true }
			} );

			editor.setData(
				'<p>' +
					'<img src="/assets/sample.png" data-foo="foo">' +
				'</p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><img src="/assets/sample.png"></p>'
			);
		} );
	} );

	describe( 'Inline image with link', () => {
		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p|a)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<p data-paragraph="paragraph">' +
					'<a href="www.example.com" data-link="link">' +
						'<img src="/assets/sample.png" data-image="image">' +
					'</a>' +
				'</p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlAttributes="(1)">' +
						'<imageInline htmlA="(2)" htmlAttributes="(3)" linkHref="www.example.com" src="/assets/sample.png"></imageInline>' +
					'</paragraph>',
				attributes: {
					1: {
						attributes: {
							'data-paragraph': 'paragraph'
						}
					},
					2: {
						attributes: {
							'data-link': 'link'
						}
					},
					3: {
						attributes: {
							'data-image': 'image'
						}
					}
				}
			} );

			expect( editor.getData() ).to.equal( expectedHtml );
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p|a)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml =
				'<p class="foobar">' +
					'<a class="foobar" href="www.example.com">' +
						'<img class="foobar" src="/assets/sample.png">' +
					'</a>' +
				'</p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlAttributes="(1)">' +
						'<imageInline htmlA="(2)" htmlAttributes="(3)" linkHref="www.example.com" src="/assets/sample.png"></imageInline>' +
					'</paragraph>',
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
				name: /^(img|p|a)$/,
				styles: 'color'
			} ] );

			const expectedHtml =
				'<p style="color:red;">' +
					'<a style="color:red;" href="www.example.com">' +
						'<img style="color:red;" src="/assets/sample.png">' +
					'</a>' +
				'</p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data:
					'<paragraph htmlAttributes="(1)">' +
						'<imageInline htmlA="(2)" htmlAttributes="(3)" linkHref="www.example.com" src="/assets/sample.png"></imageInline>' +
					'</paragraph>',
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
				name: /^(img|p|a)$/,
				attributes: /^data-.*$/
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(img|p|a)$/,
				attributes: /^data-.*$/
			} ] );

			editor.setData(
				'<p data-paragraph="paragraph">' +
					'<a href="www.example.com" data-image="image">' +
						'<img data-image="image" src="/assets/sample.png">' +
					'</a>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><imageInline htmlA="(1)" linkHref="www.example.com" src="/assets/sample.png"></imageInline></paragraph>',
				attributes: {
					1: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p><a href="www.example.com"><img src="/assets/sample.png"></a></p>'
			);
		} );

		it( 'should disallow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p|a)$/,
				classes: 'foobar'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(img|p|a)$/,
				classes: 'foobar'
			} ] );

			editor.setData(
				'<p class="foobar"><a class="foobar" href="www.example.com"><img class="foobar" src="/assets/sample.png"></a></p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><imageInline htmlA="(1)" linkHref="www.example.com" src="/assets/sample.png"></imageInline></paragraph>',
				attributes: {
					1: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p><a href="www.example.com"><img src="/assets/sample.png"></a></p>'
			);
		} );

		it( 'should disallow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p|a)$/,
				styles: 'color'
			} ] );

			dataFilter.loadDisallowedConfig( [ {
				name: /^(img|p|a)$/,
				styles: 'color'
			} ] );

			editor.setData(
				'<p style="color:red;">' +
					'<a href="www.example.com" style="color:red;">' +
						'<img style="color:red;" src="/assets/sample.png">' +
					'</a>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
				data: '<paragraph><imageInline htmlA="(1)" linkHref="www.example.com" src="/assets/sample.png"></imageInline></paragraph>',
				attributes: {
					1: {}
				}
			} );

			expect( editor.getData() ).to.equal(
				'<p><a href="www.example.com"><img src="/assets/sample.png"></a></p>'
			);
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlAttributes',
				'htmlFigureAttributes'
			].forEach( attributeName => {
				editor.conversion.for( 'downcast' ).add( dispatcher => {
					dispatcher.on( `attribute:${ attributeName }:imageInline`, ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'high' } );
				} );
			} );

			dataFilter.allowElement( /^(img|p|a)$/ );
			dataFilter.allowAttributes( {
				name: /^(img|p|a)$/,
				attributes: { 'data-foo': true }
			} );

			editor.setData(
				'<p><a href="www.example.com"><img src="/assets/sample.png" data-foo="foo"></a></p>'
			);

			expect( editor.getData() ).to.equal(
				'<p><a href="www.example.com"><img src="/assets/sample.png"></a></p>'
			);
		} );
	} );

	describe( 'Partial load of image plugins', () => {
		let editorElement, editor;

		it( 'should only extend imageBlock model if only ImageBlockEditing is present', () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ ImageBlockEditing, ImageCaption, LinkImage, Paragraph, GeneralHtmlSupport ]
				} )
				.then( newEditor => {
					editor = newEditor;
					const model = editor.model;
					const schema = model.schema;
					const dataFilter = editor.plugins.get( 'DataFilter' );

					dataFilter.loadAllowedConfig( [ {
						name: /^(img)$/
					} ] );

					expect( schema.getDefinition( 'imageBlock' ).allowAttributes ).to.deep.equal( [
						'alt',
						'src',
						'srcset',
						'linkHref',
						'htmlAttributes',
						'htmlFigureAttributes',
						'htmlLinkAttributes'
					] );

					expect( schema.getDefinition( 'imageInline' ) ).to.be.undefined;
				} );
		} );

		it( 'should only extend imageInline model if only ImageInlineEditing is present', () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ ImageInlineEditing, ImageCaption, Paragraph, GeneralHtmlSupport ]
				} )
				.then( newEditor => {
					editor = newEditor;
					const model = editor.model;
					const schema = model.schema;
					const dataFilter = editor.plugins.get( 'DataFilter' );

					dataFilter.loadAllowedConfig( [ {
						name: /^(img)$/
					} ] );

					expect( schema.getDefinition( 'imageInline' ).allowAttributes ).to.deep.equal( [
						'alt',
						'src',
						'srcset',
						'htmlA',
						'htmlAttributes'
					] );

					expect( schema.getDefinition( 'imageBlock' ) ).to.be.undefined;
				} );
		} );

		it( 'should not extend image schemas if no image plugin is available', () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, GeneralHtmlSupport ]
				} )
				.then( newEditor => {
					editor = newEditor;
					const model = editor.model;
					const schema = model.schema;
					const dataFilter = editor.plugins.get( 'DataFilter' );

					dataFilter.loadAllowedConfig( [ {
						name: /^(img)$/
					} ] );

					expect( schema.getDefinition( 'imageBlock' ).allowAttributes ).to.deep.equal( [
						'htmlAttributes'
					] );
					expect( schema.getDefinition( 'imageInline' ).allowAttributes ).to.deep.equal( [
						'htmlAttributes'
					] );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );
	} );
} );
