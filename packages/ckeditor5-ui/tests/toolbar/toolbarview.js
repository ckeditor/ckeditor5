/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, toolbar */

import ToolbarView from 'ckeditor5-ui/src/toolbar/toolbarview';
import ViewCollection from 'ckeditor5-ui/src/viewcollection';

describe( 'ToolbarView', () => {
	let locale, view;

	beforeEach( () => {
		locale = {};
		view = new ToolbarView( locale );

		return view.init();
	} );

	describe( 'constructor()', () => {
		it( 'should set view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'should create view#children collection', () => {
			expect( view.items ).to.be.instanceOf( ViewCollection );
		} );
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck-toolbar' ) ).to.true;
		} );
	} );
} );
