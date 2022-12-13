/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global Event */

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import InputView from '../../src/input/inputview';

describe( 'InputView', () => {
	let view, ariaDescribedById;

	beforeEach( () => {
		ariaDescribedById = 'ck-error-1234567890';
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

		it( 'should set the #isFocused observable property', () => {
			expect( view.isFocused ).to.be.false;
		} );

		it( 'should set the #isEmpty observable property', () => {
			expect( view.isEmpty ).to.be.true;
		} );

		it( 'should set the #hasError observable property', () => {
			expect( view.hasError ).to.be.false;
		} );

		it( 'should set the #isReadOnly observable property', () => {
			expect( view.isReadOnly ).to.be.false;
		} );

		it( 'should set the #inputMode observable property', () => {
			expect( view.inputMode ).to.equal( 'text' );
		} );

		it( 'should create an instance of FocusTracker under #focusTracker property', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
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

				// To be sure that value can be changed multiple times using inline value attribute.
				// There was a related bug in Chrome.
				view.value = 'biz';

				expect( view.element.value ).to.equal( 'biz' );
			} );

			it( 'should set to empty string when using `falsy` values', () => {
				[ undefined, false, null ].forEach( value => {
					view.value = value;

					expect( view.element.value ).to.equal( '' );
				} );
			} );

			// See ckeditor5-ui/issues/335.
			it( 'should set element value when value was defined before view#render', () => {
				view = new InputView();

				view.value = 'baz';

				view.render();

				expect( view.element.value ).to.equal( 'baz' );
			} );

			it( 'should update along with the #isEmpty property', () => {
				view.value = 'foo';

				expect( view.isEmpty ).to.be.false;

				view.value = '';
				expect( view.isEmpty ).to.be.true;
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

		describe( 'inputmode attribute', () => {
			it( 'should react on view#inputMode', () => {
				expect( view.element.getAttribute( 'inputmode' ) ).to.equal( 'text' );

				view.inputMode = 'numeric';

				expect( view.element.getAttribute( 'inputmode' ) ).to.equal( 'numeric' );
			} );
		} );

		describe( 'class', () => {
			it( 'should react on view#hasErrors', () => {
				expect( view.element.classList.contains( 'ck-error' ) ).to.be.false;

				view.hasError = true;

				expect( view.element.classList.contains( 'ck-error' ) ).to.be.true;
			} );

			it( 'should react on view#isFocused', () => {
				expect( view.element.classList.contains( 'ck-input_focused' ) ).to.be.false;

				view.isFocused = true;

				expect( view.element.classList.contains( 'ck-input_focused' ) ).to.be.true;
			} );

			it( 'should react on view#isEmpty', () => {
				view.value = '';

				expect( view.element.classList.contains( 'ck-input-text_empty' ) ).to.be.true;

				view.value = 'bar';

				expect( view.element.classList.contains( 'ck-input-text_empty' ) ).to.be.false;
			} );
		} );

		describe( 'aria-invalid', () => {
			it( 'should react on view#hasError', () => {
				expect( view.element.getAttribute( 'aria-invalid' ) ).to.be.null;

				view.hasError = true;

				expect( view.element.getAttribute( 'aria-invalid' ) ).to.equal( 'true' );
			} );
		} );

		describe( 'aria-describedby', () => {
			it( 'should react on view#hasError', () => {
				expect( view.element.getAttribute( 'aria-describedby' ) ).to.be.null;

				view.ariaDescribedById = ariaDescribedById;

				expect( view.element.getAttribute( 'aria-describedby' ) ).to.equal( ariaDescribedById );
			} );
		} );

		describe( 'input event', () => {
			it( 'triggers view#input', () => {
				const spy = sinon.spy();

				view.on( 'input', spy );

				view.element.dispatchEvent( new Event( 'input' ) );
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWith( spy, sinon.match.object );
			} );

			// https://github.com/ckeditor/ckeditor5/issues/10431
			it( 'should trigger update of the #isEmpty property', () => {
				view.element.value = 'foo';
				view.element.dispatchEvent( new Event( 'input' ) );

				expect( view.isEmpty ).to.be.false;

				view.element.value = '';
				view.element.dispatchEvent( new Event( 'input' ) );

				expect( view.isEmpty ).to.be.true;
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'registers #element in the #focusTracker', () => {
			expect( view.isFocused ).to.be.false;

			view.element.dispatchEvent( new Event( 'focus' ) );

			expect( view.isFocused ).to.be.true;
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( view.focusTracker, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
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
