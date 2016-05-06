/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editable */

'use strict';

import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import EditableUIView from '/ckeditor5/ui/editableui/editableuiview.js';
import Model from '/ckeditor5/ui/model.js';
import Locale from '/ckeditor5/utils/locale.js';

describe( 'EditableUIView', () => {
	let model, view, editableElement, locale;

	beforeEach( () => {
		model = new Model( { isEditable: true, isFocused: false } );
		locale = new Locale( 'en' );
		view = new EditableUIView( model ,locale );
		editableElement = document.createElement( 'div' );

		return view.init();
	} );

	describe( 'setEditableElement', () => {
		it( 'sets the editableElement property', () => {
			view.setEditableElement( editableElement );

			expect( view ).to.have.property( 'editableElement', editableElement );
		} );

		it( 'throws when trying to use it twice', () => {
			view.setEditableElement( editableElement );

			expect( view ).to.have.property( 'editableElement', editableElement );

			expect( () => {
				view.setEditableElement( editableElement );
			} ).to.throw( CKEditorError, /^editableview-cannot-override-editableelement/ );
		} );

		it( 'sets the contentEditable attribute to model.isEditable', () => {
			view.setEditableElement( editableElement );

			expect( editableElement.contentEditable ).to.equal( 'true' );

			model.isEditable = false;

			expect( editableElement.contentEditable ).to.equal( 'false' );
		} );

		it( 'sets the contentEditable attribute to model.isEditable', () => {
			view.setEditableElement( editableElement );

			expect( editableElement.classList.contains( 'ck-blurred' ) ).to.be.true;

			model.isFocused = true;

			expect( editableElement.classList.contains( 'ck-focused' ) ).to.be.true;
		} );

		it( 'sets proper accessibility role on the editableElement', () => {
			view.setEditableElement( editableElement );

			expect( editableElement.attributes.getNamedItem( 'role' ).value ).to.equal( 'textbox' );
		} );

		it( 'sets proper ARIA label on the editableElement', () => {
			view.setEditableElement( editableElement );

			expect( editableElement.attributes.getNamedItem( 'aria-label' ).value ).to.be.a( 'string' );
		} );

		it( 'sets proper title on the editableElement', () => {
			view.setEditableElement( editableElement );

			expect( editableElement.attributes.getNamedItem( 'title' ).value ).to.be.a( 'string' );
		} );

		it( 'sets proper class name of the editableElement', () => {
			view.setEditableElement( editableElement );

			expect( editableElement.classList.contains( 'ck-editor__editable' ) ).to.be.true;
		} );
	} );
} );
