/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: editable */

import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
import EditableUIView from '/ckeditor5/ui/editableui/editableuiview.js';
import Model from '/ckeditor5/ui/model.js';
import Locale from '/ckeditor5/utils/locale.js';

describe( 'EditableUIView', () => {
	let editable, view, editableElement, locale;

	beforeEach( () => {
		editable = new Model( {
			isReadOnly: false,
			isFocused: false,
			rootName: 'foo'
		} );
		locale = new Locale( 'en' );
		view = new EditableUIView( locale );
		editableElement = document.createElement( 'div' );

		return new EditableUI( editable, view ).init();
	} );

	describe( 'constructor', () => {
		it( 'renders element from template when no editableElement', () => {
			view = new EditableUIView( locale );
			view.init();

			expect( view.element ).to.equal( view.editableElement );
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
		} );

		it( 'accepts editableElement as an argument', () => {
			view = new EditableUIView( locale, editableElement );
			view.init();

			expect( view.element ).to.equal( editableElement );
			expect( view.element ).to.equal( view.editableElement );
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
		} );
	} );

	describe( 'View bindings', () => {
		describe( 'class', () => {
			it( 'has initial value set', () => {
				expect( view.element.classList.contains( 'ck-blurred' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-focused' ) ).to.be.false;
			} );

			it( 'reacts on editable.isFocused', () => {
				editable.isFocused = true;

				expect( view.element.classList.contains( 'ck-blurred' ) ).to.be.false;
				expect( view.element.classList.contains( 'ck-focused' ) ).to.be.true;
			} );
		} );

		describe( 'contenteditable', () => {
			it( 'has initial value set', () => {
				expect( view.element.getAttribute( 'contenteditable' ) ).to.equal( 'true' );
			} );

			it( 'reacts on editable.isReadOnly', () => {
				editable.isReadOnly = true;

				expect( view.element.hasAttribute( 'contenteditable' ) ).to.be.false;
			} );
		} );
	} );

	describe( 'destroy', () => {
		it( 'updates contentEditable property of editableElement', () => {
			view = new EditableUIView( locale, editableElement );

			return new EditableUI( editable, view ).init().then( () => {
				expect( view.editableElement.contentEditable ).to.equal( 'true' );

				view.destroy();

				expect( view.editableElement.contentEditable ).to.equal( 'false' );
			} );
		} );
	} );
} );
