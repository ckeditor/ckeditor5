/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SpinnerView from '../../src/spinner/spinnerview';

describe( 'SpinnerView', () => {
	let view;

	beforeEach( () => {
		view = new SpinnerView();
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'sets #isVisible', () => {
			expect( view.isVisible ).to.equal( false );
		} );

		it( 'creates element from template', () => {
			expect( view.element.tagName ).to.equal( 'SPAN' );
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-spinner-container' ) ).to.be.true;

			expect( view.element.children[ 0 ].tagName ).to.equal( 'SPAN' );
			expect( view.element.children[ 0 ].classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.children[ 0 ].classList.contains( 'ck-spinner' ) ).to.be.true;
		} );
	} );

	describe( 'bindings', () => {
		it( 'should react to changes in view#isVisible', () => {
			view.isVisible = true;

			expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.false;

			view.isVisible = false;

			expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.true;
		} );
	} );
} );

