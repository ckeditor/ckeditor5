/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ViewDowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { isWidget, getLabel } from '@ckeditor/ckeditor5-widget/src/utils';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ImageBlockEditing from '../src/image/imageblockediting';
import ImageInlineEditing from '../src/image/imageinlineediting';
import ImageCaptionEditing from '../src/imagecaption/imagecaptionediting';

import ImageUtils from '../src/imageutils';

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
		expect( ImageUtils.pluginName ).to.equal( 'ImageUtils' );
	} );

	describe( 'toImageWidget()', () => {
		it( 'should be widgetized', () => {
			expect( isWidget( element ) ).to.be.true;
		} );

		it( 'should set element\'s label', () => {
			expect( getLabel( element ) ).to.equal( 'image widget' );
		} );

		it( 'should set element\'s label combined with alt attribute', () => {
			writer.setAttribute( 'alt', 'foo bar baz', image );
			expect( getLabel( element ) ).to.equal( 'foo bar baz image widget' );
		} );

		it( 'provided label creator should always return same label', () => {
			writer.setAttribute( 'alt', 'foo bar baz', image );

			expect( getLabel( element ) ).to.equal( 'foo bar baz image widget' );
			expect( getLabel( element ) ).to.equal( 'foo bar baz image widget' );
		} );
	} );

	describe( 'isImageWidget()', () => {
		it( 'should return true for elements marked with toImageWidget()', () => {
			expect( imageUtils.isImageWidget( element ) ).to.be.true;
		} );

		it( 'should return false for non-widgetized elements', () => {
			expect( imageUtils.isImageWidget( writer.createContainerElement( 'p' ) ) ).to.be.false;
		} );
	} );

	describe( 'getClosestSelectedImageWidget()', () => {
		let frag;

		it( 'should return an image widget when it is the only element in the selection', () => {
			// We need to create a container for the element to be able to create a Range on this element.
			frag = writer.createDocumentFragment( element );

			const selection = writer.createSelection( element, 'on' );

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).to.equal( element );
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

				expect( imageUtils.getClosestSelectedImageWidget( selection ) ).to.equal( element );
			} );

			it( 'should return the widget element if the selection is collapsed', () => {
				const selection = writer.createSelection( caption, 'in' );

				expect( imageUtils.getClosestSelectedImageWidget( selection ) ).to.equal( element );
			} );
		} );

		it( 'should return null when non-widgetized elements is the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			// We need to create a container for the element to be able to create a Range on this element.
			frag = writer.createDocumentFragment( notWidgetizedElement );

			const selection = writer.createSelection( notWidgetizedElement, 'on' );

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).to.be.null;
		} );

		it( 'should return null when widget element is not the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			frag = writer.createDocumentFragment( [ element, notWidgetizedElement ] );

			const selection = writer.createSelection( writer.createRangeIn( frag ) );

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).to.be.null;
		} );

		it( 'should return null if an image is a part of the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			frag = writer.createDocumentFragment( [ element, notWidgetizedElement ] );

			const selection = writer.createSelection( writer.createRangeIn( frag ) );

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).to.be.null;
		} );

		it( 'should return null if the selection is inside a figure element, which is not an image', () => {
			const innerContainer = writer.createContainerElement( 'p' );

			element = writer.createContainerElement( 'figure' );

			writer.insert( writer.createPositionAt( element, 1 ), innerContainer );

			frag = writer.createDocumentFragment( element );

			const selection = writer.createSelection( innerContainer, 'in' );

			expect( imageUtils.getClosestSelectedImageWidget( selection ) ).to.be.null;
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
			setModelData( model, '<paragraph>F[]oo</paragraph>' );

			expect( imageUtils.getClosestSelectedImageElement( model.document.selection ) ).to.be.null;
		} );

		it( 'should return null if a non-image element is selected', () => {
			setModelData( model, '[<blockWidget></blockWidget>]' );

			expect( imageUtils.getClosestSelectedImageElement( model.document.selection ) ).to.be.null;
		} );

		it( 'should return an imageInline element if it is selected', () => {
			setModelData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );

			const image = imageUtils.getClosestSelectedImageElement( model.document.selection );

			expect( image.is( 'element', 'imageInline' ) ).to.be.true;
		} );

		it( 'should return an image element if it is selected', () => {
			setModelData( model, '[<imageBlock></imageBlock>]' );

			const image = imageUtils.getClosestSelectedImageElement( model.document.selection );

			expect( image.is( 'element', 'imageBlock' ) ).to.be.true;
		} );

		it( 'should return an image element if the selection range is inside its caption', () => {
			setModelData( model, '<imageBlock><caption>F[oo]</caption></imageBlock>' );

			const image = imageUtils.getClosestSelectedImageElement( model.document.selection );

			expect( image.is( 'element', 'imageBlock' ) ).to.be.true;
		} );

		it( 'should return an image element if the selection position is inside its caption', () => {
			setModelData( model, '<imageBlock><caption>Foo[]</caption></imageBlock>' );

			const image = imageUtils.getClosestSelectedImageElement( model.document.selection );

			expect( image.is( 'element', 'imageBlock' ) ).to.be.true;
		} );
	} );

	describe( 'isImage()', () => {
		it( 'should return true for the block image element', () => {
			const image = new ModelElement( 'imageBlock' );

			expect( imageUtils.isImage( image ) ).to.be.true;
		} );

		it( 'should return true for the inline image element', () => {
			const image = new ModelElement( 'imageInline' );

			expect( imageUtils.isImage( image ) ).to.be.true;
		} );

		it( 'should return false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( imageUtils.isImage( image ) ).to.be.false;
		} );

		it( 'should return false for null and undefined', () => {
			expect( imageUtils.isImage( null ) ).to.be.false;
			expect( imageUtils.isImage( undefined ) ).to.be.false;
		} );
	} );

	describe( 'isInlineImage()', () => {
		it( 'should return true for the inline image element', () => {
			const image = new ModelElement( 'imageInline' );

			expect( imageUtils.isInlineImage( image ) ).to.be.true;
		} );

		it( 'should return false for the block image element', () => {
			const image = new ModelElement( 'imageBlock' );

			expect( imageUtils.isInlineImage( image ) ).to.be.false;
		} );

		it( 'should return false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( imageUtils.isInlineImage( image ) ).to.be.false;
		} );

		it( 'should return false for null and undefined', () => {
			expect( imageUtils.isInlineImage( null ) ).to.be.false;
			expect( imageUtils.isInlineImage( undefined ) ).to.be.false;
		} );
	} );

	describe( 'isBlockImage()', () => {
		it( 'should return false for the inline image element', () => {
			const image = new ModelElement( 'imageInline' );

			expect( imageUtils.isBlockImage( image ) ).to.be.false;
		} );

		it( 'should return true for the block image element', () => {
			const image = new ModelElement( 'imageBlock' );

			expect( imageUtils.isBlockImage( image ) ).to.be.true;
		} );

		it( 'should return false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( imageUtils.isBlockImage( image ) ).to.be.false;
		} );

		it( 'should return false for null and undefined', () => {
			expect( imageUtils.isBlockImage( null ) ).to.be.false;
			expect( imageUtils.isBlockImage( undefined ) ).to.be.false;
		} );
	} );

	describe( 'isInlineImageView()', () => {
		it( 'should return false for the block image element', () => {
			const element = writer.createContainerElement( 'figure', { class: 'image' } );

			expect( imageUtils.isInlineImageView( element ) ).to.be.false;
		} );

		it( 'should return true for the inline view image element', () => {
			const element = writer.createEmptyElement( 'img' );

			expect( imageUtils.isInlineImageView( element ) ).to.be.true;
		} );

		it( 'should return false for other view element', () => {
			const element = writer.createContainerElement( 'div' );

			expect( imageUtils.isInlineImageView( element ) ).to.be.false;
		} );

		it( 'should return false for null, undefined', () => {
			expect( imageUtils.isInlineImageView() ).to.be.false;
			expect( imageUtils.isInlineImageView( null ) ).to.be.false;
		} );
	} );

	describe( 'isBlockImageView()', () => {
		it( 'should return false for the inline image element', () => {
			const element = writer.createEmptyElement( 'img' );

			expect( imageUtils.isBlockImageView( element ) ).to.be.false;
		} );

		it( 'should return true for the block view image element', () => {
			const element = writer.createContainerElement( 'figure', { class: 'image' } );

			expect( imageUtils.isBlockImageView( element ) ).to.be.true;
		} );

		it( 'should return false for the figure without a proper class', () => {
			const element = writer.createContainerElement( 'figure' );

			expect( imageUtils.isBlockImageView( element ) ).to.be.false;
		} );

		it( 'should return false for the non-figure with a proper class', () => {
			const element = writer.createContainerElement( 'div', { class: 'image' } );

			expect( imageUtils.isBlockImageView( element ) ).to.be.false;
		} );

		it( 'should return false for other view element', () => {
			const element = writer.createContainerElement( 'div' );

			expect( imageUtils.isBlockImageView( element ) ).to.be.false;
		} );

		it( 'should return false for null, undefined', () => {
			expect( imageUtils.isBlockImageView() ).to.be.false;
			expect( imageUtils.isBlockImageView( null ) ).to.be.false;
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
				setModelData( model, '[]' );

				expect( imageUtils.isImageAllowed() ).to.be.true;
			} );
		} );

		it( 'should return true when the selection is in empty block', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( imageUtils.isImageAllowed() ).to.be.true;
		} );

		it( 'should return true when the selection directly in a paragraph', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( imageUtils.isImageAllowed() ).to.be.true;
		} );

		it( 'should return true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block>foo[]</block>' );
			expect( imageUtils.isImageAllowed() ).to.be.true;
		} );

		it( 'should return true when the selection is on other image', () => {
			setModelData( model, '[<imageBlock></imageBlock>]' );
			expect( imageUtils.isImageAllowed() ).to.be.true;
		} );

		it( 'should return false when the selection is inside other image', () => {
			model.schema.register( 'caption', {
				allowIn: 'imageBlock',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'caption', view: 'figcaption' } );
			setModelData( model, '<imageBlock><caption>[]</caption></imageBlock>' );
			expect( imageUtils.isImageAllowed() ).to.be.false;
		} );

		it( 'should return true when the selection is on other object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
			setModelData( model, '[<object></object>]' );

			expect( imageUtils.isImageAllowed() ).to.be.true;
		} );

		it( 'should be true when the selection is inside isLimit element which allows image', () => {
			model.schema.register( 'table', { allowWhere: '$block', isLimit: true, isObject: true, isBlock: true } );
			model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
			model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );
			model.schema.extend( '$block', { allowIn: 'tableCell' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'table', view: 'table' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tableRow' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableCell', view: 'tableCell' } );

			setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );

			expect( imageUtils.isImageAllowed() ).to.be.true;
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

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( imageUtils.isImageAllowed() ).to.be.false;
		} );
	} );

	describe( 'insertImage()', () => {
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

		afterEach( async () => {
			return editor.destroy();
		} );

		it( 'should insert inline image in a paragraph with text', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			imageUtils.insertImage( editor );

			expect( getModelData( model ) ).to.equal( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );
		} );

		it( 'should insert a block image when the selection is inside an empty paragraph', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			imageUtils.insertImage( editor );

			expect( getModelData( model ) ).to.equal( '[<imageBlock></imageBlock>]' );
		} );

		it( 'should insert a block image in the document root', () => {
			setModelData( model, '[]' );

			imageUtils.insertImage( editor );

			expect( getModelData( model ) ).to.equal( '[<imageBlock></imageBlock>]' );
		} );

		it( 'should insert image with given attributes', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			imageUtils.insertImage( { src: 'bar' } );

			expect( getModelData( model ) ).to.equal( '<paragraph>f[<imageInline src="bar"></imageInline>]o</paragraph>' );
		} );

		it( 'should not insert image nor crash when image could not be inserted', () => {
			model.schema.register( 'other', {
				allowIn: '$root',
				allowChildren: '$text',
				isLimit: true
			} );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'other', view: 'p' } );

			setModelData( model, '<other>[]</other>' );

			imageUtils.insertImage();

			expect( getModelData( model ) ).to.equal( '<other>[]</other>' );
		} );

		it( 'should use the block image type when the config.image.insert.type="block" option is set', async () => {
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageUtils, ImageBlockEditing, ImageInlineEditing, Paragraph ],
				image: { insert: { type: 'block' } }
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			newEditor.plugins.get( 'ImageUtils' ).insertImage( newEditor );

			expect( getModelData( newEditor.model ) ).to.equal( '[<imageBlock></imageBlock>]<paragraph>foo</paragraph>' );

			await newEditor.destroy();
		} );

		it( 'should use the inline image type if the config.image.insert.type="inline" option is set', async () => {
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageUtils, ImageBlockEditing, ImageInlineEditing, Paragraph ],
				image: { insert: { type: 'inline' } }
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			newEditor.plugins.get( 'ImageUtils' ).insertImage();

			expect( getModelData( newEditor.model ) ).to.equal( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );

			await newEditor.destroy();
		} );

		it( 'should use the inline image type when there is only ImageInlineEditing plugin enabled', async () => {
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageUtils, ImageInlineEditing, Paragraph ]
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			newEditor.plugins.get( 'ImageUtils' ).insertImage();

			expect( getModelData( newEditor.model ) ).to.equal( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );

			await newEditor.destroy();
		} );

		it( 'should use block the image type when there is only ImageBlockEditing plugin enabled', async () => {
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageUtils, ImageBlockEditing, Paragraph ]
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			newEditor.plugins.get( 'ImageUtils' ).insertImage();

			expect( getModelData( newEditor.model ) ).to.equal( '[<imageBlock></imageBlock>]<paragraph>foo</paragraph>' );

			await newEditor.destroy();
		} );

		it( 'should use the block image type when the config.image.insert.type="inline" option is set ' +
			'but ImageInlineEditing plugin is not enabled', async () => {
			const consoleWarnStub = sinon.stub( console, 'warn' );
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageUtils, ImageBlockEditing, Paragraph ],
				image: { insert: { type: 'inline' } }
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			newEditor.plugins.get( 'ImageUtils' ).insertImage();

			expect( consoleWarnStub.calledOnce ).to.equal( true );
			expect( consoleWarnStub.firstCall.args[ 0 ] ).to.equal( 'image-inline-plugin-required' );
			expect( getModelData( newEditor.model ) ).to.equal( '[<imageBlock></imageBlock>]<paragraph>foo</paragraph>' );

			await newEditor.destroy();
			console.warn.restore();
		} );

		it( 'should use the inline image type when the image.insert.type="block" option is set ' +
			'but ImageBlockEditing plugin is not enabled', async () => {
			const consoleWarnStub = sinon.stub( console, 'warn' );
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageUtils, ImageInlineEditing, Paragraph ],
				image: { insert: { type: 'block' } }
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			newEditor.plugins.get( 'ImageUtils' ).insertImage();

			expect( consoleWarnStub.calledOnce ).to.equal( true );
			expect( consoleWarnStub.firstCall.args[ 0 ] ).to.equal( 'image-block-plugin-required' );
			expect( getModelData( newEditor.model ) ).to.equal( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );

			await newEditor.destroy();
			console.warn.restore();
		} );

		it( 'should pass the allowed custom attributes to the inserted block image', () => {
			setModelData( model, '[]' );
			model.schema.extend( 'imageBlock', { allowAttributes: 'customAttribute' } );

			imageUtils.insertImage( { src: 'foo', customAttribute: 'value' } );

			expect( getModelData( model ) )
				.to.equal( '[<imageBlock customAttribute="value" src="foo"></imageBlock>]' );
		} );

		it( 'should omit the disallowed attributes while inserting a block image', () => {
			setModelData( model, '[]' );

			imageUtils.insertImage( { src: 'foo', customAttribute: 'value' } );

			expect( getModelData( model ) )
				.to.equal( '[<imageBlock src="foo"></imageBlock>]' );
		} );

		it( 'should pass the allowed custom attributes to the inserted inline image', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );
			model.schema.extend( 'imageInline', { allowAttributes: 'customAttribute' } );

			imageUtils.insertImage( { src: 'foo', customAttribute: 'value' } );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>f[<imageInline customAttribute="value" src="foo"></imageInline>]o</paragraph>' );
		} );

		it( 'should omit the disallowed attributes while inserting an inline image', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			imageUtils.insertImage( { src: 'foo', customAttribute: 'value' } );

			expect( getModelData( model ) ).to.equal( '<paragraph>f[<imageInline src="foo"></imageInline>]o</paragraph>' );
		} );

		it( 'should return the inserted image element', () => {
			setModelData( model, '[]' );

			const imageElement = imageUtils.insertImage( editor );

			expect( getModelData( model ) ).to.equal( '[<imageBlock></imageBlock>]' );
			expect( imageElement.is( 'element', 'imageBlock' ) ).to.be.true;
			expect( imageElement ).to.equal( model.document.getRoot().getChild( 0 ) );
		} );

		it( 'should return null when the image could not be inserted', () => {
			model.schema.register( 'other', {
				allowIn: '$root',
				allowChildren: '$text',
				isLimit: true
			} );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'other', view: 'p' } );

			setModelData( model, '<other>[]</other>' );

			const imageElement = imageUtils.insertImage();

			expect( getModelData( model ) ).to.equal( '<other>[]</other>' );

			expect( imageElement ).to.be.null;
		} );
	} );

	describe( 'findViewImgElement()', () => {
		// figure
		//   img
		it( 'returns the the img element from widget if the img is the first children', () => {
			expect( imageUtils.findViewImgElement( element ) ).to.equal( image );
		} );

		// figure
		//   div
		//   img
		it( 'returns the the img element from widget if the img is not the first children', () => {
			writer.insert( writer.createPositionAt( element, 0 ), writer.createContainerElement( 'div' ) );
			expect( imageUtils.findViewImgElement( element ) ).to.equal( image );
		} );

		// figure
		//   div
		//     img
		it( 'returns the the img element from widget if the img is a child of another element', () => {
			const divElement = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( element, 0 ), divElement );
			writer.move( writer.createRangeOn( image ), writer.createPositionAt( divElement, 0 ) );

			expect( imageUtils.findViewImgElement( element ) ).to.equal( image );
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

			expect( imageUtils.findViewImgElement( element ) ).to.equal( image );
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

			expect( imageUtils.findViewImgElement( element ) ).to.equal( image );
		} );
	} );
} );
