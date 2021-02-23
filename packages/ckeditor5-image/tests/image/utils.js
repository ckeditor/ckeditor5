/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

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
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Image from '../../src/image/imageediting';
import { Widget } from '@ckeditor/ckeditor5-widget';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

describe( 'image widget utils', () => {
	let domElement, element, image, editor, model, widget, view

	beforeEach( () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		return ClassicTestEditor
			.create( domElement, {
				plugins: [ Image, Paragraph, Widget ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
				widget = editor.plugins.get( 'Widget' );

				const schema = model.schema;
				schema.extend( 'image', { allowAttributes: 'uploadId' } );

				view.change( writer => {
					image = writer.createContainerElement( 'img' );
					element = writer.createContainerElement( 'figure' );

					writer.insert( writer.createPositionAt( element, 0 ), image );

					toImageWidget( element, writer, 'image widget', widget );
				} );
			} );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	describe( 'toImageWidget()', () => {
		it( 'should be widgetized', () => {
			expect( widget.isWidget( element ) ).to.be.true;
		} );

		it( 'should set element\'s label', () => {
			expect( widget.getLabel( element ) ).to.equal( 'image widget' );
		} );

		it( 'should set element\'s label combined with alt attribute', () => {
			view.change( writer => {
				writer.setAttribute( 'alt', 'foo bar baz', image );
			} );

			expect( widget.getLabel( element ) ).to.equal( 'foo bar baz image widget' );
		} );

		it( 'provided label creator should always return same label', () => {
			view.change( writer => {
				writer.setAttribute( 'alt', 'foo bar baz', image );
			} );

			expect( widget.getLabel( element ) ).to.equal( 'foo bar baz image widget' );
			expect( widget.getLabel( element ) ).to.equal( 'foo bar baz image widget' );
		} );
	} );

	describe( 'isImageWidget()', () => {
		it( 'should return true for elements marked with toImageWidget()', () => {
			expect( isImageWidget( element, widget ) ).to.be.true;
		} );

		it( 'should return false for non-widgetized elements', () => {
			view.change( writer => {
				expect( isImageWidget( writer.createContainerElement( 'p' ), widget ) ).to.be.false;
			} );
		} );
	} );

	describe( 'getSelectedImageWidget()', () => {
		let selection;

		it( 'should return true when image widget is the only element in the selection', () => {
			// We need to create a container for the element to be able to create a Range on this element.
			view.change( writer => {
				writer.createDocumentFragment( [ element ] );
				selection = writer.createSelection( element, 'on' );
			} );

			expect( getSelectedImageWidget( selection, widget ) ).to.equal( element );
		} );

		it( 'should return false when non-widgetized elements is the only element in the selection', () => {
			// We need to create a container for the element to be able to create a Range on this element.
			view.change( writer => {
				const notWidgetizedElement = writer.createContainerElement( 'p' );

				writer.createDocumentFragment( [ notWidgetizedElement ] );
				selection = writer.createSelection( notWidgetizedElement, 'on' );
			} );

			expect( getSelectedImageWidget( selection, widget ) ).to.be.null;
		} );

		it( 'should return false when widget element is not the only element in the selection', () => {
			view.change( writer => {
				const notWidgetizedElement = writer.createContainerElement( 'p' );
				const frag = writer.createDocumentFragment( [ notWidgetizedElement ] );

				selection = writer.createSelection( writer.createRangeIn( frag ) );
			} );

			expect( getSelectedImageWidget( selection, widget ) ).to.be.null;
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
		it( 'should return true when the selection directly in the root', () => {
			model.enqueueChange( 'transparent', () => {
				setModelData( model, '[]' );

				expect( isImageAllowed( model, widget ) ).to.be.true;
			} );
		} );

		it( 'should return true when the selection is in empty block', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( isImageAllowed( model, widget ) ).to.be.true;
		} );

		it( 'should return true when the selection directly in a paragraph', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( isImageAllowed( model, widget ) ).to.be.true;
		} );

		it( 'should return true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block>foo[]</block>' );
			expect( isImageAllowed( model, widget ) ).to.be.true;
		} );

		it( 'should return false when the selection is on other image', () => {
			setModelData( model, '[<image></image>]' );
			expect( isImageAllowed( model, widget ) ).to.be.false;
		} );

		it( 'should return false when the selection is inside other image', () => {
			model.schema.register( 'caption', {
				allowIn: 'image',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'caption', view: 'figcaption' } );
			setModelData( model, '<image><caption>[]</caption></image>' );
			expect( isImageAllowed( model, widget ) ).to.be.false;
		} );

		it( 'should return false when the selection is on other object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
			setModelData( model, '[<object></object>]' );

			expect( isImageAllowed( model, widget ) ).to.be.false;
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

			expect( isImageAllowed( model, widget ) ).to.be.true;
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

			expect( isImageAllowed( model, widget ) ).to.be.false;
		} );
	} );

	describe( 'insertImage()', () => {
		it( 'should insert image at selection position as other widgets', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			insertImage( model, widget );

			expect( getModelData( model ) ).to.equal( '[<image></image>]<paragraph>foo</paragraph>' );
		} );

		it( 'should insert image with given attributes', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			insertImage( model, widget, { src: 'bar' } );

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

			insertImage( model, widget );

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
			view.change( writer => {
				writer.insert( writer.createPositionAt( element, 0 ), writer.createContainerElement( 'div' ) );
			} );
			expect( getViewImgFromWidget( element ) ).to.equal( image );
		} );

		// figure
		//   div
		//     img
		it( 'returns the the img element from widget if the img is a child of another element', () => {
			view.change( writer => {
				const divElement = writer.createContainerElement( 'div' );

				writer.insert( writer.createPositionAt( element, 0 ), divElement );
				writer.move( writer.createRangeOn( image ), writer.createPositionAt( divElement, 0 ) );
			} )
;
			expect( getViewImgFromWidget( element ) ).to.equal( image );
		} );

		// figure
		//   div
		//     "Bar"
		//     img
		//   "Foo"
		it( 'does not throw an error if text node found', () => {
			view.change( writer => {
				const divElement = writer.createContainerElement( 'div' );

				writer.insert( writer.createPositionAt( element, 0 ), divElement );
				writer.insert( writer.createPositionAt( element, 0 ), writer.createText( 'Foo' ) );
				writer.insert( writer.createPositionAt( divElement, 0 ), writer.createText( 'Bar' ) );
				writer.move( writer.createRangeOn( image ), writer.createPositionAt( divElement, 1 ) );
			} );

			expect( getViewImgFromWidget( element ) ).to.equal( image );
		} );
	} );
} );
