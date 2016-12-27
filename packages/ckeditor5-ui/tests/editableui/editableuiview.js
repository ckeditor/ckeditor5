/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: editable */

import EditableUIView from 'ckeditor5-ui/src/editableui/editableuiview';
import Locale from 'ckeditor5-utils/src/locale';

describe( 'EditableUIView', () => {
	let view, editableElement, locale;

	beforeEach( () => {
		locale = new Locale( 'en' );
		editableElement = document.createElement( 'div' );

		return ( view = new EditableUIView( locale ) ).init();
	} );

	describe( 'constructor()', () => {
		it( 'sets initial values of attributes', () => {
			expect( view.isReadOnly ).to.be.false;
			expect( view.isFocused ).to.be.false;
		} );

		it( 'renders element from template when no editableElement', () => {
			view = new EditableUIView( locale );

			return view.init().then( () => {
				expect( view.element ).to.equal( view.editableElement );
				expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
			} );
		} );

		it( 'accepts editableElement as an argument', () => {
			view = new EditableUIView( locale, editableElement );

			return view.init().then( () => {
				expect( view.element ).to.equal( editableElement );
				expect( view.element ).to.equal( view.editableElement );
				expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
			} );
		} );
	} );

	describe( 'View bindings', () => {
		describe( 'class', () => {
			it( 'reacts on view#isFocused', () => {
				view.isFocused = true;

				expect( view.element.classList.contains( 'ck-focused' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-blurred' ) ).to.be.false;

				view.isFocused = false;
				expect( view.element.classList.contains( 'ck-focused' ) ).to.be.false;
				expect( view.element.classList.contains( 'ck-blurred' ) ).to.be.true;
			} );
		} );

		describe( 'contenteditable', () => {
			it( 'reacts on view#isReadOnly', () => {
				view.isReadOnly = true;
				expect( view.element.hasAttribute( 'contenteditable' ) ).to.be.false;

				view.isReadOnly = false;
				expect( view.element.hasAttribute( 'contenteditable' ) ).to.be.true;
			} );
		} );
	} );

	describe( 'destroy', () => {
		it( 'updates contentEditable property of editableElement', () => {
			return new EditableUIView( locale, editableElement ).init().then( () => {
				expect( view.editableElement.contentEditable ).to.equal( 'true' );
			} )
			.then( () => view.destroy() )
			.then( () => {
				expect( view.editableElement.contentEditable ).to.equal( 'false' );
			} );
		} );
	} );
} );
