/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editable */

'use strict';

import InlineEditableUIView from '/ckeditor5/ui/editableui/inline/inlineeditableuiview.js';
import Model from '/ckeditor5/ui/model.js';
import Locale from '/ckeditor5/utils/locale.js';

describe( 'InlineEditableUIView', () => {
	let model, view, editableElement, locale;

	beforeEach( () => {
		model = new Model( { isEditable: true, isFocused: false, name: 'foo' } );
		locale = new Locale( 'en' );
		view = new InlineEditableUIView( model, locale );
		editableElement = document.createElement( 'div' );

		return view.init();
	} );

	describe( 'constructor', () => {
		it( 'accepts model', () => {
			expect( view.model ).to.equal( model );
		} );

		it( 'accepts locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'accepts editableElement', () => {
			view = new InlineEditableUIView( model, locale, editableElement );

			expect( view.element ).to.equal( editableElement );
		} );

		it( 'creates view#element from template when no editableElement provided', () => {
			expect( view.template ).to.be.an( 'object' );
		} );
	} );

	describe( 'editableElement', () => {
		const ariaLabel = 'Rich Text Editor, foo';

		it( 'has proper accessibility role', () => {
			expect( view.element.attributes.getNamedItem( 'role' ).value ).to.equal( 'textbox' );
		} );

		it( 'has proper ARIA label', () => {
			expect( view.element.getAttribute( 'aria-label' ) ).to.equal( ariaLabel );
		} );

		it( 'has proper title', () => {
			expect( view.element.getAttribute( 'title' ) ).to.equal( ariaLabel );
		} );

		it( 'has proper class name', () => {
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-editor__editable_inline' ) ).to.be.true;
		} );
	} );
} );
