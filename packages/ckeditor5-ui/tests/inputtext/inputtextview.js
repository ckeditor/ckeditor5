/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import InputTextView from '../../src/inputtext/inputtextview';

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
				[ undefined, false, null ].forEach( value => {
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

		describe( 'placeholder', () => {
			it( 'should react on view#placeholder', () => {
				expect( view.element.placeholder ).to.equal( '' );

				view.placeholder = 'baz';

				expect( view.element.placeholder ).to.equal( 'baz' );
			} );
		} );

		describe( 'isReadOnly', () => {
			it( 'should react on view#isReadOnly', () => {
				expect( view.element.readOnly ).to.false;

				view.isReadOnly = true;

				expect( view.element.readOnly ).to.true;
			} );
		} );
	} );

	describe( 'select()', () => {
		it( 'should select input value', () => {
			const selectSpy = sinon.spy( view.element, 'select' );

			view.select();

			expect( selectSpy.calledOnce ).to.true;

			selectSpy.restore();
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the input in DOM', () => {
			const spy = sinon.spy( view.element, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
