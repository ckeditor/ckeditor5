/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, iconmanager */

import testUtils from '/tests/core/_utils/utils.js';
import IconManager from '/ckeditor5/ui/iconmanager/iconmanager.js';
import IconManagerView from '/ckeditor5/ui/iconmanager/iconmanagerview.js';
import Model from '/ckeditor5/ui/model.js';

testUtils.createSinonSandbox();

describe( 'IconManagerView', () => {
	let model, view;

	beforeEach( () => {
		view = new IconManagerView();
		model = new Model( {
			sprite: '<symbol><title>foo</title></symbol>'
		} );

		return new IconManager( model, view ).init();
	} );

	describe( 'constructor', () => {
		it( 'creates element from template', () => {
			expect( view.element.tagName ).to.equal( 'svg' );
			expect( view.element.getAttribute( 'class' ) ).to.equal( 'ck-icon-manager__sprite' );
		} );
	} );

	describe( 'init', () => {
		it( 'initializes the sprite', () => {
			expect( view.element.innerHTML ).to.equal( '<symbol><title>foo</title></symbol>' );
		} );
	} );
} );
