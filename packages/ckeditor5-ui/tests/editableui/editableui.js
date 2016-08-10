/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: editable */

import StandardEditor from '/ckeditor5/core/editor/standardeditor.js';
import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
import EditableUIView from '/ckeditor5/ui/editableui/editableuiview.js';
import testUtils from '/tests/utils/_utils/utils.js';

describe( 'EditableUI', () => {
	let editable, editableUI, editableUIView, editor;

	beforeEach( () => {
		editor = new StandardEditor();
		editable = editor.editing.view.createRoot( document.createElement( 'div' ) );
		editableUIView = new EditableUIView( editor.locale );
		editableUI = new EditableUI( editable, editableUIView, editor );
	} );

	describe( 'constructor', () => {
		it( 'sets all properties', () => {
			expect( editableUI.editor ).to.equal( editor );
		} );

		it( 'binds editableUIView#model attributes to the editable', () => {
			it( 'binds isFocused to editable.isFocused', () => {
				testUtils.assertBinding(
					editableUIView.model,
					{ isFocused: false },
					[
						[ editable, { isFocused: true } ]
					],
					{ isFocused: true }
				);
			} );

			it( 'binds isReadOnly to editable.isReadOnly', () => {
				testUtils.assertBinding(
					editableUIView.model,
					{ isReadOnly: false },
					[
						[ editable, { isReadOnly: true } ]
					],
					{ isReadOnly: true }
				);
			} );
		} );

		it( 'sets editableUIView.model#name to editable#rootName', () => {
			expect( editableUIView.model.name ).to.equal( editable.rootName );
		} );
	} );
} );
