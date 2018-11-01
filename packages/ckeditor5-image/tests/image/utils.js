/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewDocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';
import ViewDowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import { toImageWidget, isImageWidget, isImageWidgetSelected, isImage } from '../../src/image/utils';
import { isWidget, getLabel } from '@ckeditor/ckeditor5-widget/src/utils';

describe( 'image widget utils', () => {
	let element, image, writer;

	beforeEach( () => {
		writer = new ViewDowncastWriter( new ViewDocument() );
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

	describe( 'isImageWidgetSelected()', () => {
		let frag;

		it( 'should return true when image widget is the only element in the selection', () => {
			// We need to create a container for the element to be able to create a Range on this element.
			frag = new ViewDocumentFragment( [ element ] );

			const selection = writer.createSelection( element, 'on' );

			expect( isImageWidgetSelected( selection ) ).to.be.true;
		} );

		it( 'should return false when non-widgetized elements is the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			// We need to create a container for the element to be able to create a Range on this element.
			frag = new ViewDocumentFragment( [ notWidgetizedElement ] );

			const selection = writer.createSelection( notWidgetizedElement, 'on' );

			expect( isImageWidgetSelected( selection ) ).to.be.false;
		} );

		it( 'should return false when widget element is not the only element in the selection', () => {
			const notWidgetizedElement = writer.createContainerElement( 'p' );

			frag = new ViewDocumentFragment( [ element, notWidgetizedElement ] );

			const selection = writer.createSelection( writer.createRangeIn( frag ) );

			expect( isImageWidgetSelected( selection ) ).to.be.false;
		} );
	} );

	describe( 'isImage', () => {
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
} );
