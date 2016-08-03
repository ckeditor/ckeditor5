/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, toolbar */

import Editor from '/ckeditor5/core/editor/editor.js';
import Model from '/ckeditor5/ui/model.js';
import View from '/ckeditor5/ui/view.js';
import Toolbar from '/ckeditor5/ui/bindings/toolbar.js';

describe( 'Toolbar', () => {
	let toolbar, model, editor;

	beforeEach( () => {
		editor = new Editor();
		model = new Model( {
			isActive: false
		} );
		toolbar = new Toolbar( model, new View(), editor );
	} );

	describe( 'constructor', () => {
		it( 'sets all the properties', () => {
			expect( toolbar ).to.have.property( 'editor', editor );
		} );
	} );
} );
