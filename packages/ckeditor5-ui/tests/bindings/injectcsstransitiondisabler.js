/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import injectCssTransitionDisabler from '../../src/bindings/injectcsstransitiondisabler';
import View from '../../src/view';

describe( 'injectCssTransitionDisabler()', () => {
	let view;

	class TestView extends View {
		constructor( ...args ) {
			super( ...args );

			this.setTemplate( {
				tag: 'div'
			} );

			injectCssTransitionDisabler( this );
		}
	}

	beforeEach( () => {
		view = new TestView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should create a protected observable property for class binding', () => {
		expect( view._isCssTransitionsDisabled ).to.be.false;
	} );

	it( 'should not alter the CSS class of the view until blocking is enabled', () => {
		expect( view.element.classList ).to.be.empty;
	} );

	describe( 'disableCssTransitions() method', () => {
		it( 'should belong to the view', () => {
			expect( view.disableCssTransitions ).to.be.a( 'function' );
		} );

		it( 'should set the proper CSS class when called', () => {
			view.disableCssTransitions();

			expect( view.element.classList.contains( 'ck-transitions-disabled' ) ).to.be.true;
		} );
	} );

	describe( 'enableCssTransitions() method', () => {
		it( 'should belong to the view', () => {
			expect( view.enableCssTransitions ).to.be.a( 'function' );
		} );

		it( 'should remove the proper CSS class when called', () => {
			view.disableCssTransitions();
			expect( view.element.classList.contains( 'ck-transitions-disabled' ) ).to.be.true;

			view.enableCssTransitions();
			expect( view.element.classList.contains( 'ck-transitions-disabled' ) ).to.be.false;
		} );
	} );
} );
