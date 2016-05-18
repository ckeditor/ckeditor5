/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editable */

'use strict';

import EditableUIView from '/ckeditor5/ui/editableui/editableuiview.js';
import Model from '/ckeditor5/ui/model.js';
import Locale from '/ckeditor5/utils/locale.js';

describe( 'EditableUIView', () => {
	let model, view, editableElement, locale;

	beforeEach( () => {
		model = new Model( { isEditable: true, isFocused: false } );
		locale = new Locale( 'en' );
		view = new EditableUIView( model, locale );
		editableElement = document.createElement( 'div' );

		view.init();
	} );

	describe( 'constructor', () => {
		it( 'renders element from template when no editableElement', () => {
			view = new EditableUIView( model, locale );
			view.init();

			expect( view.element ).to.equal( view.editableElement );
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
		} );

		it( 'accepts editableElement as an argument', () => {
			view = new EditableUIView( model, locale, editableElement );
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

			it( 'reacts on model.isFocused', () => {
				model.isFocused = true;

				expect( view.element.classList.contains( 'ck-blurred' ) ).to.be.false;
				expect( view.element.classList.contains( 'ck-focused' ) ).to.be.true;
			} );
		} );

		describe( 'contenteditable', () => {
			it( 'has initial value set', () => {
				expect( view.element.attributes.getNamedItem( 'contenteditable' ).value ).to.equal( 'true' );
			} );

			it( 'reacts on model.isEditable', () => {
				model.isEditable = false;

				expect( view.element.attributes.getNamedItem( 'contenteditable' ).value ).to.equal( 'false' );
			} );
		} );
	} );

	describe( 'destroy', () => {
		it( 'updates contentEditable property of editableElement', () => {
			view = new EditableUIView( model, locale, editableElement );
			view.init();

			expect( view.editableElement.contentEditable ).to.equal( 'true' );

			view.destroy();

			expect( view.editableElement.contentEditable ).to.equal( 'false' );
		} );
	} );
} );
