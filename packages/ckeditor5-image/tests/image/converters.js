/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ImageEditing from '../../src/image/imageediting';
import {
	upcastImageFigure,
	downcastImageAttribute
} from '../../src/image/converters';
import { createImageViewElement } from '../../src/image/utils';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Image converters', () => {
	let editor, model, document, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ ImageEditing ]
		} ).then( newEditor => {
			editor = newEditor;
			model = editor.model;
			document = model.document;
			viewDocument = editor.editing.view;

			const imageUtils = editor.plugins.get( 'ImageUtils' );
			const schema = model.schema;

			schema.register( 'imageBlock', {
				allowWhere: '$block',
				allowAttributes: [ 'alt', 'src' ],
				isObject: true,
				isBlock: true
			} );

			schema.register( 'imageInline', {
				allowWhere: '$inline',
				allowAttributes: [ 'alt', 'src' ],
				isObject: true,
				isInline: true
			} );

			const imageEditingElementCreator = ( modelElement, { writer } ) =>
				imageUtils.toImageWidget( createImageViewElement( writer, 'imageBlock' ), writer, '' );

			const imageInlineEditingElementCreator = ( modelElement, { writer } ) =>
				imageUtils.toImageWidget( createImageViewElement( writer, 'imageInline' ), writer, '' );

			editor.conversion.for( 'editingDowncast' ).elementToElement( {
				model: 'imageBlock',
				view: imageEditingElementCreator
			} );

			editor.conversion.for( 'editingDowncast' ).elementToElement( {
				model: 'imageInline',
				view: imageInlineEditingElementCreator
			} );

			editor.conversion.for( 'downcast' )
				.add( downcastImageAttribute( imageUtils, 'imageBlock', 'src' ) )
				.add( downcastImageAttribute( imageUtils, 'imageInline', 'src' ) )
				.add( downcastImageAttribute( imageUtils, 'imageBlock', 'alt' ) )
				.add( downcastImageAttribute( imageUtils, 'imageInline', 'alt' ) );
		} );
	} );

	describe( 'upcastImageFigure', () => {
		function expectModel( data ) {
			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( data );
		}

		let schema, imgConverterCalled;

		beforeEach( () => {
			// Since this part of test tests only view->model conversion editing pipeline is not necessary
			// so defining model->view converters won't be necessary.
			editor.editing.destroy();

			schema = model.schema;
			schema.extend( '$text', { allowIn: 'imageBlock' } );

			editor.conversion.for( 'upcast' )
				.add( upcastImageFigure( editor.plugins.get( 'ImageUtils' ) ) )
				.elementToElement( {
					view: { name: 'img' },
					model: ( viewImage, { writer } ) => {
						imgConverterCalled = true;

						return writer.createElement(
							'imageBlock',
							viewImage.hasAttribute( 'src' ) ? { src: viewImage.getAttribute( 'src' ) } : null
						);
					}
				} );
		} );

		it( 'should find img element among children and convert it using already defined converters', () => {
			editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );

			expectModel( '<imageBlock src="/assets/sample.png"></imageBlock>' );
			expect( imgConverterCalled ).to.be.true;
		} );

		it( 'should convert children allowed by schema and omit disallowed', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'foo', model: 'foo' } );
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'bar', model: 'bar' } );

			schema.register( 'foo', { allowIn: 'imageBlock' } );
			// Is allowed in root, but should not try to split image element.
			schema.register( 'bar', { allowIn: '$root' } );

			editor.setData( '<figure class="image">x<img src="/assets/sample.png" />y<foo></foo><bar></bar></figure>' );

			// Element bar not converted because schema does not allow it.
			expectModel( '<imageBlock src="/assets/sample.png">xy<foo></foo></imageBlock>' );
		} );

		it( 'should split parent element when image is not allowed - in the middle', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'div', model: 'div' } );

			schema.register( 'div', { inheritAllFrom: '$block' } );
			schema.extend( 'imageBlock', { disallowIn: 'div' } );

			editor.setData(
				'<div>' +
					'abc' +
					'<figure class="image">' +
						'<img src="foo.jpg"/>' +
					'</figure>' +
					'def' +
				'</div>'
			);

			expectModel( '<div>abc</div><imageBlock src="foo.jpg"></imageBlock><div>def</div>' );
		} );

		it( 'should split parent element when image is not allowed - at the end', () => {
			editor.conversion.elementToElement( { model: 'div', view: 'div' } );

			schema.register( 'div', { inheritAllFrom: '$block' } );
			schema.extend( 'imageBlock', { disallowIn: 'div' } );

			editor.setData(
				'<div>' +
					'abc' +
					'<figure class="image">' +
						'<img src="foo.jpg"/>' +
					'</figure>' +
				'</div>'
			);

			expectModel( '<div>abc</div><imageBlock src="foo.jpg"></imageBlock>' );
		} );

		it( 'should split parent element when image is not allowed - at the beginning', () => {
			editor.conversion.elementToElement( { model: 'div', view: 'div' } );

			schema.register( 'div', { inheritAllFrom: '$block' } );
			schema.extend( 'imageBlock', { disallowIn: 'div' } );

			editor.setData(
				'<div>' +
					'<figure class="image">' +
						'<img src="foo.jpg"/>' +
					'</figure>' +
					'def' +
				'</div>'
			);

			expectModel( '<imageBlock src="foo.jpg"></imageBlock><div>def</div>' );
		} );

		it( 'should be possible to overwrite', () => {
			editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { name: true } );
				conversionApi.consumable.consume( data.viewItem.getChild( 0 ), { name: true } );

				const element = conversionApi.writer.createElement( 'myImage', {
					data: {
						src: data.viewItem.getChild( 0 ).getAttribute( 'src' )
					}
				} );
				conversionApi.writer.insert( element, data.modelCursor );
				data.modelRange = conversionApi.writer.createRangeOn( element );
				data.modelCursor = data.modelRange.end;
			}, { priority: 'high' } );

			editor.setData( '<figure class="image"><img src="/assets/sample.png" />xyz</figure>' );

			expectModel( '<myImage data="{"src":"/assets/sample.png"}"></myImage>' );
		} );

		// Test exactly what figure converter does, which is putting it's children element to image element.
		// If this has not been done, it means that figure converter was not used.
		it( 'should not convert if figure do not have class="image" attribute', () => {
			editor.setData( '<figure><img src="/assets/sample.png" />xyz</figure>' );

			// Default image converter will be fired.
			expectModel( '<imageBlock src="/assets/sample.png"></imageBlock>' );
		} );

		it( 'should convert image with missing src attribute', () => {
			editor.setData( '<figure class="image"><img alt="Empty src attribute" /></figure>' );

			expectModel( '<imageBlock alt="Empty src attribute"></imageBlock>' );
		} );

		it( 'should convert if img element has no src and figure has text', () => {
			// Image element missing src attribute.
			editor.setData( '<figure class="image"><img alt="abc" />xyz</figure>' );

			expectModel( '<imageBlock alt="abc">xyz</imageBlock>' );
		} );

		it( 'should not convert if there is no img element among children', () => {
			editor.setData( '<figure class="image">xyz</figure>' );

			// Figure converter outputs nothing and text is disallowed in root.
			expectModel( '' );
		} );

		it( 'should not consume if the img element was not converted', () => {
			editor.data.upcastDispatcher.on( 'element:img', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { name: true } );
				data.modelRange = conversionApi.writer.createRange( data.modelCursor );
			}, { priority: 'high' } );

			editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem, { name: true, classes: 'image' } ) ).to.be.true;
			}, { priority: 'low' } );

			editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );
		} );

		it( 'should not left unconsumed figure media element', () => {
			editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem, { name: true, classes: 'image' } ) ).to.be.false;
			}, { priority: 'low' } );

			editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );
		} );

		it( 'should consume the figure element before the img conversion starts', () => {
			editor.data.upcastDispatcher.on( 'element:img', ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem.parent, { name: true, classes: 'image' } ) ).to.be.false;
			}, { priority: 'low' } );

			editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );
		} );
	} );

	describe( 'downcastImageAttribute', () => {
		it( 'should convert adding attribute to image', () => {
			setModelData( model, '<imageBlock src=""></imageBlock>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'alt', 'foo bar', image );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img alt="foo bar" src=""></img></figure>'
			);
		} );

		it( 'should convert an empty "src" attribute from image even if removed', () => {
			setModelData( model, '<imageBlock src="" alt="foo bar"></imageBlock>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.removeAttribute( 'src', image );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img alt="foo bar" src=""></img></figure>'
			);
		} );

		it( 'should convert an empty "alt" attribute from image even if removed', () => {
			setModelData( model, '<imageBlock src="" alt="foo bar"></imageBlock>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.removeAttribute( 'alt', image );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img alt="" src=""></img></figure>'
			);
		} );

		it( 'should convert change of attribute image', () => {
			setModelData( model, '<imageBlock src="" alt="foo bar"></imageBlock>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'alt', 'baz quix', image );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img alt="baz quix" src=""></img></figure>'
			);
		} );

		it( 'should not set attribute if change was already consumed', () => {
			editor.editing.downcastDispatcher.on( 'attribute:alt:imageBlock', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'attribute:alt' );
			}, { priority: 'high' } );

			setModelData( model, '<imageBlock src="" alt="foo bar"></imageBlock>' );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src=""></img></figure>'
			);
		} );

		it( 'should set attribute on <img> even if other element is present inside figure', () => {
			editor.model.schema.register( 'foo', {
				allowIn: 'imageBlock'
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'foo', view: 'foo' } );

			setModelData( model, '<imageBlock src=""><foo></foo></imageBlock>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'alt', 'foo bar', image );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><foo></foo><img alt="foo bar" src=""></img></figure>'
			);
		} );
	} );
} );
