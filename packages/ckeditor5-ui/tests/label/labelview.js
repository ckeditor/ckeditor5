/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import LabelView from '../../src/label/labelview';

describe( 'LabelView', () => {
	let view;

	beforeEach( () => {
		view = new LabelView();

		view.init();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'LABEL' );
			expect( view.element.classList.contains( 'ck-label' ) ).to.be.true;
		} );
	} );

	describe( 'DOM bindings', () => {
		beforeEach( () => {
			view.text = 'foo';
			view.for = 'bar';
		} );

		describe( 'text content', () => {
			it( 'should react on view#text', () => {
				expect( view.element.textContent ).to.equal( 'foo' );

				view.text = 'baz';

				expect( view.element.textContent ).to.equal( 'baz' );
			} );
		} );

		describe( 'for attribute', () => {
			it( 'should react on view#for', () => {
				expect( view.element.getAttribute( 'for' ) ).to.equal( 'bar' );

				view.for = 'baz';

				expect( view.element.getAttribute( 'for' ) ).to.equal( 'baz' );
			} );
		} );
	} );
} );
