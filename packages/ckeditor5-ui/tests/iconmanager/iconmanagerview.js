/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, iconmanager */

import testUtils from 'ckeditor5-core/tests/_utils/utils';
import IconManagerView from 'ckeditor5-ui/src/iconmanager/iconmanagerview';

testUtils.createSinonSandbox();

describe( 'IconManagerView', () => {
	let view, sprite, icons;

	beforeEach( () => {
		sprite = '<symbol><title>foo</title></symbol>';
		icons = [ 'foo' ];
		view = new IconManagerView( sprite, icons );

		return view.init();
	} );

	describe( 'constructor()', () => {
		it( 'sets initial view attribute values', () => {
			expect( view.sprite ).to.equal( sprite );
			expect( view.icons ).to.equal( icons );
		} );

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
