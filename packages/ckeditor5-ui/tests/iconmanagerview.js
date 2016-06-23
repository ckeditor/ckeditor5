/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

 /* bender-tags: ui, iconmanager */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import IconManager from '/ckeditor5/ui/iconmanager/iconmanager.js';
import IconManagerView from '/ckeditor5/ui/iconmanager/iconmanagerview.js';
import Model from '/ckeditor5/ui/model.js';

testUtils.createSinonSandbox();

describe( 'IconManagerView', () => {
	let model, view;

	beforeEach( () => {
		view = new IconManagerView();
		model = new Model( {
			sprite: 'foo'
		} );

		return new IconManager( model, view ).init();
	} );

	describe( 'constructor', () => {
		it( 'creates element from template', () => {
			expect( view.element.tagName ).to.be.equal( 'svg' );
			expect( view.element.getAttribute( 'class' ) ).to.be.equal( 'ck-icon-manager-sprite' );
		} );
	} );

	describe( 'init', () => {
		it( 'initializes the sprite', () => {
			view.init();

			expect( view.element.innerHTML ).to.be.equal( 'foo' );
		} );
	} );
} );
