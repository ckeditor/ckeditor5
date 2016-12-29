/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, input */

import InputTextView from 'ckeditor5-ui/src/inputtext/inputtextview';

describe( 'InputTextView', () => {
	let view;

	beforeEach( () => {
		view = new InputTextView();

		view.init();
	} );

	describe( 'constructor()', () => {
		it( 'should creates element from template', () => {
			expect( view.element.tagName ).to.equal( 'INPUT' );
			expect( view.element.type ).to.equal( 'text' );
			expect( view.element.classList.contains( 'ck-input' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-input-text' ) ).to.be.true;
		} );
	} );

	describe( 'DOM bindings', () => {
		beforeEach( () => {
			view.value = 'foo';
			view.id = 'bar';
		} );

		describe( 'value', () => {
			it( 'should react on view#value', () => {
				expect( view.element.value ).to.equal( 'foo' );

				view.value = 'baz';

				expect( view.element.value ).to.equal( 'baz' );
			} );

			it( 'should set to empty string when using `falsy` values', () => {
				[ undefined, false, null ].forEach( ( value ) => {
					view.value = value;

					expect( view.element.value ).to.equal( '' );
				} );
			} );
		} );

		describe( 'id', () => {
			it( 'should react on view#id', () => {
				expect( view.element.id ).to.equal( 'bar' );

				view.id = 'baz';

				expect( view.element.id ).to.equal( 'baz' );
			} );
		} );
	} );

	describe( 'select', () => {
		it( 'should select input value', () => {
			const selectSpy = sinon.spy( view.element, 'select' );

			view.select();

			expect( selectSpy.calledOnce ).to.true;

			selectSpy.restore();
		} );
	} );
} );
