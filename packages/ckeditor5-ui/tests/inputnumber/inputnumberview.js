/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import InputNumberView from '../../src/inputnumber/inputnumberview.js';
import InputView from '../../src/input/inputview.js';

describe( 'InputNumberView', () => {
	let view;

	beforeEach( () => {
		view = new InputNumberView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should extend InputView', () => {
			expect( view ).to.be.instanceOf( InputView );
		} );

		it( 'should create element from template', () => {
			expect( view.element.getAttribute( 'type' ) ).to.equal( 'number' );
			expect( view.element.type ).to.equal( 'number' );
			expect( view.element.classList.contains( 'ck-input-number' ) ).to.be.true;

			expect( view.element.getAttribute( 'min' ) ).to.be.null;
			expect( view.element.getAttribute( 'max' ) ).to.be.null;
			expect( view.element.getAttribute( 'step' ) ).to.be.null;
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'min attribute', () => {
			it( 'should respond to view#min', () => {
				expect( view.element.getAttribute( 'min' ) ).to.be.null;

				view.min = 20;

				expect( view.element.getAttribute( 'min' ) ).to.equal( '20' );
			} );
		} );

		describe( 'max attribute', () => {
			it( 'should respond to view#max', () => {
				expect( view.element.getAttribute( 'max' ) ).to.be.null;

				view.max = 20;

				expect( view.element.getAttribute( 'max' ) ).to.equal( '20' );
			} );
		} );

		describe( 'step attribute', () => {
			it( 'should respond to view#step', () => {
				expect( view.element.getAttribute( 'step' ) ).to.be.null;

				view.step = 20;

				expect( view.element.getAttribute( 'step' ) ).to.equal( '20' );
			} );
		} );
	} );
} );
