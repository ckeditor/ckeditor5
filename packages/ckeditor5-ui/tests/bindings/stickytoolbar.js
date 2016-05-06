/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, stickytoolbar */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Editable from '/ckeditor5/editable.js';
import Model from '/ckeditor5/ui/model.js';
import View from '/ckeditor5/ui/view.js';
import StickyToolbar from '/ckeditor5/ui/bindings/stickytoolbar.js';

describe( 'StickyToolbar', () => {
	let toolbar, view, model, editor, editable;

	beforeEach( () => {
		editor = new Editor();
		editable = new Editable( editor, 'foo' );
		model = new Model();
		view = new View( model );
		toolbar = new StickyToolbar( model, view, editor );
	} );

	describe( 'constructor', () => {
		it( 'binds model#isActive to editor.editables#current', () => {
			expect( model.isActive ).to.be.false;

			editor.editables.current = editable;
			expect( model.isActive ).to.be.true;

			editor.editables.current = null;
			expect( model.isActive ).to.be.false;
		} );
	} );
} );
