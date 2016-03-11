/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditorUIView from '/ckeditor5/ui/editorui/editoruiview.js';
import Model from '/ckeditor5/ui/model.js';

describe( 'EditorUIView', () => {
	let editorUIView;

	beforeEach( () => {
		editorUIView = new EditorUIView( new Model() );

		return editorUIView.init();
	} );

	describe( 'constructor', () => {
		it( 'creates the body region', () => {
			const el = editorUIView.regions.get( 'body' ).element;

			expect( el.parentNode ).to.equal( document.body );
			expect( el.nextSibling ).to.be.null;
		} );
	} );

	describe( 'destroy', () => {
		it( 'removes the body region container', () => {
			const el = editorUIView.regions.get( 'body' ).element;

			editorUIView.destroy();

			expect( el.parentNode ).to.be.null;
		} );
	} );
} );
