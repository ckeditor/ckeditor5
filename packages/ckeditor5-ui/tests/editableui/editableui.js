/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editable */

'use strict';

import StandardEditor from '/ckeditor5/editor/standardeditor.js';
import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
import Model from '/ckeditor5/ui/model.js';
import testUtils from '/tests/utils/_utils/utils.js';

describe( 'EditableUI', () => {
	let editable, editableUI, editor;

	beforeEach( () => {
		editor = new StandardEditor();
		editable = editor.editing.view.createRoot( document.createElement( 'div' ) );
		editableUI = new EditableUI( editor, editable );
	} );

	describe( 'constructor', () => {
		it( 'sets all properties', () => {
			expect( editableUI.editor ).to.equal( editor );
			expect( editableUI.viewModel ).to.be.instanceof( Model );
		} );
	} );

	describe( 'viewModel', () => {
		it( 'constains observable attributes', () => {
			expect( editableUI.viewModel ).to.have.property( 'isReadOnly', false );
			expect( editableUI.viewModel ).to.have.property( 'isFocused', false );
		} );

		it( 'binds isFocused to editable.isFocused', () => {
			testUtils.assertBinding(
				editableUI.viewModel,
				{ isFocused: false },
				[
					[ editable, { isFocused: true } ]
				],
				{ isFocused: true }
			);
		} );

		it( 'binds isReadOnly to editable.isReadOnly', () => {
			testUtils.assertBinding(
				editableUI.viewModel,
				{ isReadOnly: false },
				[
					[ editable, { isReadOnly: true } ]
				],
				{ isReadOnly: true }
			);
		} );
	} );
} );
