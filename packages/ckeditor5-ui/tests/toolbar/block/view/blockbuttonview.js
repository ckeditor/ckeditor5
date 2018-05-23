/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
 */

import BlockButtonView from '../../../../src/toolbar/block/view/blockbuttonview';

describe( 'BlockButtonView', () => {
	let view;

	beforeEach( () => {
		view = new BlockButtonView();

		view.render();
	} );

	it( 'should be not visible on init', () => {
		expect( view.isVisible ).to.false;
	} );

	it( 'should create element from template', () => {
		expect( view.element.classList.contains( 'ck-block-toolbar-button' ) ).to.true;
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
