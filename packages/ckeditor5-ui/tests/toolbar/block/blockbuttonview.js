/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import BlockButtonView from '../../../src/toolbar/block/blockbuttonview';

describe( 'BlockButtonView', () => {
	let view;

	beforeEach( () => {
		view = new BlockButtonView();

		view.render();
	} );

	it( 'should be not visible on init', () => {
		expect( view.isVisible ).to.be.false;
	} );

	it( 'should create element from template', () => {
		expect( view.element.classList.contains( 'ck-block-toolbar-button' ) ).to.be.true;
	} );

	it( 'should be initialized as toggleable button', () => {
		expect( view.isToggleable ).to.be.true;
	} );

	describe( 'DOM binding', () => {
		it( 'should react on `view#top` change', () => {
			view.top = 0;

			expect( view.element.style.top ).to.equal( '0px' );

			view.top = 10;

			expect( view.element.style.top ).to.equal( '10px' );
		} );

		it( 'should react on `view#left` change', () => {
			view.left = 0;

			expect( view.element.style.left ).to.equal( '0px' );

			view.left = 10;

			expect( view.element.style.left ).to.equal( '10px' );
		} );
	} );
} );
