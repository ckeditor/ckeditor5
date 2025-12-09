/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ViewDowncastWriter, ViewDocument, ModelElement, StylesProcessor, _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';
import { isWidget, getLabel } from '@ckeditor/ckeditor5-widget';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { ImageBlockEditing } from '../src/image/imageblockediting.js';
import { ImageInlineEditing } from '../src/image/imageinlineediting.js';
import { ImageCaptionEditing } from '../src/imagecaption/imagecaptionediting.js';

import { ImageUtils } from '../src/imageutils.js';

describe( 'ImageUtils plugin', () => {
	let editor, imageUtils, element, image, writer, viewDocument;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ImageUtils ]
		} );

		imageUtils = editor.plugins.get( 'ImageUtils' );

		viewDocument = new ViewDocument( new StylesProcessor() );
		writer = new ViewDowncastWriter( viewDocument );
		image = writer.createContainerElement( 'img' );
		element = writer.createContainerElement( 'figure' );
		writer.insert( writer.createPositionAt( element, 0 ), image );
		imageUtils.toImageWidget( element, writer, 'image widget' );
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( ImageUtils.pluginName ).toBe( 'ImageUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageUtils.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageUtils.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toImageWidget()', () => {
		it( 'should be widgetized', () => {
			expect( isWidget( element ) ).toBe( true );
		} );

		it( 'should set element\'s label', () => {
			expect( getLabel( element ) ).toBe( 'image widget' );
		} );

		it( 'should set element\'s label combined with alt attribute', () => {
			writer.setAttribute( 'alt', 'foo bar baz', image );
			expect( getLabel( element ) ).toBe( 'foo bar baz image widget' );
		} );

		it( 'provided label creator should always return same label', () => {
			writer.setAttribute( 'alt', 'foo bar baz', image );

			expect( getLabel( element ) ).toBe( 'foo bar baz image widget' );
			expect( getLabel( element ) ).toBe( 'foo bar baz image widget' );
		} );
	} );

	describe( 'isImageWidget()', () => {
		it( 'should return true for elements marked with toImageWidget()', () => {
			expect( imageUtils.isImageWidget( element ) ).toBe( true );
		} );

		it( 'should return false for non-widgetized elements', () => {
			expect( imageUtils.isImageWidget( writer.createContainerElement( 'p' ) ) ).toBe( false );
		} );
	} );

	describe( 'getClosestSelectedImageWidget()', () => {
		let frag;

		it( 'should return an image widget when it is the only element in the selection', () => {
			// We need to create a container for the element to be able to create a Range on this element.
			frag = writer.createDocumentFragment( element );

			const selection = writer.createSelection( element, 'on' );

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).toBe( element );
		} );

		describe( 'when the selection is inside a block image caption', () => {
			let caption;

			beforeEach( () => {
				caption = writer.createContainerElement( 'figcaption' );
				writer.insert( writer.createPositionAt( element, 1 ), caption );
				frag = writer.createDocumentFragment( element );
			} );

			it( 'should return the widget element if the selection is not collapsed', () => {
				const text = writer.createText( 'foo' );
				writer.insert( writer.createPositionAt( caption, 0 ), text );

				const selection = writer.createSelection( writer.createRangeIn( caption ) );

				expect( imageUtils.getClosestSelectedImageWidget( selection ) ).toBe( element );
			} );

			it( 'should return the widget element if the selection is collapsed', () => {
				const selection = writer.createSelection( caption, 'in' );

				expect( imageUtils.getClosestSelectedImageWidget( selection ) ).toBe( element );
			} );
		} );

		it( 'should return null when non-widgetized elements is the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			// We need to create a container for the element to be able to create a Range on this element.
			frag = writer.createDocumentFragment( notWidgetizedElement );

			const selection = writer.createSelection( notWidgetizedElement, 'on' );

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).toBe( null );
		} );

		it( 'should return null when widget element is not the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			frag = writer.createDocumentFragment( [ element, notWidgetizedElement ] );

			const selection = writer.createSelection( writer.createRangeIn( frag ) );

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).toBe( null );
		} );

		it( 'should return null if an image is a part of the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			frag = writer.createDocumentFragment( [ element, notWidgetizedElement ] );

			const selection = writer.createSelection( writer.createRangeIn( frag ) );

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).toBe( null );
		} );

		it( 'should return null if the selection is inside a figure element, which is not an image', () => {
			const innerContainer = writer.createContainerElement( 'p' );

			element = writer.createContainerElement( 'figure' );

			writer.insert( writer.createPositionAt( element, 1 ), innerContainer );

			frag = writer.createDocumentFragment( element );

			const selection = writer.createSelection( innerContainer, 'in' );

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).toBe( null );
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/11972.
		it( 'should return null if view selection is empty', () => {
			const selection = writer.createSelection();

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).toBe( null );
		} );
	} );

	describe( 'getClosestSelectedImageElement()', () => {
		let model;

		beforeEach( async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph, ImageCaptionEditing ]
			} );

			model = editor.model;

			model.schema.register( 'blockWidget', {
				isObject: true,
				allowIn: '$root'
			} );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'blockWidget', view: 'blockWidget' } );
		} );

		it( 'should return null if no element is selected and the selection has no image ancestor', () => {
			_setModelData( model, '<paragraph>F[]oo</paragraph>' );

			expect( imageUtils.getClosestSelectedImageElement( model.document.selection ) ).toBe( null );
		} );

		it( 'should return null if a non-image element is selected', () => {
			_setModelData( model, '[<blockWidget></blockWidget>]' );

			expect( imageUtils.getClosestSelectedImageElement( model.document.selection ) ).toBe( null );
		} );

		it( 'should return an imageInline element if it is selected', () => {
			_setModelData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );

			const image = imageUtils.getClosestSelectedImageElement( model.document.selection );

			expect( image.is( 'element', 'imageInline' ) ).toBe( true );
		} );

		it( 'should return an image element if it is selected', () => {
			_setModelData( model, '[<imageBlock></imageBlock>]' );

			const image = imageUtils.getClosestSelectedImageElement( model.document.selection );

			expect( image.is( 'element', 'imageBlock' ) ).toBe( true );
		} );

		it( 'should return an image element if the selection range is inside its caption', () => {
			_setModelData( model, '<imageBlock><caption>F[oo]</caption></imageBlock>' );

			const image = imageUtils.getClosestSelectedImageElement( model.document.selection );

			expect( image.is( 'element', 'imageBlock' ) ).toBe( true );
		} );

		it( 'should return an image element if the selection position is inside its caption', () => {
			_setModelData( model, '<imageBlock><caption>Foo[]</caption></imageBlock>' );

			const image = imageUtils.getClosestSelectedImageElement( model.document.selection );

			expect( image.is( 'element', 'imageBlock' ) ).toBe( true );
		} );
	} );

	describe( 'isImage()', () => {
		it( 'should return true for the block image element', () => {
			const image = new ModelElement( 'imageBlock' );

			expect( imageUtils.isImage( image ) ).toBe( true );
		} );

		it( 'should return true for the inline image element', () => {
			const image = new ModelElement( 'imageInline' );

			expect( imageUtils.isImage( image ) ).toBe( true );
		} );

		it( 'should return false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( imageUtils.isImage( image ) ).toBe( false );
		} );

		it( 'should return false for null and undefined', () => {
			expect( imageUtils.isImage( null ) ).toBe( false );
			expect( imageUtils.isImage( undefined ) ).toBe( false );
		} );
	} );

	describe( 'isInlineImage()', () => {
		it( 'should return true for the inline image element', () => {
			const image = new ModelElement( 'imageInline' );

			expect( imageUtils.isInlineImage( image ) ).toBe( true );
		} );

		it( 'should return false for the block image element', () => {
			const image = new ModelElement( 'imageBlock' );

			expect( imageUtils.isInlineImage( image ) ).toBe( false );
		} );

		it( 'should return false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( imageUtils.isInlineImage( image ) ).toBe( false );
		} );

		it( 'should return false for null and undefined', () => {
			expect( imageUtils.isInlineImage( null ) ).toBe( false );
			expect( imageUtils.isInlineImage( undefined ) ).toBe( false );
		} );
	} );

	describe( 'isBlockImage()', () => {
		it( 'should return false for the inline image element', () => {
			const image = new ModelElement( 'imageInline' );

			expect( imageUtils.isBlockImage( image ) ).toBe( false );
		} );

		it( 'should return true for the block image element', () => {
			const image = new ModelElement( 'imageBlock' );

			expect( imageUtils.isBlockImage( image ) ).toBe( true );
		} );

		it( 'should return false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( imageUtils.isBlockImage( image ) ).toBe( false );
		} );

		it( 'should return false for null and undefined', () => {
			expect( imageUtils.isBlockImage( null ) ).toBe( false );
			expect( imageUtils.isBlockImage( undefined ) ).toBe( false );
		} );
	} );

	describe( 'isInlineImageView()', () => {
		it( 'should return false for the block image element', () => {
			const element = writer.createContainerElement( 'figure', { class: 'image' } );

			expect( imageUtils.isInlineImageView( element ) ).toBe( false );
		} );

		it( 'should return true for the inline view image element', () => {
			const element = writer.createEmptyElement( 'img' );

			expect( imageUtils.isInlineImageView( element ) ).toBe( true );
		} );

		it( 'should return false for other view element', () => {
			const element = writer.createContainerElement( 'div' );

			expect( imageUtils.isInlineImageView( element ) ).toBe( false );
		} );

		it( 'should return false for null, undefined', () => {
			expect( imageUtils.isInlineImageView() ).toBe( false );
			expect( imageUtils.isInlineImageView( null ) ).toBe( false );
		} );
	} );

	describe( 'isBlockImageView()', () => {
		it( 'should return false for the inline image element', () => {
			const element = writer.createEmptyElement( 'img' );

			expect( imageUtils.isBlockImageView( element ) ).toBe( false );
		} );

		it( 'should return true for the block view image element', () => {
			const element = writer.createContainerElement( 'figure', { class: 'image' } );

			expect( imageUtils.isBlockImageView( element ) ).toBe( true );
		} );

		it( 'should return false for the figure without a proper class', () => {
			const element = writer.createContainerElement( 'figure' );

			expect( imageUtils.isBlockImageView( element ) ).toBe( false );
		} );

		it( 'should return false for the non-figure with a proper class', () => {
			const element = writer.createContainerElement( 'div', { class: 'image' } );

			expect( imageUtils.isBlockImageView( element ) ).toBe( false );
		} );

		it( 'should return false for other view element', () => {
			const element = writer.createContainerElement( 'div' );

			expect( imageUtils.isBlockImageView( element ) ).toBe( false );
		} );

		it( 'should return false for null, undefined', () => {
			expect( imageUtils.isBlockImageView() ).toBe( false );
			expect( imageUtils.isBlockImageView( null ) ).toBe( false );
		} );
	} );

	describe( 'isImageAllowed()', () => {
		let editor, model;

		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					imageUtils = editor.plugins.get( 'ImageUtils' );

					const schema = model.schema;
					schema.extend( 'imageBlock', { allowAttributes: 'uploadId' } );
				} );
		} );

		it( 'should return true when the selection directly in the root', () => {
			model.enqueueChange( { isUndoable: false }, () => {
				_setModelData( model, '[]' );

				expect( imageUtils.isImageAllowed() ).toBe( true );
			} );
		} );

		it( 'should return true when the selection is in empty block', () => {
			_setModelData( model, '<paragraph>[]</paragraph>' );

			expect( imageUtils.isImageAllowed() ).toBe( true );
		} );

		it( 'should return true when the selection directly in a paragraph', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( imageUtils.isImageAllowed() ).toBe( true );
		} );

		it( 'should return true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			_setModelData( model, '<block>foo[]</block>' );
			expect( imageUtils.isImageAllowed() ).toBe( true );
		} );

		it( 'should return true when the selection is on other image', () => {
			_setModelData( model, '[<imageBlock></imageBlock>]' );
			expect( imageUtils.isImageAllowed() ).toBe( true );
		} );

		it( 'should return false when the selection is inside other image', () => {
			model.schema.register( 'caption', {
				allowIn: 'imageBlock',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'caption', view: 'figcaption' } );
			_setModelData( model, '<imageBlock><caption>[]</caption></imageBlock>' );
			expect( imageUtils.isImageAllowed() ).toBe( false );
		} );

		it( 'should return true when the selection is on other object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
			_setModelData( model, '[<object></object>]' );

			expect( imageUtils.isImageAllowed() ).toBe( true );
		} );

		it( 'should be true when the selection is inside isLimit element which allows image', () => {
			model.schema.register( 'table', { allowWhere: '$block', isLimit: true, isObject: true, isBlock: true } );
			model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
			model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );
			model.schema.extend( '$block', { allowIn: 'tableCell' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'table', view: 'table' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tableRow' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableCell', view: 'tableCell' } );

			_setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );

			expect( imageUtils.isImageAllowed() ).toBe( true );
		} );

		it( 'should return false when schema disallows image', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( 'paragraph', { allowIn: 'block' } );
			// Block image in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'imageBlock' && context.last.name === 'block' ) {
					return false;
				}
				if ( childDefinition.name === 'imageInline' && context.last.name === 'paragraph' ) {
					return false;
				}
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			_setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( imageUtils.isImageAllowed() ).toBe( false );
		} );
	} );

	describe( 'insertImage()', () => {
		let editor, model;

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'config.image.insert.type set to "auto"', () => {
			beforeEach( () => createEditor( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ],
				image: { insert: { type: 'auto' } }
			} ) );

			it( 'should insert inline image in a paragraph with text', () => {
				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				imageUtils.insertImage( editor );

				expect( _getModelData( model ) ).toBe( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );
			} );

			it( 'should insert a block image when the selection is inside an empty paragraph', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				imageUtils.insertImage( editor );

				expect( _getModelData( model ) ).toBe( '[<imageBlock></imageBlock>]' );
			} );

			it( 'should insert a block image in the document root', () => {
				_setModelData( model, '[]' );

				imageUtils.insertImage( editor );

				expect( _getModelData( model ) ).toBe( '[<imageBlock></imageBlock>]' );
			} );

			it( 'should insert image with given attributes', () => {
				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				imageUtils.insertImage( { src: '/sample.png' } );

				expect( _getModelData( model ) )
					.toBe( '<paragraph>f[<imageInline src="/sample.png"></imageInline>]o</paragraph>' );
			} );

			it( 'should use the inline image type when there is only ImageInlineEditing plugin enabled', async () => {
				const consoleWarnStub = vi.spyOn( console, 'warn' );

				await editor.destroy();
				await createEditor( {
					plugins: [ ImageUtils, ImageInlineEditing, Paragraph ],
					image: { insert: { type: 'auto' } }
				} );

				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				editor.plugins.get( 'ImageUtils' ).insertImage();

				expect( consoleWarnStub ).not.toHaveBeenCalled();
				expect( _getModelData( model ) ).toBe( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );

				consoleWarnStub.mockRestore();
			} );

			it( 'should use the block image type when there is only ImageBlockEditing plugin enabled', async () => {
				const consoleWarnStub = vi.spyOn( console, 'warn' );

				await editor.destroy();
				await createEditor( {
					plugins: [ ImageUtils, ImageBlockEditing, Paragraph ],
					image: { insert: { type: 'auto' } }
				} );

				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				editor.plugins.get( 'ImageUtils' ).insertImage();

				expect( consoleWarnStub ).not.toHaveBeenCalled();
				expect( _getModelData( model ) ).toBe( '[<imageBlock></imageBlock>]<paragraph>foo</paragraph>' );

				consoleWarnStub.mockRestore();
			} );

			it( 'should pass the allowed custom attributes to the inserted block image', () => {
				_setModelData( model, '[]' );
				model.schema.extend( 'imageBlock', { allowAttributes: 'customAttribute' } );

				imageUtils.insertImage( { src: '/sample.png', customAttribute: 'value' } );

				expect( _getModelData( model ) )
					.toBe( '[<imageBlock customAttribute="value" src="/sample.png"></imageBlock>]' );
			} );

			it( 'should omit the disallowed attributes while inserting a block image', () => {
				_setModelData( model, '[]' );

				imageUtils.insertImage( { src: '/sample.png', customAttribute: 'value' } );

				expect( _getModelData( model ) )
					.toBe( '[<imageBlock src="/sample.png"></imageBlock>]' );
			} );

			it( 'should pass the allowed custom attributes to the inserted inline image', () => {
				_setModelData( model, '<paragraph>f[o]o</paragraph>' );
				model.schema.extend( 'imageInline', { allowAttributes: 'customAttribute' } );

				imageUtils.insertImage( { src: '/sample.png', customAttribute: 'value' } );

				expect( _getModelData( model ) )
					.toBe( '<paragraph>f[<imageInline customAttribute="value" src="/sample.png"></imageInline>]o</paragraph>' );
			} );

			it( 'should omit the disallowed attributes while inserting an inline image', () => {
				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				imageUtils.insertImage( { src: '/sample.png', customAttribute: 'value' } );

				expect( _getModelData( model ) )
					.toBe( '<paragraph>f[<imageInline src="/sample.png"></imageInline>]o</paragraph>' );
			} );

			it( 'should return the inserted image element', () => {
				_setModelData( model, '[]' );

				const imageElement = imageUtils.insertImage( editor );

				expect( _getModelData( model ) ).toBe( '[<imageBlock></imageBlock>]' );
				expect( imageElement.is( 'element', 'imageBlock' ) ).toBe( true );
				expect( imageElement ).toBe( model.document.getRoot().getChild( 0 ) );
			} );

			it( 'should return null when the image could not be inserted', () => {
				model.schema.register( 'other', {
					allowIn: '$root',
					allowChildren: '$text',
					isLimit: true
				} );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'other', view: 'p' } );

				_setModelData( model, '<other>[]</other>' );

				const imageElement = imageUtils.insertImage();

				expect( _getModelData( model ) ).toBe( '<other>[]</other>' );

				expect( imageElement ).toBe( null );
			} );

			it( 'should set image width and height', done => {
				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				imageUtils.insertImage( { src: '/sample.png' } );

				setTimeout( () => {
					expect( _getModelData( model ) ).toBe(
						'<paragraph>f[<imageInline height="96" src="/sample.png" width="96"></imageInline>]o</paragraph>'
					);

					done();
				}, 100 );
			} );

			it( 'should not set image width and height if `setImageSizes` parameter is false', done => {
				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				imageUtils.insertImage( { src: '/sample.png' }, null, null, { setImageSizes: false } );

				setTimeout( () => {
					expect( _getModelData( model ) ).toBe(
						'<paragraph>f[<imageInline src="/sample.png"></imageInline>]o</paragraph>'
					);

					done();
				}, 100 );
			} );
		} );

		describe( 'config.image.insert.type set to "block"', () => {
			beforeEach( () => createEditor( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ],
				image: { insert: { type: 'block' } }
			} ) );

			it( 'should use the block image type', () => {
				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				editor.plugins.get( 'ImageUtils' ).insertImage( editor );

				expect( _getModelData( model ) ).toBe( '[<imageBlock></imageBlock>]<paragraph>foo</paragraph>' );
			} );

			it( 'should use the inline image type when ImageBlockEditing plugin is not enabled', async () => {
				const consoleWarnStub = vi.spyOn( console, 'warn' );

				await editor.destroy();
				await createEditor( {
					plugins: [ ImageInlineEditing, Paragraph ],
					image: { insert: { type: 'block' } }
				} );

				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				editor.plugins.get( 'ImageUtils' ).insertImage();

				expect( consoleWarnStub ).toHaveBeenCalledTimes( 1 );
				expect( consoleWarnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'image-block-plugin-required' );
				expect( _getModelData( model ) ).toBe( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );

				consoleWarnStub.mockRestore();
			} );
		} );

		describe( 'config.image.insert.type set to "inline"', () => {
			beforeEach( () => createEditor( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ],
				image: { insert: { type: 'inline' } }
			} ) );

			it( 'should use the inline image type', () => {
				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				editor.plugins.get( 'ImageUtils' ).insertImage();

				expect( _getModelData( model ) ).toBe( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );
			} );

			it( 'should use the inline image type in an empty paragraph', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				editor.plugins.get( 'ImageUtils' ).insertImage();

				expect( _getModelData( model ) ).toBe( '<paragraph>[<imageInline></imageInline>]</paragraph>' );
			} );

			it( 'should use the block image type when ImageInlineEditing plugin is not enabled', async () => {
				const consoleWarnStub = vi.spyOn( console, 'warn' );

				await editor.destroy();
				await createEditor( {
					plugins: [ ImageBlockEditing, Paragraph ],
					image: { insert: { type: 'inline' } }
				} );

				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				editor.plugins.get( 'ImageUtils' ).insertImage();

				expect( consoleWarnStub ).toHaveBeenCalledTimes( 1 );
				expect( consoleWarnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'image-inline-plugin-required' );
				expect( _getModelData( model ) ).toBe( '[<imageBlock></imageBlock>]<paragraph>foo</paragraph>' );

				consoleWarnStub.mockRestore();
			} );
		} );

		describe( 'config.image.insert.type not provided', () => {
			beforeEach( () => createEditor( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ]
			} ) );

			it( 'should not insert image nor crash when image could not be inserted', () => {
				model.schema.register( 'other', {
					allowIn: '$root',
					allowChildren: '$text',
					isLimit: true
				} );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'other', view: 'p' } );

				_setModelData( model, '<other>[]</other>' );

				imageUtils.insertImage();

				expect( _getModelData( model ) ).toBe( '<other>[]</other>' );
			} );

			it( 'should use the inline image type when there is only ImageInlineEditing plugin enabled', async () => {
				const consoleWarnStub = vi.spyOn( console, 'warn' );

				await editor.destroy();
				await createEditor( {
					plugins: [ ImageInlineEditing, Paragraph ]
				} );

				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				editor.plugins.get( 'ImageUtils' ).insertImage();

				expect( consoleWarnStub ).not.toHaveBeenCalled();
				expect( _getModelData( model ) ).toBe( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );

				consoleWarnStub.mockRestore();
			} );

			it( 'should use the block image type by default', () => {
				_setModelData( model, '<paragraph>f[o]o</paragraph>' );

				editor.plugins.get( 'ImageUtils' ).insertImage();

				expect( _getModelData( model ) ).toBe( '[<imageBlock></imageBlock>]<paragraph>foo</paragraph>' );
			} );
		} );

		async function createEditor( config ) {
			editor = await VirtualTestEditor.create( config );
			model = editor.model;
			imageUtils = editor.plugins.get( 'ImageUtils' );

			const schema = model.schema;

			if ( schema.isRegistered( 'imageBlock' ) ) {
				schema.extend( 'imageBlock', { allowAttributes: 'uploadId' } );
			}
		}
	} );

	describe( 'findViewImgElement()', () => {
		// figure
		//   img
		it( 'returns the the img element from widget if the img is the first children', () => {
			expect( imageUtils.findViewImgElement( element ) ).toBe( image );
		} );

		// figure
		//   div
		//   img
		it( 'returns the the img element from widget if the img is not the first children', () => {
			writer.insert( writer.createPositionAt( element, 0 ), writer.createContainerElement( 'div' ) );
			expect( imageUtils.findViewImgElement( element ) ).toBe( image );
		} );

		// figure
		//   div
		//     img
		it( 'returns the the img element from widget if the img is a child of another element', () => {
			const divElement = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( element, 0 ), divElement );
			writer.move( writer.createRangeOn( image ), writer.createPositionAt( divElement, 0 ) );

			expect( imageUtils.findViewImgElement( element ) ).toBe( image );
		} );

		// figure
		//   div
		//      div
		//         div
		//            div
		//              img
		it( 'finds the the img element deeply nested in a view tree', () => {
			const divElement1 = writer.createContainerElement( 'div' );
			const divElement2 = writer.createContainerElement( 'div' );
			const divElement3 = writer.createContainerElement( 'div' );
			const divElement4 = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( element, 0 ), divElement1 );
			writer.insert( writer.createPositionAt( divElement1, 0 ), divElement2 );
			writer.insert( writer.createPositionAt( divElement2, 0 ), divElement3 );
			writer.insert( writer.createPositionAt( divElement3, 0 ), divElement4 );
			writer.move( writer.createRangeOn( image ), writer.createPositionAt( divElement4, 0 ) );

			expect( imageUtils.findViewImgElement( element ) ).toBe( image );
		} );

		// figure
		//   div
		//     "Bar"
		//     img
		//   "Foo"
		it( 'does not throw an error if text node found', () => {
			const divElement = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( element, 0 ), divElement );
			writer.insert( writer.createPositionAt( element, 0 ), writer.createText( 'Foo' ) );
			writer.insert( writer.createPositionAt( divElement, 0 ), writer.createText( 'Bar' ) );
			writer.move( writer.createRangeOn( image ), writer.createPositionAt( divElement, 1 ) );

			expect( imageUtils.findViewImgElement( element ) ).toBe( image );
		} );
	} );
} );
