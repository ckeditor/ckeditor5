/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, iconmanager */

import Model from '/ckeditor5/ui/model.js';
import IconManager from '/ckeditor5/ui/iconmanager/iconmanager.js';
import IconManagerView from '/ckeditor5/ui/iconmanager/iconmanagerview.js';

describe( 'IconManager', () => {
	let model, view;

	beforeEach( () => {
		view = new IconManagerView();
		model = new Model( {
			sprite: 'foo',
			icons: [ 'bar' ]
		} );

		return new IconManager( model, view ).init();
	} );

	describe( 'constructor', () => {
		it( 'binds view#model attributes to the IconManager#model', () => {
			expect( view.model.sprite ).to.equal( model.sprite );
		} );
	} );
} );
