/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

 /* bender-tags: ui, iconmanager */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import IconManagerView from '/ckeditor5/ui/iconmanagerview.js';
import Model from '/ckeditor5/ui/model.js';

testUtils.createSinonSandbox();

describe( 'IconManagerView', () => {
	let view;

	beforeEach( () => {
		view = new IconManagerView( new Model( {
			sprite: 'foo'
		} ) );
	} );

	describe( 'init', () => {
		it( 'calls _setupSprite', () => {
			const spy = testUtils.sinon.spy( view, '_setupSprite' );

			view.init();
			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( '_setupSprite', () => {
		it( 'initializes the sprite', () => {
			view._setupSprite();

			const el = view.element;
			const svg = view.element.firstChild;

			expect( el.tagName ).to.be.equal( 'DIV' );
			expect( el.classList.item( 0 ) ).to.be.equal( 'ck-icon-manager' );
			expect( svg.tagName ).to.be.equal( 'svg' );
			expect( svg.innerHTML ).to.be.equal( 'foo' );
			expect( svg.classList.item( 0 ) ).to.be.equal( 'ck-icon-manager-sprite' );
		} );
	} );
} );
