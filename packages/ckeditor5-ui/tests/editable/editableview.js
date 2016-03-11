/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editable */

'use strict';

import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import EditableView from '/ckeditor5/ui/editable/editableview.js';
import Model from '/ckeditor5/ui/model.js';

describe( 'EditableView', () => {
	let model, view, editableElement;

	beforeEach( () => {
		model = new Model( { isEditable: true, isFocused: false } );
		view = new EditableView( model );
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

		it( 'sets the model.isFocused based on element#focus and element#blur events', () => {
			view.setEditableElement( editableElement );

			expect( model.isFocused ).to.equal( false );

			editableElement.dispatchEvent( new Event( 'focus' ) );

			expect( model.isFocused ).to.equal( true );

			editableElement.dispatchEvent( new Event( 'blur' ) );

			expect( model.isFocused ).to.equal( false );
		} );
	} );
} );
