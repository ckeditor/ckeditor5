/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import LabelView from '../../src/label/labelview.js';

describe( 'LabelView', () => {
	let view;

	beforeEach( () => {
		view = new LabelView();

		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'LABEL' );
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-label' ) ).to.be.true;
		} );

		it( 'should define the #id', () => {
			expect( view.id ).to.match( /^ck-editor__label_.+/ );
		} );

		it( 'should assign an #id to the #element attribute', () => {
			expect( view.element.id ).to.equal( view.id );
			expect( view.element.id ).to.match( /^ck-editor__label_.+/ );
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
