/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editable */

'use strict';

import Editor from '/ckeditor5/core/editor.js';
import Editable from '/ckeditor5/core/editable/editable.js';
import Model from '/ckeditor5/core/ui/model.js';
import coreTestUtils from '/tests/core/_utils/utils.js';

describe( 'Editable', () => {
	let editable, editor;

	beforeEach( () => {
		editor = new Editor();
		editable = new Editable( editor );
	} );

	describe( 'constructor', () => {
		it( 'sets all the properties', () => {
			expect( editable ).to.have.property( 'editor', editor );
			expect( editable ).to.have.property( 'isFocused', false );
			expect( editable ).to.have.property( 'isEditable', true );
		} );
	} );

	describe( 'viewModel', () => {
		it( 'returns a model instance', () => {
			expect( editable.viewModel ).to.be.an.instanceof( Model );
		} );

		it( 'always returns the same instance', () => {
			expect( editable.viewModel ).to.equal( editable.viewModel );
		} );

		it( 'constains editable attributes', () => {
			expect( editable.viewModel ).to.have.property( 'isEditable', true );
			expect( editable.viewModel ).to.have.property( 'isFocused', false );
		} );

		it( 'binds this.isFocused to editable', () => {
			coreTestUtils.assertBinding(
				editable,
				{ isFocused: false },
				[
					[ editable.viewModel, { isFocused: true } ]
				],
				{ isFocused: true }
			);
		} );

		it( 'binds editable.isEditable to itself', () => {
			coreTestUtils.assertBinding(
				editable.viewModel,
				{ isEditable: true },
				[
					[ editable, { isEditable: false } ]
				],
				{ isEditable: false }
			);
		} );
	} );

	// These are temporary implementation, so tests do nothing beside ensuring 100% CC.
	describe( 'getData() and setData()', () => {
		it( 'exist', () => {
			editable.view = {
				editableElement: document.createElement( 'div' )
			};

			editable.getData();
			editable.setData();
		} );
	} );
} );
