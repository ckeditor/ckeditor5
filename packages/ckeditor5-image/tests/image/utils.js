/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

import ViewDowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { isWidget, getLabel } from '@ckeditor/ckeditor5-widget/src/utils';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageInlineEditing from '../../src/image/imageinlineediting';

import {
	toImageWidget,
	isImageWidget,
	getSelectedImageWidget,
	isImage,
	isInlineImage,
	isBlockImage,
	isImageAllowed,
	insertImage,
	getViewImageFromWidget,
	getImageWidgetAncestor,
	isInlineViewImage,
	isBlockViewImage,
	determineImageTypeForInsertionAtSelection
} from '../../src/image/utils';

describe( 'image widget utils', () => {
	let element, image, writer, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		writer = new ViewDowncastWriter( viewDocument );
		image = writer.createContainerElement( 'img' );
		element = writer.createContainerElement( 'figure' );
		writer.insert( writer.createPositionAt( element, 0 ), image );
		toImageWidget( element, writer, 'image widget' );
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
			expect( isImageWidget( element ) ).to.be.true;
		} );

		it( 'should return false for non-widgetized elements', () => {
			expect( isImageWidget( writer.createContainerElement( 'p' ) ) ).to.be.false;
		} );
	} );

	describe( 'getSelectedImageWidget()', () => {
		let frag;

		it( 'should return true when image widget is the only element in the selection', () => {
			// We need to create a container for the element to be able to create a Range on this element.
			frag = writer.createDocumentFragment( element );

			const selection = writer.createSelection( element, 'on' );

			expect( getSelectedImageWidget( selection ) ).to.equal( element );
		} );

		it( 'should return false when non-widgetized elements is the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			// We need to create a container for the element to be able to create a Range on this element.
			frag = writer.createDocumentFragment( notWidgetizedElement );

			const selection = writer.createSelection( notWidgetizedElement, 'on' );

			expect( getSelectedImageWidget( selection ) ).to.be.null;
		} );

		it( 'should return false when widget element is not the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			frag = writer.createDocumentFragment( [ element, notWidgetizedElement ] );

			const selection = writer.createSelection( writer.createRangeIn( frag ) );

			expect( getSelectedImageWidget( selection ) ).to.be.null;
		} );
	} );

	describe( 'getImageWidgetAncestor()', () => {
		let frag, caption;

		describe( 'when the selection is inside a caption', () => {
			beforeEach( () => {
				caption = writer.createContainerElement( 'figcaption' );
				writer.insert( writer.createPositionAt( element, 1 ), caption );
				frag = writer.createDocumentFragment( element );
			} );

			it( 'should return the widget element if the selection is not collapsed', () => {
				const text = writer.createText( 'foo' );
				writer.insert( writer.createPositionAt( caption, 0 ), text );

				const selection = writer.createSelection( writer.createRangeIn( caption ) );

				expect( getImageWidgetAncestor( selection ) ).to.equal( element );
			} );

			it( 'should return the widget element if the selection is collapsed', () => {
				const selection = writer.createSelection( caption, 'in' );

				expect( getImageWidgetAncestor( selection ) ).to.equal( element );
			} );
		} );

		it( 'should return null if an image is selected', () => {
			// We need to create a container for the element to be able to create a Range on this element.
			frag = writer.createDocumentFragment( element );

			const selection = writer.createSelection( element, 'on' );

			expect( getImageWidgetAncestor( selection ) ).to.be.null;
		} );

		it( 'should return null if an image is a part of the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			frag = writer.createDocumentFragment( [ element, notWidgetizedElement ] );

			const selection = writer.createSelection( writer.createRangeIn( frag ) );

			expect( getImageWidgetAncestor( selection ) ).to.be.null;
		} );

		it( 'should return null if a non-widgetized element is the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			// We need to create a container for the element to be able to create a Range on this element.
			frag = writer.createDocumentFragment( notWidgetizedElement );

			const selection = writer.createSelection( notWidgetizedElement, 'on' );

			expect( getImageWidgetAncestor( selection ) ).to.be.null;
		} );

		it( 'should return null if the selection is inside a figure element, which is not an image', () => {
			const innerContainer = writer.createContainerElement( 'p' );

			element = writer.createContainerElement( 'figure' );

			writer.insert( writer.createPositionAt( element, 1 ), innerContainer );

			frag = writer.createDocumentFragment( element );

			const selection = writer.createSelection( innerContainer, 'in' );

			expect( getImageWidgetAncestor( selection ) ).to.be.null;
		} );
	} );

	describe( 'isImage()', () => {
		it( 'should return true for the block image element', () => {
			const image = new ModelElement( 'image' );

			expect( isImage( image ) ).to.be.true;
		} );

		it( 'should return true for the inline image element', () => {
			const image = new ModelElement( 'imageInline' );

			expect( isImage( image ) ).to.be.true;
		} );

		it( 'should return false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( isImage( image ) ).to.be.false;
		} );

		it( 'should return false for null and undefined', () => {
			expect( isImage( null ) ).to.be.false;
			expect( isImage( undefined ) ).to.be.false;
		} );
	} );

	describe( 'isInlineImage()', () => {
		it( 'should return true for the inline image element', () => {
			const image = new ModelElement( 'imageInline' );

			expect( isInlineImage( image ) ).to.be.true;
		} );

		it( 'should return false for the block image element', () => {
			const image = new ModelElement( 'image' );

			expect( isInlineImage( image ) ).to.be.false;
		} );

		it( 'should return false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( isInlineImage( image ) ).to.be.false;
		} );

		it( 'should return false for null and undefined', () => {
			expect( isInlineImage( null ) ).to.be.false;
			expect( isInlineImage( undefined ) ).to.be.false;
		} );
	} );

	describe( 'isBlockImage()', () => {
		it( 'should return false for the inline image element', () => {
			const image = new ModelElement( 'imageInline' );

			expect( isBlockImage( image ) ).to.be.false;
		} );

		it( 'should return true for the block image element', () => {
			const image = new ModelElement( 'image' );

			expect( isBlockImage( image ) ).to.be.true;
		} );

		it( 'should return false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( isBlockImage( image ) ).to.be.false;
		} );

		it( 'should return false for null and undefined', () => {
			expect( isBlockImage( null ) ).to.be.false;
			expect( isBlockImage( undefined ) ).to.be.false;
		} );
	} );

	describe( 'isInlineViewImage()', () => {
		it( 'should return false for the block image element', () => {
			const element = writer.createContainerElement( 'figure', { class: 'image' } );

			expect( isInlineViewImage( element ) ).to.be.false;
		} );

		it( 'should return true for the inline view image element', () => {
			const element = writer.createEmptyElement( 'img' );

			expect( isInlineViewImage( element ) ).to.be.true;
		} );

		it( 'should return false for other view element', () => {
			const element = writer.createContainerElement( 'div' );

			expect( isInlineViewImage( element ) ).to.be.false;
		} );

		it( 'should return false for null, undefined', () => {
			expect( isInlineViewImage() ).to.be.false;
			expect( isInlineViewImage( null ) ).to.be.false;
		} );
	} );

	describe( 'isBlockViewImage()', () => {
		it( 'should return false for the inline image element', () => {
			const element = writer.createEmptyElement( 'img' );

			expect( isBlockViewImage( element ) ).to.be.false;
		} );

		it( 'should return true for the block view image element', () => {
			const element = writer.createContainerElement( 'figure', { class: 'image' } );

			expect( isBlockViewImage( element ) ).to.be.true;
		} );

		it( 'should return false for the figure without a proper class', () => {
			const element = writer.createContainerElement( 'figure' );

			expect( isBlockViewImage( element ) ).to.be.false;
		} );

		it( 'should return false for the non-figure with a proper class', () => {
			const element = writer.createContainerElement( 'div', { class: 'image' } );

			expect( isBlockViewImage( element ) ).to.be.false;
		} );

		it( 'should return false for other view element', () => {
			const element = writer.createContainerElement( 'div' );

			expect( isBlockViewImage( element ) ).to.be.false;
		} );

		it( 'should return false for null, undefined', () => {
			expect( isBlockViewImage() ).to.be.false;
			expect( isBlockViewImage( null ) ).to.be.false;
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

					const schema = model.schema;
					schema.extend( 'image', { allowAttributes: 'uploadId' } );
				} );
		} );

		it( 'should return true when the selection directly in the root', () => {
			model.enqueueChange( 'transparent', () => {
				setModelData( model, '[]' );

				expect( isImageAllowed( editor ) ).to.be.true;
			} );
		} );

		it( 'should return true when the selection is in empty block', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( isImageAllowed( editor ) ).to.be.true;
		} );

		it( 'should return true when the selection directly in a paragraph', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( isImageAllowed( editor ) ).to.be.true;
		} );

		it( 'should return true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block>foo[]</block>' );
			expect( isImageAllowed( editor ) ).to.be.true;
		} );

		it( 'should return true when the selection is on other image', () => {
			setModelData( model, '[<image></image>]' );
			expect( isImageAllowed( editor ) ).to.be.true;
		} );

		it( 'should return false when the selection is inside other image', () => {
			model.schema.register( 'caption', {
				allowIn: 'image',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'caption', view: 'figcaption' } );
			setModelData( model, '<image><caption>[]</caption></image>' );
			expect( isImageAllowed( editor ) ).to.be.false;
		} );

		it( 'should return true when the selection is on other object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
			setModelData( model, '[<object></object>]' );

			expect( isImageAllowed( editor ) ).to.be.true;
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

			expect( isImageAllowed( editor ) ).to.be.true;
		} );

		it( 'should return false when schema disallows image', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( 'paragraph', { allowIn: 'block' } );
			// Block image in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'image' && context.last.name === 'block' ) {
					return false;
				}
				if ( childDefinition.name === 'imageInline' && context.last.name === 'paragraph' ) {
					return false;
				}
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( isImageAllowed( editor ) ).to.be.false;
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

					const schema = model.schema;
					schema.extend( 'image', { allowAttributes: 'uploadId' } );
				} );
		} );

		it( 'should insert inline image in a paragraph with text', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			insertImage( editor );

			expect( getModelData( model ) ).to.equal( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );
		} );

		it( 'should insert a block image when the selection is inside an empty paragraph', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			insertImage( editor );

			expect( getModelData( model ) ).to.equal( '[<image></image>]' );
		} );

		it( 'should insert a block image in the document root', () => {
			setModelData( model, '[]' );

			insertImage( editor );

			expect( getModelData( model ) ).to.equal( '[<image></image>]' );
		} );

		it( 'should insert image with given attributes', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			insertImage( editor, { src: 'bar' } );

			expect( getModelData( model ) ).to.equal( '<paragraph>f[<imageInline src="bar"></imageInline>]o</paragraph>' );
		} );

		it( 'should not insert image nor crash when image could not be inserted', () => {
			model.schema.register( 'other', {
				allowIn: '$root',
				isLimit: true
			} );
			model.schema.extend( '$text', { allowIn: 'other' } );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'other', view: 'p' } );

			setModelData( model, '<other>[]</other>' );

			insertImage( editor );

			expect( getModelData( model ) ).to.equal( '<other>[]</other>' );
		} );

		it( 'should use the block image type when the config.image.insert.type="block" option is set', async () => {
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ],
				image: { insert: { type: 'block' } }
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			insertImage( newEditor );

			expect( getModelData( newEditor.model ) ).to.equal( '[<image></image>]<paragraph>foo</paragraph>' );

			await newEditor.destroy();
		} );

		it( 'should use the inline image type if the config.image.insert.type="inline" option is set', async () => {
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ],
				image: { insert: { type: 'inline' } }
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			insertImage( newEditor );

			expect( getModelData( newEditor.model ) ).to.equal( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );

			await newEditor.destroy();
		} );

		it( 'should use the inline image type when there is only ImageInlineEditing plugin enabled', async () => {
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageInlineEditing, Paragraph ]
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			insertImage( newEditor );

			expect( getModelData( newEditor.model ) ).to.equal( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );

			await newEditor.destroy();
		} );

		it( 'should use block the image type when there is only ImageBlockEditing plugin enabled', async () => {
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageBlockEditing, Paragraph ]
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			insertImage( newEditor );

			expect( getModelData( newEditor.model ) ).to.equal( '[<image></image>]<paragraph>foo</paragraph>' );

			await newEditor.destroy();
		} );

		it( 'should use the block image type when the config.image.insert.type="inline" option is set ' +
			'but ImageInlineEditing plugin is not enabled', async () => {
			const consoleWarnStub = sinon.stub( console, 'warn' );
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageBlockEditing, Paragraph ],
				image: { insert: { type: 'inline' } }
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			insertImage( newEditor );

			expect( consoleWarnStub.calledOnce ).to.equal( true );
			expect( consoleWarnStub.firstCall.args[ 0 ] ).to.equal( 'image-inline-plugin-required' );
			expect( getModelData( newEditor.model ) ).to.equal( '[<image></image>]<paragraph>foo</paragraph>' );

			await newEditor.destroy();
			console.warn.restore();
		} );

		it( 'should use the inline image type when the image.insert.type="block" option is set ' +
			'but ImageBlockEditing plugin is not enabled', async () => {
			const consoleWarnStub = sinon.stub( console, 'warn' );
			const newEditor = await VirtualTestEditor.create( {
				plugins: [ ImageInlineEditing, Paragraph ],
				image: { insert: { type: 'block' } }
			} );

			setModelData( newEditor.model, '<paragraph>f[o]o</paragraph>' );

			insertImage( newEditor );

			expect( consoleWarnStub.calledOnce ).to.equal( true );
			expect( consoleWarnStub.firstCall.args[ 0 ] ).to.equal( 'image-block-plugin-required' );
			expect( getModelData( newEditor.model ) ).to.equal( '<paragraph>f[<imageInline></imageInline>]o</paragraph>' );

			await newEditor.destroy();
			console.warn.restore();
		} );

		it( 'should pass the allowed custom attributes to the inserted block image', () => {
			setModelData( model, '[]' );
			model.schema.extend( 'image', { allowAttributes: 'customAttribute' } );

			insertImage( editor, { src: 'foo', customAttribute: 'value' } );

			expect( getModelData( model ) )
				.to.equal( '[<image customAttribute="value" src="foo"></image>]' );
		} );

		it( 'should omit the disallowed attributes while inserting a block image', () => {
			setModelData( model, '[]' );

			insertImage( editor, { src: 'foo', customAttribute: 'value' } );

			expect( getModelData( model ) )
				.to.equal( '[<image src="foo"></image>]' );
		} );

		it( 'should pass the allowed custom attributes to the inserted inline image', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );
			model.schema.extend( 'imageInline', { allowAttributes: 'customAttribute' } );

			insertImage( editor, { src: 'foo', customAttribute: 'value' } );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>f[<imageInline customAttribute="value" src="foo"></imageInline>]o</paragraph>' );
		} );

		it( 'should omit the disallowed attributes while inserting an inline image', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			insertImage( editor, { src: 'foo', customAttribute: 'value' } );

			expect( getModelData( model ) ).to.equal( '<paragraph>f[<imageInline src="foo"></imageInline>]o</paragraph>' );
		} );
	} );

	describe( 'getViewImageFromWidget()', () => {
		// figure
		//   img
		it( 'returns the the img element from widget if the img is the first children', () => {
			expect( getViewImageFromWidget( element ) ).to.equal( image );
		} );

		// figure
		//   div
		//   img
		it( 'returns the the img element from widget if the img is not the first children', () => {
			writer.insert( writer.createPositionAt( element, 0 ), writer.createContainerElement( 'div' ) );
			expect( getViewImageFromWidget( element ) ).to.equal( image );
		} );

		// figure
		//   div
		//     img
		it( 'returns the the img element from widget if the img is a child of another element', () => {
			const divElement = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( element, 0 ), divElement );
			writer.move( writer.createRangeOn( image ), writer.createPositionAt( divElement, 0 ) );

			expect( getViewImageFromWidget( element ) ).to.equal( image );
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

			expect( getViewImageFromWidget( element ) ).to.equal( image );
		} );
	} );

	describe( 'determineImageTypeForInsertionAtSelection()', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ]
			} );

			model = editor.model;
			model.schema.register( 'block', {
				inheritAllFrom: '$block'
			} );
			model.schema.register( 'blockWidget', {
				isObject: true,
				allowIn: '$root'
			} );
			model.schema.register( 'inlineWidget', {
				isObject: true,
				allowIn: [ '$block' ]
			} );

			model.schema.extend( '$text', { allowIn: [ 'block', '$root' ] } );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'blockWidget', view: 'blockWidget' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'inlineWidget', view: 'inlineWidget' } );
		} );

		it( 'should return "image" when there is no selected block in the selection', () => {
			setModelData( model, 'f[]oo' );

			expect( determineImageTypeForInsertionAtSelection( editor, model.document.selection ) ).to.equal( 'image' );
		} );

		it( 'should return "image" when the selected block in the selection is empty', () => {
			setModelData( model, '<block>[]</block>' );

			expect( determineImageTypeForInsertionAtSelection( editor, model.document.selection ) ).to.equal( 'image' );
		} );

		it( 'should return "image" when the selected block is an object (a widget)', () => {
			setModelData( model, '[<blockWidget></blockWidget>]' );

			expect( determineImageTypeForInsertionAtSelection( editor, model.document.selection ) ).to.equal( 'image' );
		} );

		it( 'should return "imageInline" when selected block in the selection has some content', () => {
			setModelData( model, '<block>[]a</block>' );

			expect( determineImageTypeForInsertionAtSelection( editor, model.document.selection ) ).to.equal( 'imageInline' );
		} );

		it( 'should return "imageInline" when an inline widget is selected', () => {
			setModelData( model, '<block>[<inlineWidget></inlineWidget>]</block>' );

			expect( determineImageTypeForInsertionAtSelection( editor, model.document.selection ) ).to.equal( 'imageInline' );
		} );
	} );
} );
