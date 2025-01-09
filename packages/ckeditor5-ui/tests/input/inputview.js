/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import InputView from '../../src/input/inputview.js';

describe( 'InputView', () => {
	let view;

	beforeEach( () => {
		view = new InputView();

		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'INPUT' );
			expect( view.element.type ).to.equal( 'text' );
			expect( view.element.getAttribute( 'type' ) ).to.be.null;
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-input' ) ).to.be.true;
		} );

		it( 'should set the #inputMode observable property', () => {
			expect( view.inputMode ).to.equal( 'text' );
		} );
	} );

	describe( 'DOM bindings', () => {
		beforeEach( () => {
			view.value = 'foo';
			view.id = 'bar';
		} );

		describe( 'inputmode attribute', () => {
			it( 'should react on view#inputMode', () => {
				expect( view.element.getAttribute( 'inputmode' ) ).to.equal( 'text' );

				view.inputMode = 'numeric';

				expect( view.element.getAttribute( 'inputmode' ) ).to.equal( 'numeric' );
			} );
		} );
	} );
} );
