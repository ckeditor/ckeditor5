/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import View from '@ckeditor/ckeditor5-engine/src/view/view';
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import {
	captionElementCreator,
	isCaption,
	getCaptionFromImage,
	matchImageCaption
} from '../../src/imagecaption/utils';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';

describe( 'image captioning utils', () => {
	let element, view, document;

	beforeEach( () => {
		view = new View();
		document = view.document;
		const creator = captionElementCreator( view, 'placeholder text' );

		view.change( writer => {
			element = creator( writer );
		} );
	} );

	describe( 'captionElementCreator', () => {
		it( 'should create figcatpion editable element', () => {
			expect( element ).to.be.instanceOf( ViewEditableElement );
			expect( element.name ).to.equal( 'figcaption' );
			expect( isCaption( element ) ).to.be.true;
		} );

		it( 'should attach placeholder', () => {
			expect( element.getAttribute( 'data-placeholder' ) ).to.equal( 'placeholder text' );
		} );
	} );

	describe( 'isCaptionEditable', () => {
		it( 'should return true for elements created with creator', () => {
			expect( isCaption( element ) ).to.be.true;
		} );

		it( 'should return false for other elements', () => {
			const editable = new ViewEditableElement( 'figcaption', { contenteditable: true } );
			editable._document = document;

			expect( isCaption( editable ) ).to.be.false;
		} );
	} );

	describe( 'getCaptionFromImage', () => {
		it( 'should return caption element from image element', () => {
			const dummy = new ModelElement( 'dummy' );
			const caption = new ModelElement( 'caption' );
			const image = new ModelElement( 'image', null, [ dummy, caption ] );

			expect( getCaptionFromImage( image ) ).to.equal( caption );
		} );

		it( 'should return null when caption element is not present', () => {
			const image = new ModelElement( 'image' );

			expect( getCaptionFromImage( image ) ).to.be.null;
		} );
	} );

	describe( 'matchImageCaption', () => {
		it( 'should return null for element that is not a figcaption', () => {
			const element = new ViewElement( 'div' );

			expect( matchImageCaption( element ) ).to.be.null;
		} );

		it( 'should return null if figcaption has no parent', () => {
			const element = new ViewElement( 'figcaption' );

			expect( matchImageCaption( element ) ).to.be.null;
		} );

		it( 'should return null if figcaption\'s parent is not a figure', () => {
			const element = new ViewElement( 'figcaption' );
			new ViewElement( 'div', null, element ); // eslint-disable-line no-new

			expect( matchImageCaption( element ) ).to.be.null;
		} );

		it( 'should return null if parent has no image class', () => {
			const element = new ViewElement( 'figcaption' );
			new ViewElement( 'figure', null, element ); // eslint-disable-line no-new

			expect( matchImageCaption( element ) ).to.be.null;
		} );

		it( 'should return object if element is a valid caption', () => {
			const element = new ViewElement( 'figcaption' );
			new ViewElement( 'figure', { class: 'image' }, element ); // eslint-disable-line no-new

			expect( matchImageCaption( element ) ).to.deep.equal( { name: true } );
		} );
	} );
} );
