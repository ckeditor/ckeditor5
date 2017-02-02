/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import InlineEditableUIView from '../../../src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

describe( 'InlineEditableUIView', () => {
	let view, editableElement, locale;

	beforeEach( () => {
		locale = new Locale( 'en' );
		editableElement = document.createElement( 'div' );

		return ( view = new InlineEditableUIView( locale ) ).init();
	} );

	describe( 'constructor()', () => {
		it( 'accepts locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'sets initial values of attributes', () => {
			expect( view.name ).to.be.null;
		} );

		it( 'accepts editableElement', () => {
			view = new InlineEditableUIView( locale, editableElement );

			expect( view.element ).to.equal( editableElement );
		} );

		it( 'creates view#element from template when no editableElement provided', () => {
			expect( view.template ).to.be.an( 'object' );
		} );
	} );

	describe( 'editableElement', () => {
		const ariaLabel = 'Rich Text Editor, foo';

		beforeEach( () => {
			view.name = 'foo';
		} );

		it( 'has proper accessibility role', () => {
			expect( view.element.attributes.getNamedItem( 'role' ).value ).to.equal( 'textbox' );
		} );

		it( 'has proper ARIA label', () => {
			expect( view.element.getAttribute( 'aria-label' ) ).to.equal( ariaLabel );
		} );

		it( 'has proper class name', () => {
			expect( view.element.classList.contains( 'ck-editor__editable' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-editor__editable_inline' ) ).to.be.true;
		} );
	} );
} );
