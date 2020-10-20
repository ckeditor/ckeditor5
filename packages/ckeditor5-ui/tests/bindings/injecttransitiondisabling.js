/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import injectCSSTransitionDisabling from '../../src/bindings/injecttransitiondisabling';
import View from '../../src/view';

describe( 'injectCSSTransitionDisabling()', () => {
	let view;

	class TestView extends View {
		constructor( ...args ) {
			super( ...args );

			this.setTemplate( {
				tag: 'div'
			} );

			injectCSSTransitionDisabling( this );
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
		expect( view._isCSSTransitionsDisabled ).to.be.false;
	} );

	it( 'should not alter the CSS class of the view until blocking is enabled', () => {
		expect( view.element.classList ).to.be.empty;
	} );

	describe( 'disableCSSTransitions() method', () => {
		it( 'should belong to the view', () => {
			expect( view.disableCSSTransitions ).to.be.a( 'function' );
		} );

		it( 'should set the proper CSS class when called', () => {
			view.disableCSSTransitions();

			expect( view.element.classList.contains( 'ck-transitions-disabled' ) ).to.be.true;
		} );
	} );

	describe( 'enableCSSTransitions() method', () => {
		it( 'should belong to the view', () => {
			expect( view.enableCSSTransitions ).to.be.a( 'function' );
		} );

		it( 'should remove the proper CSS class when called', () => {
			view.disableCSSTransitions();
			expect( view.element.classList.contains( 'ck-transitions-disabled' ) ).to.be.true;

			view.enableCSSTransitions();
			expect( view.element.classList.contains( 'ck-transitions-disabled' ) ).to.be.false;
		} );
	} );
} );
