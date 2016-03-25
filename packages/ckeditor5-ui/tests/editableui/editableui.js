/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editable */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Editable from '/ckeditor5/editable.js';
import EditableUI from '/ckeditor5/ui/editableui/editableui.js';
import Model from '/ckeditor5/ui/model.js';
import testUtils from '/tests/utils/_utils/utils.js';

describe( 'EditableUI', () => {
	let editable, editableUI, editor;

	beforeEach( () => {
		editor = new Editor();
		editable = new Editable( editor, 'foo' );
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
			expect( editableUI.viewModel ).to.have.property( 'isEditable', true );
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

		it( 'binds isEditable to editable.isEditable', () => {
			testUtils.assertBinding(
				editableUI.viewModel,
				{ isEditable: true },
				[
					[ editable, { isEditable: false } ]
				],
				{ isEditable: false }
			);
		} );
	} );
} );
