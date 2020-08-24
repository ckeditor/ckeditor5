/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ViewDocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';
import ViewDowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import {
	toImageWidget,
	isImageWidget,
	getSelectedImageWidget,
	isImage,
	isImageAllowed,
	insertImage,
	getViewImgFromWidget
} from '../../src/image/utils';
import { isWidget, getLabel } from '@ckeditor/ckeditor5-widget/src/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Image from '../../src/image/imageediting';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

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
			frag = new ViewDocumentFragment( viewDocument, [ element ] );

			const selection = writer.createSelection( element, 'on' );

			expect( getSelectedImageWidget( selection ) ).to.equal( element );
		} );

		it( 'should return false when non-widgetized elements is the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			// We need to create a container for the element to be able to create a Range on this element.
			frag = new ViewDocumentFragment( viewDocument, [ notWidgetizedElement ] );

			const selection = writer.createSelection( notWidgetizedElement, 'on' );

			expect( getSelectedImageWidget( selection ) ).to.be.null;
		} );

		it( 'should return false when widget element is not the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			frag = new ViewDocumentFragment( viewDocument, [ element, notWidgetizedElement ] );

			const selection = writer.createSelection( writer.createRangeIn( frag ) );

			expect( getSelectedImageWidget( selection ) ).to.be.null;
		} );
	} );

	describe( 'isImage()', () => {
		it( 'should return true for image element', () => {
			const image = new ModelElement( 'image' );

			expect( isImage( image ) ).to.be.true;
		} );

		it( 'should return true false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( isImage( image ) ).to.be.false;
		} );

		it( 'should return true false for null and undefined', () => {
			expect( isImage( null ) ).to.be.false;
			expect( isImage( undefined ) ).to.be.false;
		} );
	} );

	describe( 'isImageAllowed()', () => {
		let editor, model;

		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Image, Paragraph ]
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

				expect( isImageAllowed( model ) ).to.be.true;
			} );
		} );

		it( 'should return true when the selection is in empty block', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( isImageAllowed( model ) ).to.be.true;
		} );

		it( 'should return true when the selection directly in a paragraph', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( isImageAllowed( model ) ).to.be.true;
		} );

		it( 'should return true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block>foo[]</block>' );
			expect( isImageAllowed( model ) ).to.be.true;
		} );

		it( 'should return false when the selection is on other image', () => {
			setModelData( model, '[<image></image>]' );
			expect( isImageAllowed( model ) ).to.be.false;
		} );

		it( 'should return false when the selection is inside other image', () => {
			model.schema.register( 'caption', {
				allowIn: 'image',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'caption', view: 'figcaption' } );
			setModelData( model, '<image><caption>[]</caption></image>' );
			expect( isImageAllowed( model ) ).to.be.false;
		} );

		it( 'should return false when the selection is on other object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
			setModelData( model, '[<object></object>]' );

			expect( isImageAllowed( model ) ).to.be.false;
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

			expect( isImageAllowed( model ) ).to.be.true;
		} );

		it( 'should return false when schema disallows image', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( 'paragraph', { allowIn: 'block' } );
			// Block image in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'image' && context.last.name === 'block' ) {
					return false;
				}
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( isImageAllowed( model ) ).to.be.false;
		} );
	} );

	describe( 'insertImage()', () => {
		let editor, model;

		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Image, Paragraph ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;

					const schema = model.schema;
					schema.extend( 'image', { allowAttributes: 'uploadId' } );
				} );
		} );

		it( 'should insert image at selection position as other widgets', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			model.change( writer => {
				insertImage( writer, model );
			} );

			expect( getModelData( model ) ).to.equal( '[<image></image>]<paragraph>foo</paragraph>' );
		} );

		it( 'should insert image with given attributes', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			model.change( writer => {
				insertImage( writer, model, { src: 'bar' } );
			} );

			expect( getModelData( model ) ).to.equal( '[<image src="bar"></image>]<paragraph>foo</paragraph>' );
		} );

		it( 'should not insert image nor crash when image could not be inserted', () => {
			model.schema.register( 'other', {
				allowIn: '$root',
				isLimit: true
			} );
			model.schema.extend( '$text', { allowIn: 'other' } );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'other', view: 'p' } );

			setModelData( model, '<other>[]</other>' );

			model.change( writer => {
				insertImage( writer, model );
			} );

			expect( getModelData( model ) ).to.equal( '<other>[]</other>' );
		} );
	} );

	describe( 'getViewImgFromWidget()', () => {
		// figure
		//   img
		it( 'returns the the img element from widget if the img is the first children', () => {
			expect( getViewImgFromWidget( element ) ).to.equal( image );
		} );

		// figure
		//   div
		//   img
		it( 'returns the the img element from widget if the img is not the first children', () => {
			writer.insert( writer.createPositionAt( element, 0 ), writer.createContainerElement( 'div' ) );
			expect( getViewImgFromWidget( element ) ).to.equal( image );
		} );

		// figure
		//   div
		//     img
		it( 'returns the the img element from widget if the img is a child of another element', () => {
			const divElement = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( element, 0 ), divElement );
			writer.move( writer.createRangeOn( image ), writer.createPositionAt( divElement, 0 ) );

			expect( getViewImgFromWidget( element ) ).to.equal( image );
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

			expect( getViewImgFromWidget( element ) ).to.equal( image );
		} );
	} );
} );
