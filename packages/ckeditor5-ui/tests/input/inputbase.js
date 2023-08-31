/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global Event */

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import InputBase from '../../src/input/inputbase';

describe( 'InputBase', () => {
	let view;

	class Input extends InputBase {
		constructor() {
			super();

			this.setTemplate( {
				tag: 'input'
			} );
		}
	}

	beforeEach( () => {
		view = new Input();

		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
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

		it( 'should create an instance of FocusTracker under #focusTracker property', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
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
