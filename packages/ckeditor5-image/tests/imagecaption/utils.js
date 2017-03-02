/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import {
	captionElementCreator,
	isCaption,
	getCaptionFromImage,
	isInsideCaption,
	matchImageCaption,
	insertViewCaptionAndBind
} from '../../src/imagecaption/utils';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import Mapper from '@ckeditor/ckeditor5-engine/src/conversion/mapper';

describe( 'image captioning utils', () => {
	let element, document;

	beforeEach( () => {
		document = new ViewDocument();
		const creator = captionElementCreator( document );
		element = creator();
	} );

	describe( 'editableCaptionCreator', () => {
		it( 'should create figcatpion editable element', () => {
			expect( element ).to.be.instanceOf( ViewEditableElement );
			expect( element.name ).to.equal( 'figcaption' );
			expect( isCaption( element ) ).to.be.true;
		} );

		it( 'should be created in context of proper document', () => {
			expect( element.document ).to.equal( document );
		} );

		it( 'should add proper class when element is focused', () => {
			element.isFocused = true;
			expect( element.hasClass( 'focused' ) ).to.be.true;

			element.isFocused = false;
			expect( element.hasClass( 'focused' ) ).to.be.false;
		} );
	} );

	describe( 'isCaptionEditable', () => {
		it( 'should return true for elements created with creator', () => {
			expect( isCaption( element ) ).to.be.true;
		} );

		it( 'should return false for other elements', () => {
			const editable = new ViewEditableElement( 'figcaption', { contenteditable: true } ) ;
			editable.document = document;

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

	describe( 'isInsideCaption', () => {
		it( 'should return false if node has no parent', () => {
			const el = new ModelElement( 'test' );

			expect( isInsideCaption( el ) ).to.be.false;
		} );

		it( 'should return false if node\'s parent is not caption', () => {
			const el = new ModelElement( 'test' );
			new ModelElement( 'test', null, el );

			expect( isInsideCaption( el ) ).to.be.false;
		} );

		it( 'should return false if parent`s parent node is not defined', () => {
			const el = new ModelElement( 'test' );
			new ModelElement( 'caption', null, el );

			expect( isInsideCaption( el ) ).to.be.false;
		} );

		it( 'should return false if parent\'s parent node is not an image', () => {
			const el = new ModelElement( 'test' );
			const parent = new ModelElement( 'caption', null, el );
			new ModelElement( 'not-image', null, parent );

			expect( isInsideCaption( el ) ).to.be.false;
		} );

		it( 'should return true if node is placed inside image\'s caption', () => {
			const el = new ModelElement( 'test' );
			const parent = new ModelElement( 'caption', null, el );
			new ModelElement( 'image', null, parent );

			expect( isInsideCaption( el ) ).to.be.true;
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
			new ViewElement( 'div', null, element );

			expect( matchImageCaption( element ) ).to.be.null;
		} );

		it( 'should return null if parent has no image class', () => {
			const element = new ViewElement( 'figcaption' );
			new ViewElement( 'figure', null, element );

			expect( matchImageCaption( element ) ).to.be.null;
		} );

		it( 'should return object if element is a valid caption', () => {
			const element = new ViewElement( 'figcaption' );
			new ViewElement( 'figure', { class: 'image' }, element );

			expect( matchImageCaption( element ) ).to.deep.equal( { name: true } );
		} );
	} );

	describe( 'insertViewCaptionAndBind', () => {
		let viewCaption, modelCaption, viewImage, mapper;

		beforeEach( () => {
			viewCaption = new ViewContainerElement( 'figcaption' );
			modelCaption = new ModelElement( 'caption' );
			viewImage = new ViewContainerElement( 'figure', { class: 'image' } );
			mapper = new Mapper();
		} );

		it( 'should insert provided caption to provided image', () => {
			insertViewCaptionAndBind( viewCaption, modelCaption, viewImage, mapper );

			expect( viewImage.getChild( 0 ) ).to.equal( viewCaption );
		} );

		it( 'should insert provided caption at the end of provided image', () => {
			const dummyElement = new ViewElement( 'dummy' );
			viewImage.appendChildren( dummyElement );

			insertViewCaptionAndBind( viewCaption, modelCaption, viewImage, mapper );

			expect( viewImage.getChild( 1 ) ).to.equal( viewCaption );
		} );

		it( 'should bind view caption to model caption using provided mapper', () => {
			insertViewCaptionAndBind( viewCaption, modelCaption, viewImage, mapper );

			expect( mapper.toModelElement( viewCaption ) ).to.equal( modelCaption );
		} );
	} );
} );
