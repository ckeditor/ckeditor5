/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, toolbar */

'use strict';

import Editor from '/ckeditor5/editor/editor.js';
import Model from '/ckeditor5/ui/model.js';
import View from '/ckeditor5/ui/view.js';
import StickyToolbar from '/ckeditor5/ui/bindings/toolbar.js';

describe( 'StickyToolbar', () => {
	let toolbar, model, editor;

	beforeEach( () => {
		editor = new Editor();
		model = new Model( {
			isActive: false
		} );
		toolbar = new StickyToolbar( model, new View(), editor );
	} );

	describe( 'constructor', () => {
		it( 'sets all the properties', () => {
			expect( toolbar ).to.have.property( 'editor', editor );
		} );
	} );
} );
