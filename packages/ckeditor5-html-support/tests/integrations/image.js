/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { range } from 'es-toolkit/compat';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Image, ImageCaption, ImageBlockEditing, ImageInlineEditing } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { getModelDataWithAttributes } from '../_utils/utils.js';
import { GeneralHtmlSupport } from '../../src/generalhtmlsupport.js';
import { ImageElementSupport } from '../../src/integrations/image.js';

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

	it( 'should be named', () => {
		expect( editor.plugins.has( 'ImageElementSupport' ) ).toBe( true );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageElementSupport.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageElementSupport.isPremiumPlugin ).toBe( false );
	} );

	describe( 'BlockImage', () => {
		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<figure class="image" data-figure="figure">' +
					'<img src="/sample.png" data-image="image">' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" src="/sample.png"></imageBlock>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'figure'
						}
					},
					2: {
						attributes: {
							'data-image': 'image'
						}
					}
				}
			} );

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should update image attributes when model attribute is changed programmatically', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img)$/,
				attributes: /^data-.*$/
			} ] );

			editor.setData( '<figure class="image"><img src="/sample.png"></figure>' );

			const imageElement = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'htmlImgAttributes', { attributes: { 'data-foo': 'bar' } }, imageElement );
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image"><img src="/sample.png" data-foo="bar"></figure>'
			);
		} );

		it( 'should not update link attributes when image has no link wrapper', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|a)$/,
				attributes: /^data-.*$/
			} ] );

			// Insert an image without a link.
			editor.setData( '<figure class="image"><img src="/sample.png"></figure>' );

			const imageElement = model.document.getRoot().getChild( 0 );

			// Setting htmlLinkAttributes on a non-linked image triggers the false branch of if ( viewElement )
			// because getDescendantElement does not find an <a> wrapper in the view.
			expect( () => model.change( writer => {
				writer.setAttribute( 'htmlLinkAttributes', { attributes: { 'data-foo': 'bar' } }, imageElement );
			} ) ).not.toThrow();
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml =
				'<figure class="image foobar">' +
					'<img class="foobar" src="/sample.png">' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" src="/sample.png"></imageBlock>',
				attributes: range( 1, 3 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						classes: [ 'foobar' ]
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should allow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				styles: 'color'
			} ] );

			const expectedHtml =
				'<figure class="image" style="color:red;">' +
					'<img style="color:red;" src="/sample.png">' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" src="/sample.png"></imageBlock>',
				attributes: range( 1, 3 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						styles: {
							color: 'red'
						}
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).toBe( expectedHtml );
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
					'<img data-image="image" src="/sample.png">' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock src="/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
					'<img src="/sample.png">' +
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
					'<image class="foobar" src="/sample.png">' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock src="/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
					'<img src="/sample.png">' +
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
					'<img style="color:red;" src="/sample.png">' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock src="/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
					'<img src="/sample.png">' +
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
					'<img src="/sample.png" data-image="image">' +
				'</figure>' +
				'<figure data-figure="standalone">' +
					'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" src="/sample.png"></imageBlock>' +
					'<htmlFigure htmlFigureAttributes="(3)">' +
						'<htmlFigcaption htmlFigcaptionAttributes="(4)">foobar</htmlFigcaption>' +
					'</htmlFigure>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'image'
						}
					},
					2: {
						attributes: {
							'data-image': 'image'
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

			expect( editor.getData() ).toBe( expectedHtml );
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
					'<img src="/sample.png">' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlImgAttributes',
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
					'<img src="/sample.png" data-foo="foo">' +
				'</figure>'
			);

			expect( editor.getData() ).toBe(
				'<figure class="image"><img src="/sample.png"></figure>'
			);
		} );

		it( 'should create a marker before GHS converts attributes and convert custom attributes after', () => {
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
				'<figure class="image" data-commented-end-after="foo:id" data-commented-start-before="foo:id" foo="bar">' +
					'<img src="/sample.png" data-foo="foo">' +
                '</figure>'
			);

			expect( editor.getData() ).toEqual(
				'<figure class="image" foo="bar">' +
					'<img src="/sample.png" data-foo="foo">' +
                '</figure>'
			);

			const marker = model.markers.get( 'commented:foo:id' );

			expect( marker.getStart().path ).toEqual( [ 0 ] );
			expect( marker.getEnd().path ).toEqual( [ 1 ] );
		} );

		describe( 'BlockImage without LinkImage', () => {
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

			it( 'should not upcast `href` attribute if LinkImage plugin is not available', () => {
				dataFilter.loadAllowedConfig( [ {
					name: /.*/,
					attributes: true
				} ] );

				editor.setData(
					'<figure class="image">' +
						'<a href="www.example.com">' +
							'<img src="/sample.png">' +
						'</a>' +
					'</figure>'
				);

				expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
					data: '<imageBlock src="/sample.png"></imageBlock>',
					attributes: {}
				} );

				expect( editor.getData() ).toBe(
					'<figure class="image">' +
						'<img src="/sample.png">' +
					'</figure>'
				);
			} );
		} );

		// it( 'should allow modifying styles, classes and attributes', () => {
		// 	// This should also work when we set `attributes: true` but currently there are some
		// 	// problems related to GHS picking up non-GHS attributes (like src) due to some attributes not
		// 	// being consumed. For now we make GHS to handle only data-xxx attributes to bypass it.
		// 	// @see https://github.com/ckeditor/ckeditor5/issues/11532
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(figure|img)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<figure class="image foo" style="background-color:red;" data-figure="figure">' +
		// 			'<img src="/sample.png" class="bar" style="color:blue;" data-image="image">' +
		// 		'</figure>'
		// 	);

		// 	const imageBlock = model.document.getRoot().getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'styles', {
		// 			'background-color': 'blue',
		// 			color: 'red'
		// 		} );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'styles', {
		// 			'font-size': '12px',
		// 			'text-align': 'center'
		// 		} );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'attributes', {
		// 			'data-image': 'xyz'
		// 		} );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'attributes', {
		// 			'data-figure': 'zzz'
		// 		} );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'classes', [ 'bar', 'baz' ] );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'classes', [ 'foobar' ] );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
		// 		data: '<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" src="/sample.png"></imageBlock>',
		// 		attributes: {
		// 			1: {
		// 				attributes: {
		// 					'data-image': 'xyz'
		// 				},
		// 				classes: [ 'bar', 'baz' ],
		// 				styles: {
		// 					'background-color': 'blue',
		// 					color: 'red'
		// 				}
		// 			},
		// 			2: {
		// 				attributes: {
		// 					'data-figure': 'zzz'
		// 				},
		// 				classes: [ 'foobar' ],
		// 				styles: {
		// 					'font-size': '12px',
		// 					'text-align': 'center'
		// 				}
		// 			}
		// 		}
		// 	} );

		// 	expect(_getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
		// 		'<figure class="ck-widget ck-widget_selected foobar image" contenteditable="false" data-figure="zzz"' +
		// 				' style="font-size:12px;text-align:center">' +
		// 			'<img class="bar baz" data-image="xyz" src="/sample.png" style="background-color:blue;color:red"></img>' +
		// 			'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
		// 		'</figure>'
		// 	);

		// 	expect( editor.getData() ).toBe(
		// 		'<figure class="image foobar" style="font-size:12px;text-align:center;" data-figure="zzz">' +
		// 			'<img class="bar baz" style="background-color:blue;color:red;" src="/sample.png" data-image="xyz">' +
		// 		'</figure>'
		// 	);
		// } );

		// it( 'should allow removing all styles, classes and attributes', () => {
		// 	// This should also work when we set `attributes: true` but currently there are some
		// 	// problems related to GHS picking up non-GHS attributes (like src) due to some attributes not
		// 	// being consumed. For now we make GHS to handle only data-xxx attributes to bypass it.
		// 	// @see https://github.com/ckeditor/ckeditor5/issues/11532
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(figure|img)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<figure class="image foo" style="background-color:red;" data-figure="figure">' +
		// 			'<img src="/sample.png" class="bar" style="color:blue;" data-image="image">' +
		// 		'</figure>'
		// 	);

		// 	const imageBlock = model.document.getRoot().getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'styles', null );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'attributes', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'attributes', null );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'classes', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'classes', null );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
		// 		data: '<imageBlock src="/sample.png"></imageBlock>',
		// 		attributes: {}
		// 	} );

		// 	expect(_getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
		// 		'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
		// 			'<img src="/sample.png"></img>' +
		// 			'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
		// 		'</figure>'
		// 	);

		// 	expect( editor.getData() ).toBe(
		// 		'<figure class="image">' +
		// 			'<img src="/sample.png">' +
		// 		'</figure>'
		// 	);
		// } );
	} );

	describe( 'BlockImage with link', () => {
		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|a)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<figure class="image" data-figure="figure">' +
					'<a href="www.example.com" data-link="link"><img src="/sample.png" data-image="image"></a>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" htmlLinkAttributes="(3)" ' +
						'linkHref="www.example.com" src="/sample.png">' +
					'</imageBlock>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'figure'
						}
					},
					2: {
						attributes: {
							'data-image': 'image'
						}
					},
					3: {
						attributes: {
							'data-link': 'link'
						}
					}
				}
			} );

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|a)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml =
				'<figure class="image foobar">' +
					'<a class="foobar" href="www.example.com">' +
						'<img class="foobar" src="/sample.png">' +
					'</a>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" htmlLinkAttributes="(3)" ' +
						'linkHref="www.example.com" src="/sample.png">' +
					'</imageBlock>',
				attributes: range( 1, 4 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						classes: [ 'foobar' ]
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should allow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|a)$/,
				styles: 'color'
			} ] );

			const expectedHtml =
				'<figure class="image" style="color:red;">' +
					'<a style="color:red;" href="www.example.com">' +
						'<img style="color:red;" src="/sample.png">' +
					'</a>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" htmlLinkAttributes="(3)" ' +
						'linkHref="www.example.com" src="/sample.png">' +
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

			expect( editor.getData() ).toBe( expectedHtml );
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
						'<img data-image="image" src="/sample.png">' +
					'</a>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock linkHref="www.example.com" src="/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
					'<a href="www.example.com">' +
						'<img src="/sample.png">' +
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
						'<image class="foobar" src="/sample.png">' +
					'</a>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock linkHref="www.example.com" src="/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
					'<a href="www.example.com">' +
						'<img src="/sample.png">' +
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
						'<img style="color:red;" src="/sample.png">' +
					'</a>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock linkHref="www.example.com" src="/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
					'<a href="www.example.com">' +
						'<img src="/sample.png">' +
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
						'<img src="/sample.png" data-image="image">' +
					'</a>' +
				'</figure>' +
				'<figure data-figure="standalone">' +
					'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" htmlLinkAttributes="(3)" ' +
						'linkHref="www.example.com" src="/sample.png">' +
					'</imageBlock>' +
					'<htmlFigure htmlFigureAttributes="(4)">' +
						'<htmlFigcaption htmlFigcaptionAttributes="(5)">foobar</htmlFigcaption>' +
					'</htmlFigure>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'image'
						}
					},
					2: {
						attributes: {
							'data-image': 'image'
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

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlImgAttributes',
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
					'<img src="/sample.png" data-foo="foo">' +
				'</figure>'
			);

			expect( editor.getData() ).toBe(
				'<figure class="image"><img src="/sample.png"></figure>'
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
						'<img class="foobar" style="color:red;" src="/sample.png" data-image="image">' +
					'</a>' +
					'<figcaption class="foobar" style="color:red;" data-figcaption="figcaption">' +
						'<a class="foobar" style="color:red;" href="www.example.com/2" data-link2="link2">foobar</a>' +
					'</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" htmlLinkAttributes="(3)" ' +
						'linkHref="www.example.com" src="/sample.png">' +
						'<caption htmlFigcaptionAttributes="(4)">' +
							'<$text htmlA="(5)" linkHref="www.example.com/2">foobar</$text>' +
						'</caption>' +
					'</imageBlock>',
				attributes: {
					1: {
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
					2: {
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

			expect( editor.getData() ).toBe( expectedHtml );
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
				'<figure class="image" data-commented-end-after="foo:id" data-commented-start-before="foo:id">' +
					'<a href="www.example.com">' +
						'<img src="/sample.png">' +
					'</a>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock linkHref="www.example.com" src="/sample.png"></imageBlock>',
				attributes: {}
			} );

			const marker = model.markers.get( 'commented:foo:id' );

			expect( marker.getStart().path ).toEqual( [ 0 ] );
			expect( marker.getEnd().path ).toEqual( [ 1 ] );
		} );

		it( 'should upcast `href` attribute if LinkImage plugin is available', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /.*/,
				attributes: true
			} ] );

			const expectedHtml =
				'<figure class="image">' +
					'<a href="www.example.com">' +
						'<img src="/sample.png">' +
					'</a>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock linkHref="www.example.com" src="/sample.png"></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		// it( 'should allow modifying styles, classes and attributes', () => {
		// 	// This should also work when we set `attributes: true` but currently there are some
		// 	// problems related to GHS picking up non-GHS attributes (like src) due to some attributes not
		// 	// being consumed. For now we make GHS to handle only data-xxx attributes to bypass it.
		// 	// @see https://github.com/ckeditor/ckeditor5/issues/11532
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(figure|img|a)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<figure class="image foo" style="background-color:red;" data-figure="figure">' +
		// 			'<a href="www.example.com" class="baz" data-link="link">' +
		// 				'<img src="/sample.png" class="bar" style="color:blue;" data-image="image">' +
		// 			'</a>' +
		// 		'</figure>'
		// 	);

		// 	const imageBlock = model.document.getRoot().getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'styles', {
		// 			'background-color': 'blue',
		// 			color: 'red'
		// 		} );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'styles', {
		// 			'font-size': '12px',
		// 			'text-align': 'center'
		// 		} );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlLinkAttributes', 'styles', {
		// 			color: 'green'
		// 		} );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'attributes', {
		// 			'data-image': 'xyz'
		// 		} );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'attributes', {
		// 			'data-figure': 'zzz'
		// 		} );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlLinkAttributes', 'attributes', {
		// 			'data-link': 'xxx'
		// 		} );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'classes', [ 'bar', 'baz' ] );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'classes', [ 'foobar' ] );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlLinkAttributes', 'classes', [ 'baz', 'foo', 'bar' ] );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
		// 		data:
		// 			'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" htmlLinkAttributes="(3)" ' +
		// 				'linkHref="www.example.com" src="/sample.png">' +
		// 			'</imageBlock>',
		// 		attributes: {
		// 			1: {
		// 				attributes: {
		// 					'data-image': 'xyz'
		// 				},
		// 				classes: [ 'bar', 'baz' ],
		// 				styles: {
		// 					'background-color': 'blue',
		// 					color: 'red'
		// 				}
		// 			},
		// 			2: {
		// 				attributes: {
		// 					'data-figure': 'zzz'
		// 				},
		// 				classes: [ 'foobar' ],
		// 				styles: {
		// 					'font-size': '12px',
		// 					'text-align': 'center'
		// 				}
		// 			},
		// 			3: {
		// 				attributes: {
		// 					'data-link': 'xxx'
		// 				},
		// 				classes: [ 'baz', 'foo', 'bar' ],
		// 				styles: {
		// 					color: 'green'
		// 				}
		// 			}
		// 		}
		// 	} );

		// 	expect(_getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
		// 		'<figure class="ck-widget ck-widget_selected foobar image" contenteditable="false" data-figure="zzz"' +
		// 				' style="font-size:12px;text-align:center">' +
		// 			'<a class="bar baz foo" data-link="xxx" href="www.example.com" style="color:green">' +
		// 				'<img class="bar baz" data-image="xyz" src="/sample.png" style="background-color:blue;color:red"></img>' +
		// 			'</a>' +
		// 			'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
		// 		'</figure>'
		// 	);

		// 	expect( editor.getData() ).toBe(
		// 		'<figure class="image foobar" style="font-size:12px;text-align:center;" data-figure="zzz">' +
		// 			'<a class="baz foo bar" style="color:green;" href="www.example.com" data-link="xxx">' +
		// 				'<img class="bar baz" style="background-color:blue;color:red;" src="/sample.png" data-image="xyz">' +
		// 			'</a>' +
		// 		'</figure>'
		// 	);
		// } );

		// it( 'should allow removing all styles, classes and attributes', () => {
		// 	// This should also work when we set `attributes: true` but currently there are some
		// 	// problems related to GHS picking up non-GHS attributes (like src) due to some attributes not
		// 	// being consumed. For now we make GHS to handle only data-xxx attributes to bypass it.
		// 	// @see https://github.com/ckeditor/ckeditor5/issues/11532
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(figure|img|a)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<figure class="image foo" style="background-color:red;" data-figure="figure">' +
		// 			'<a href="www.example.com" class="baz" data-link="link">' +
		// 				'<img src="/sample.png" class="bar" style="color:blue;" data-image="image">' +
		// 			'</a>' +
		// 		'</figure>'
		// 	);

		// 	const imageBlock = model.document.getRoot().getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlLinkAttributes', 'styles', null );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'attributes', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'attributes', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlLinkAttributes', 'attributes', null );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'classes', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'classes', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlLinkAttributes', 'classes', null );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
		// 		data: '<imageBlock linkHref="www.example.com" src="/sample.png"></imageBlock>',
		// 		attributes: {}
		// 	} );

		// 	expect(_getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
		// 		'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
		// 			'<a href="www.example.com">' +
		// 				'<img src="/sample.png"></img>' +
		// 			'</a>' +
		// 			'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
		// 		'</figure>'
		// 	);

		// 	expect( editor.getData() ).toBe(
		// 		'<figure class="image">' +
		// 			'<a href="www.example.com">' +
		// 				'<img src="/sample.png">' +
		// 			'</a>' +
		// 		'</figure>'
		// 	);
		// } );
	} );

	describe( 'BlockImage with caption', () => {
		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml =
				'<figure class="image" data-figure="figure">' +
					'<img src="/sample.png" data-image="image">' +
					'<figcaption data-figcaption="figcaption">A caption</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" src="/sample.png">' +
						'<caption htmlFigcaptionAttributes="(3)">A caption</caption>' +
					'</imageBlock>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'figure'
						}
					},
					2: {
						attributes: {
							'data-image': 'image'
						}
					},
					3: {
						attributes: {
							'data-figcaption': 'figcaption'
						}
					}
				}
			} );

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml =
				'<figure class="image foobar">' +
					'<img class="foobar" src="/sample.png">' +
					'<figcaption class="foobar">A caption</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" src="/sample.png">' +
						'<caption htmlFigcaptionAttributes="(3)">A caption</caption>' +
					'</imageBlock>',
				attributes: range( 1, 4 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						classes: [ 'foobar' ]
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should allow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(figure|img|figcaption)$/,
				styles: 'color'
			} ] );

			const expectedHtml =
				'<figure class="image" style="color:red;">' +
					'<img style="color:red;" src="/sample.png">' +
					'<figcaption style="color:red;">A caption</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" src="/sample.png">' +
						'<caption htmlFigcaptionAttributes="(3)">A caption</caption>' +
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

			expect( editor.getData() ).toBe( expectedHtml );
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
					'<img data-image="image" src="/sample.png">' +
					'<figcaption data-figcaption="figcaption">A caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock src="/sample.png"><caption>A caption</caption></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
					'<img src="/sample.png">' +
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
					'<image class="foobar" src="/sample.png">' +
					'<figcaption class="foobar">A caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock src="/sample.png"><caption>A caption</caption></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
					'<img src="/sample.png">' +
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
					'<img style="color:red;" src="/sample.png">' +
					'<figcaption style="color:red;">A caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock src="/sample.png"><caption>A caption</caption></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
					'<img src="/sample.png">' +
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
					'<img src="/sample.png" data-image="image">' +
				'</figure>' +
				'<figure data-figure="standalone">' +
					'<figcaption data-figcaption="figcaption">foobar</figcaption>' +
				'</figure>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" src="/sample.png"></imageBlock>' +
					'<htmlFigure htmlFigureAttributes="(3)">' +
						'<htmlFigcaption htmlFigcaptionAttributes="(4)">foobar</htmlFigcaption>' +
					'</htmlFigure>',
				attributes: {
					1: {
						attributes: {
							'data-figure': 'image'
						}
					},
					2: {
						attributes: {
							'data-image': 'image'
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

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlImgAttributes',
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
					'<img src="/sample.png" data-foo="foo">' +
					'<figcaption data-foo="foo">A caption</figcaption>' +
				'</figure>'
			);

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
					'<img src="/sample.png">' +
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

			/* eslint-disable @stylistic/max-len */
			editor.setData(
				'<figure class="image allow disallow invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
					'<img src="/sample.png" class="allow disallow invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">' +
					'<figcaption class="allow disallow invalid" data-allow="allow" data-disallow="disallow" style="color:red;background:blue;width:10px;">A caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<imageBlock htmlFigureAttributes="(1)" htmlImgAttributes="(2)" src="/sample.png">' +
						'<caption htmlFigcaptionAttributes="(3)">A caption</caption>' +
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

			expect( editor.getData() ).toBe(
				'<figure class="image allow" style="color:red;" data-allow="allow">' +
					'<img class="allow" style="color:red;" src="/sample.png" data-allow="allow">' +
					'<figcaption class="allow" style="color:red;" data-allow="allow">A caption</figcaption>' +
				'</figure>'
			);
			/* eslint-enable @stylistic/max-len */
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
				'<figure class="image" data-commented-end-after="foo:id" data-commented-start-before="foo:id">' +
					'<img src="/sample.png">' +
					'<figcaption>A caption</figcaption>' +
				'</figure>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock src="/sample.png"><caption>A caption</caption></imageBlock>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<figure class="image">' +
						'<img src="/sample.png">' +
						'<figcaption>A caption</figcaption>' +
				'</figure>'
			);

			const marker = model.markers.get( 'commented:foo:id' );

			expect( marker.getStart().path ).toEqual( [ 0 ] );
			expect( marker.getEnd().path ).toEqual( [ 1 ] );
		} );

		// it( 'should allow modifying styles, classes and attributes', () => {
		// 	// This should also work when we set `attributes: true` but currently there are some
		// 	// problems related to GHS picking up non-GHS attributes (like src) due to some attributes not
		// 	// being consumed. For now we make GHS to handle only data-xxx attributes to bypass it.
		// 	// @see https://github.com/ckeditor/ckeditor5/issues/11532
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(figure|img|figcaption)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<figure class="image foo" style="background:red;" data-figure="figure">' +
		// 			'<img src="/sample.png" class="bar" style="color:green;" data-image="image">' +
		// 			'<figcaption class="baz" style="border:solid 1px;" data-figcaption="figcaption">A caption</figcaption>' +
		// 		'</figure>'
		// 	);

		// 	const imageBlock = model.document.getRoot().getChild( 0 );
		// 	const caption = imageBlock.getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'styles', {
		// 			'background-color': 'blue',
		// 			color: 'red'
		// 		} );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'styles', {
		// 			'font-size': '12px',
		// 			'text-align': 'center'
		// 		} );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'attributes', {
		// 			'data-image': 'xyz'
		// 		} );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'attributes', {
		// 			'data-figure': 'zzz'
		// 		} );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'classes', [ 'bar', 'baz' ] );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'classes', [ 'foobar' ] );

		// 		setModelHtmlAttribute( writer, caption, 'htmlAttributes', 'styles', {
		// 			color: 'green'
		// 		} );
		// 		setModelHtmlAttribute( writer, caption, 'htmlAttributes', 'attributes', {
		// 			'data-figcaption': 'xxx'
		// 		} );
		// 		setModelHtmlAttribute( writer, caption, 'htmlAttributes', 'classes', [ 'baz', 'foo', 'bar' ] );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
		// 		data:
		// 			'<imageBlock htmlAttributes="(1)" htmlFigureAttributes="(2)" src="/sample.png">' +
		// 				'<caption htmlAttributes="(3)">A caption</caption>' +
		// 			'</imageBlock>',
		// 		attributes: {
		// 			1: {
		// 				attributes: {
		// 					'data-image': 'xyz'
		// 				},
		// 				classes: [ 'bar', 'baz' ],
		// 				styles: {
		// 					'background-color': 'blue',
		// 					color: 'red'
		// 				}
		// 			},
		// 			2: {
		// 				attributes: {
		// 					'data-figure': 'zzz'
		// 				},
		// 				classes: [ 'foobar' ],
		// 				styles: {
		// 					'font-size': '12px',
		// 					'text-align': 'center'
		// 				}
		// 			},
		// 			3: {
		// 				attributes: {
		// 					'data-figcaption': 'xxx'
		// 				},
		// 				classes: [ 'baz', 'foo', 'bar' ],
		// 				styles: {
		// 					color: 'green'
		// 				}
		// 			}
		// 		}
		// 	} );

		// 	expect(_getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
		// 		'<figure class="ck-widget ck-widget_selected foobar image" contenteditable="false" data-figure="zzz"' +
		// 				' style="font-size:12px;text-align:center">' +
		// 			'<img class="bar baz" data-image="xyz" src="/sample.png" style="background-color:blue;color:red"></img>' +
		// 			'<figcaption class="bar baz ck-editor__editable ck-editor__nested-editable foo" contenteditable="true" ' +
		// 						'data-figcaption="xxx" data-placeholder="Enter image caption" style="color:green">A caption</figcaption>' +
		// 			'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
		// 		'</figure>'
		// 	);

		// 	expect( editor.getData() ).toBe(
		// 		'<figure class="image foobar" style="font-size:12px;text-align:center;" data-figure="zzz">' +
		// 			'<img class="bar baz" style="background-color:blue;color:red;" src="/sample.png" data-image="xyz">' +
		// 			'<figcaption class="baz foo bar" style="color:green;" data-figcaption="xxx">A caption</figcaption>' +
		// 		'</figure>'
		// 	);
		// } );

		// it( 'should allow removing all styles, classes and attributes', () => {
		// 	// This should also work when we set `attributes: true` but currently there are some
		// 	// problems related to GHS picking up non-GHS attributes (like src) due to some attributes not
		// 	// being consumed. For now we make GHS to handle only data-xxx attributes to bypass it.
		// 	// @see https://github.com/ckeditor/ckeditor5/issues/11532
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(figure|img|figcaption)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<figure class="image foo" style="background:red;" data-figure="figure">' +
		// 			'<img src="/sample.png" class="bar" style="color:green;" data-image="image">' +
		// 			'<figcaption class="baz" style="border:solid 1px;" data-figcaption="figcaption">A caption</figcaption>' +
		// 		'</figure>'
		// 	);

		// 	const imageBlock = model.document.getRoot().getChild( 0 );
		// 	const caption = imageBlock.getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'styles', null );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'attributes', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'attributes', null );

		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlAttributes', 'classes', null );
		// 		setModelHtmlAttribute( writer, imageBlock, 'htmlFigureAttributes', 'classes', null );

		// 		setModelHtmlAttribute( writer, caption, 'htmlAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, caption, 'htmlAttributes', 'attributes', null );
		// 		setModelHtmlAttribute( writer, caption, 'htmlAttributes', 'classes', null );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
		// 		data:
		// 			'<imageBlock src="/sample.png">' +
		// 				'<caption>A caption</caption>' +
		// 			'</imageBlock>',
		// 		attributes: {}
		// 	} );

		// 	expect(_getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
		// 		'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
		// 			'<img src="/sample.png"></img>' +
		// 			'<figcaption class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" ' +
		// 						'data-placeholder="Enter image caption">A caption</figcaption>' +
		// 			'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
		// 		'</figure>'
		// 	);

		// 	expect( editor.getData() ).toBe(
		// 		'<figure class="image">' +
		// 			'<img src="/sample.png">' +
		// 			'<figcaption>A caption</figcaption>' +
		// 		'</figure>'
		// 	);
		// } );
	} );

	describe( 'InlineImage', () => {
		it( 'should allow attributes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p)$/,
				attributes: /^data-.*$/
			} ] );

			const expectedHtml = '<p data-paragraph="paragraph"><img src="/sample.png" data-image="image"></p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<paragraph htmlPAttributes="(1)">' +
						'<imageInline htmlImgAttributes="(2)" src="/sample.png"></imageInline>' +
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

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml = '<p class="foobar"><img class="foobar" src="/sample.png"></p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<paragraph htmlPAttributes="(1)">' +
						'<imageInline htmlImgAttributes="(2)" src="/sample.png"></imageInline>' +
					'</paragraph>',
				attributes: range( 1, 3 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						classes: [ 'foobar' ]
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should allow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p)$/,
				styles: 'color'
			} ] );

			const expectedHtml = '<p style="color:red;"><img style="color:red;" src="/sample.png"></p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<paragraph htmlPAttributes="(1)">' +
						'<imageInline htmlImgAttributes="(2)" src="/sample.png"></imageInline>' +
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

			expect( editor.getData() ).toBe( expectedHtml );
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
				'<p data-paragraph="paragraph"><img data-image="image" src="/sample.png"></p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<paragraph><imageInline src="/sample.png"></imageInline></paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<p><img src="/sample.png"></p>'
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
				'<p class="foobar"><image class="foobar" src="/sample.png"></p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<paragraph><imageInline src="/sample.png"></imageInline></paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<p><img src="/sample.png"></p>'
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
					'<img style="color:red;" src="/sample.png">' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<paragraph><imageInline src="/sample.png"></imageInline></paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<p>' +
					'<img src="/sample.png">' +
				'</p>'
			);
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlImgAttributes',
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
					'<img src="/sample.png" data-foo="foo">' +
				'</p>'
			);

			expect( editor.getData() ).toBe(
				'<p><img src="/sample.png"></p>'
			);
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/10703.
		it( 'should hoist an image with attributes out of a <dir> element as a block image', () => {
			dataFilter.loadAllowedConfig( [ {
				name: 'img',
				attributes: true
			}, {
				name: 'dir'
			} ] );

			editor.setData( '<dir><img data-foo="bar">' );

			// A `<dir>` (represented by GHS as `htmlDir`) does not accept image content. The image cannot land
			// there as an inline image, so it degrades to a block image and is hoisted out of the (then empty,
			// removed) `htmlDir`, keeping its GHS attributes.
			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<imageBlock htmlImgAttributes="(1)"></imageBlock>',
				attributes: {
					1: {
						attributes: {
							'data-foo': 'bar'
						}
					}
				}
			} );

			expect( editor.getData() ).toBe( '<figure class="image"><img data-foo="bar"></figure>' );
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/10703.
		it( 'should not crash when an <img> with attributes cannot be converted to any model element', () => {
			// Force the `<img>` to have no valid model representation: disallow both image types and the GHS generic
			// `<htmlImg>` fallback. The upcast then yields a `null` model range. The GHS image attribute converter
			// used to call `writer.setAttribute()` with that `null` range and crash; it must skip setting the
			// attribute instead.
			model.schema.addChildCheck( () => false, 'imageBlock' );
			model.schema.addChildCheck( () => false, 'imageInline' );
			model.schema.addChildCheck( () => false, 'htmlImg' );

			dataFilter.loadAllowedConfig( [ {
				name: 'img',
				attributes: true
			} ] );

			expect( () => {
				editor.setData( '<p><img src="/sample.png" data-foo="bar"></p>' );
			} ).not.toThrow();

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<paragraph></paragraph>',
				attributes: {}
			} );
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
				'<p><img data-commented-end-after="foo:id" data-commented-start-before="foo:id" src="/sample.png"></p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<paragraph><imageInline src="/sample.png"></imageInline></paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<p><img src="/sample.png"></p>'
			);

			const marker = model.markers.get( 'commented:foo:id' );

			expect( marker.getStart().path ).toEqual( [ 0, 0 ] );
			expect( marker.getEnd().path ).toEqual( [ 0, 1 ] );
		} );

		// it( 'should allow modifying styles, classes and attributes', () => {
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(img|p)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<p data-paragraph="paragraph">' +
		// 			'<img src="/sample.png" class="foo" style="color:red;" data-image="image">' +
		// 		'</p>'
		// 	);

		// 	const image = model.document.getRoot().getChild( 0 ).getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'styles', {
		// 			'background-color': 'blue',
		// 			color: 'green'
		// 		} );
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'classes', [ 'bar', 'baz' ] );
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'attributes', {
		// 			'data-image': 'xxx'
		// 		} );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
		// 		data:
		// 			'<paragraph htmlPAttributes="(1)">' +
		// 				'<imageInline htmlImgAttributes="(2)" src="/sample.png"></imageInline>' +
		// 			'</paragraph>',
		// 		attributes: {
		// 			1: {
		// 				attributes: {
		// 					'data-paragraph': 'paragraph'
		// 				}
		// 			},
		// 			2: {
		// 				attributes: {
		// 					'data-image': 'xxx'
		// 				},
		// 				classes: [ 'bar', 'baz' ],
		// 				styles: {
		// 					'background-color': 'blue',
		// 					color: 'green'
		// 				}
		// 			}
		// 		}
		// 	} );

		// 	// TODO: this should pass, but image attributes are incorrectly applied to the span in the editing view.
		// 	// Should be fixed by https://github.com/ckeditor/ckeditor5/issues/11532
		// 	// expect(_getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
		// 	// 	'<p data-paragraph="paragraph">' +
		// 	// 		'<span class="ck-widget image-inline" contenteditable="false">' +
		// 	// 			'<img src="/sample.png" class="bar baz" style="background-color:blue;color:red;" data-image="xxx"></img>' +
		// 	// 		'</span>' +
		// 	// 	'</p>'
		// 	// );

		// 	expect( editor.getData() ).toBe(
		// 		'<p data-paragraph="paragraph">' +
		// 			'<img class="bar baz" style="background-color:blue;color:green;" src="/sample.png" data-image="xxx">' +
		// 		'</p>'
		// 	);
		// } );

		// it( 'should allow removing all styles, classes and attributes', () => {
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(img|p)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<p data-paragraph="paragraph">' +
		// 			'<img src="/sample.png" class="foo" style="color:red;" data-image="image">' +
		// 		'</p>'
		// 	);

		// 	const image = model.document.getRoot().getChild( 0 ).getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'classes', null );
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'attributes', null );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
		// 		data:
		// 			'<paragraph htmlPAttributes="(1)">' +
		// 				'<imageInline src="/sample.png"></imageInline>' +
		// 			'</paragraph>',
		// 		attributes: {
		// 			1: {
		// 				attributes: {
		// 					'data-paragraph': 'paragraph'
		// 				}
		// 			}
		// 		}
		// 	} );

		// 	expect(_getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
		// 		'<p data-paragraph="paragraph">' +
		// 			'<span class="ck-widget image-inline" contenteditable="false">' +
		// 				'<img src="/sample.png"></img>' +
		// 			'</span>' +
		// 		'</p>'
		// 	);

		// 	expect( editor.getData() ).toBe(
		// 		'<p data-paragraph="paragraph">' +
		// 			'<img src="/sample.png">' +
		// 		'</p>'
		// 	);
		// } );
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
						'<img src="/sample.png" data-image="image">' +
					'</a>' +
				'</p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<paragraph htmlPAttributes="(1)">' +
						'<imageInline htmlA="(2)" htmlImgAttributes="(3)" linkHref="www.example.com" src="/sample.png">' +
						'</imageInline>' +
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

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should allow classes', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p|a)$/,
				classes: 'foobar'
			} ] );

			const expectedHtml =
				'<p class="foobar">' +
					'<a class="foobar" href="www.example.com">' +
						'<img class="foobar" src="/sample.png">' +
					'</a>' +
				'</p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<paragraph htmlPAttributes="(1)">' +
						'<imageInline htmlA="(2)" htmlImgAttributes="(3)" linkHref="www.example.com" src="/sample.png">' +
						'</imageInline>' +
					'</paragraph>',
				attributes: range( 1, 4 ).reduce( ( attributes, index ) => {
					attributes[ index ] = {
						classes: [ 'foobar' ]
					};
					return attributes;
				}, {} )
			} );

			expect( editor.getData() ).toBe( expectedHtml );
		} );

		it( 'should allow styles', () => {
			dataFilter.loadAllowedConfig( [ {
				name: /^(img|p|a)$/,
				styles: 'color'
			} ] );

			const expectedHtml =
				'<p style="color:red;">' +
					'<a style="color:red;" href="www.example.com">' +
						'<img style="color:red;" src="/sample.png">' +
					'</a>' +
				'</p>';

			editor.setData( expectedHtml );

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data:
					'<paragraph htmlPAttributes="(1)">' +
						'<imageInline htmlA="(2)" htmlImgAttributes="(3)" linkHref="www.example.com" src="/sample.png">' +
						'</imageInline>' +
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

			expect( editor.getData() ).toBe( expectedHtml );
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
						'<img data-image="image" src="/sample.png">' +
					'</a>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<paragraph><imageInline linkHref="www.example.com" src="/sample.png"></imageInline></paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<p><a href="www.example.com"><img src="/sample.png"></a></p>'
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
				'<p class="foobar"><a class="foobar" href="www.example.com"><img class="foobar" src="/sample.png"></a></p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<paragraph><imageInline linkHref="www.example.com" src="/sample.png"></imageInline></paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<p><a href="www.example.com"><img src="/sample.png"></a></p>'
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
						'<img style="color:red;" src="/sample.png">' +
					'</a>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<paragraph><imageInline linkHref="www.example.com" src="/sample.png"></imageInline></paragraph>',
				attributes: {}
			} );

			expect( editor.getData() ).toBe(
				'<p><a href="www.example.com"><img src="/sample.png"></a></p>'
			);
		} );

		it( 'should not consume attributes already consumed (downcast)', () => {
			[
				'htmlImgAttributes',
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
				'<p><a href="www.example.com"><img src="/sample.png" data-foo="foo"></a></p>'
			);

			expect( editor.getData() ).toBe(
				'<p><a href="www.example.com"><img src="/sample.png"></a></p>'
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
				'<p>' +
					'<a href="www.example.com">' +
						'<img src="/sample.png" data-commented-end-after="foo:id" data-commented-start-before="foo:id">' +
					'</a>' +
				'</p>'
			);

			expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
				data: '<paragraph><imageInline linkHref="www.example.com" src="/sample.png"></imageInline></paragraph>',
				attributes: { }
			} );

			expect( editor.getData() ).toBe(
				'<p><a href="www.example.com"><img src="/sample.png"></a></p>'
			);

			const marker = model.markers.get( 'commented:foo:id' );

			expect( marker.getStart().path ).toEqual( [ 0, 0 ] );
			expect( marker.getEnd().path ).toEqual( [ 0, 1 ] );
		} );

		// it( 'should allow modifying styles, classes and attributes', () => {
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(img|a|p)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<p data-paragraph="paragraph">' +
		// 			'<a href="www.example.com" class="bar" style="background:blue;" data-link="link">' +
		// 				'<img src="/sample.png" class="foo" style="color:red;" data-image="image">' +
		// 			'</a>' +
		// 		'</p>'
		// 	);

		// 	const image = model.document.getRoot().getChild( 0 ).getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'styles', {
		// 			'background-color': 'blue',
		// 			color: 'green'
		// 		} );
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'classes', [ 'bar', 'baz' ] );
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'attributes', {
		// 			'data-image': 'xxx'
		// 		} );

		// 		setModelHtmlAttribute( writer, image, 'htmlA', 'styles', {
		// 			background: 'red',
		// 			color: 'pink'
		// 		} );
		// 		setModelHtmlAttribute( writer, image, 'htmlA', 'classes', [ 'foo' ] );
		// 		setModelHtmlAttribute( writer, image, 'htmlA', 'attributes', {
		// 			'data-link': 'zzz'
		// 		} );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
		// 		data:
		// 			'<paragraph htmlPAttributes="(1)">' +
		// 				'<imageInline htmlA="(2)" htmlAttributes="(3)" linkHref="www.example.com" src="/sample.png"></imageInline>' +
		// 			'</paragraph>',
		// 		attributes: {
		// 			1: {
		// 				attributes: {
		// 					'data-paragraph': 'paragraph'
		// 				}
		// 			},
		// 			2: {
		// 				attributes: {
		// 					'data-link': 'zzz'
		// 				},
		// 				classes: [ 'foo' ],
		// 				styles: {
		// 					background: 'red',
		// 					color: 'pink'
		// 				}
		// 			},
		// 			3: {
		// 				attributes: {
		// 					'data-image': 'xxx'
		// 				},
		// 				classes: [ 'bar', 'baz' ],
		// 				styles: {
		// 					'background-color': 'blue',
		// 					color: 'green'
		// 				}
		// 			}
		// 		}
		// 	} );

		// 	// TODO: this should pass, but image attributes are incorrectly applied to the span in the editing view.
		// 	// Should be fixed by https://github.com/ckeditor/ckeditor5/issues/11532
		// 	// expect(_getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
		// 	// 	'<p data-paragraph="paragraph">' +
		// 	// 		'<span class="foo" data-link="zzz" href="www.example.com" style="background:red;color:pink">' +
		// 	// 			'<span class="ck-widget image-inline" contenteditable="false">' +
		// 	// 				'<img src="/sample.png" class="bar baz" style="background-color:blue;color:red;" data-image="xxx">' +
		// 	// 				'</img>' +
		// 	// 			'</span>' +
		// 	// 		'</a>' +
		// 	// 	'</p>'
		// 	// );

		// 	expect( editor.getData() ).toBe(
		// 		'<p data-paragraph="paragraph">' +
		// 			'<a class="foo" style="background:red;color:pink;" href="www.example.com" data-link="zzz">' +
		// 				'<img class="bar baz" style="background-color:blue;color:green;" src="/sample.png" data-image="xxx">' +
		// 			'</a>' +
		// 		'</p>'
		// 	);
		// } );

		// it( 'should allow removing all styles, classes and attributes', () => {
		// 	dataFilter.loadAllowedConfig( [ {
		// 		name: /^(img|p)$/,
		// 		attributes: /^data-.*$/,
		// 		classes: true,
		// 		styles: true
		// 	} ] );

		// 	editor.setData(
		// 		'<p data-paragraph="paragraph">' +
		// 			'<a href="www.example.com" class="bar" style="background:blue;" data-link="link">' +
		// 				'<img src="/sample.png" class="foo" style="color:red;" data-image="image">' +
		// 			'</a>' +
		// 		'</p>'
		// 	);

		// 	const image = model.document.getRoot().getChild( 0 ).getChild( 0 );

		// 	model.change( writer => {
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'styles', null );
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'classes', null );
		// 		setModelHtmlAttribute( writer, image, 'htmlAttributes', 'attributes', null );
		// 		setModelHtmlAttribute( writer, image, 'htmlA', 'styles', null );
		// 		setModelHtmlAttribute( writer, image, 'htmlA', 'classes', null );
		// 		setModelHtmlAttribute( writer, image, 'htmlA', 'attributes', null );
		// 	} );

		// 	expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).toEqual( {
		// 		data:
		// 			'<paragraph htmlPAttributes="(1)">' +
		// 				'<imageInline linkHref="www.example.com" src="/sample.png"></imageInline>' +
		// 			'</paragraph>',
		// 		attributes: {
		// 			1: {
		// 				attributes: {
		// 					'data-paragraph': 'paragraph'
		// 				}
		// 			}
		// 		}
		// 	} );

		// 	expect(_getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
		// 		'<p data-paragraph="paragraph">' +
		// 			'<a href="www.example.com">' +
		// 				'<span class="ck-widget image-inline" contenteditable="false">' +
		// 					'<img src="/sample.png"></img>' +
		// 				'</span>' +
		// 			'</a>' +
		// 		'</p>'
		// 	);

		// 	expect( editor.getData() ).toBe(
		// 		'<p data-paragraph="paragraph">' +
		// 			'<a href="www.example.com">' +
		// 				'<img src="/sample.png">' +
		// 			'</a>' +
		// 		'</p>'
		// 	);
		// } );
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

					// Apply filtering rules added after initial data load.
					editor.setData( '' );

					expect( schema.getDefinition( 'imageBlock' ).allowAttributes ).toEqual( [
						'alt',
						'src',
						'srcset',
						'width',
						'height',
						'placeholder',
						'linkHref',
						'htmlImgAttributes',
						'htmlFigureAttributes',
						'htmlLinkAttributes'
					] );

					expect( schema.getDefinition( 'imageInline' ) ).toBeUndefined();
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

					// Apply filtering rules added after initial data load.
					editor.setData( '' );

					expect( schema.getDefinition( 'imageInline' ).allowAttributes ).toEqual( [
						'alt',
						'src',
						'srcset',
						'width',
						'height',
						'placeholder',
						'htmlA',
						'htmlImgAttributes'
					] );

					expect( schema.getDefinition( 'imageBlock' ) ).toBeUndefined();
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

					// Apply filtering rules added after initial data load.
					editor.setData( '' );

					expect( schema.getDefinition( 'imageBlock' ) ).toBeUndefined();
					expect( schema.getDefinition( 'imageInline' ) ).toBeUndefined();
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );
	} );
} );
