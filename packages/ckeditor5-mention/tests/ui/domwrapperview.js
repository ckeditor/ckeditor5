/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import DomWrapperView from '../../src/ui/domwrapperview.js';

describe( 'DomWrapperView', () => {
	let domElement, view;

	beforeEach( () => {
		domElement = document.createElement( 'div' );
		view = new DomWrapperView( new Locale(), domElement );
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should add CSS class to the element', () => {
			expect( domElement.classList.contains( 'ck-button' ) ).to.be.true;
		} );

		it( 'should set #isOn observable property with a CSS class binding', () => {
			expect( view.isOn ).to.be.false;

			// TODO: This is actually a bug because the initial state is not set correctly.
			expect( domElement.classList.contains( 'ck-on' ) ).to.be.false;
			expect( domElement.classList.contains( 'ck-off' ) ).to.be.false;

			view.isOn = true;
			expect( domElement.classList.contains( 'ck-on' ) ).to.be.true;
			expect( domElement.classList.contains( 'ck-off' ) ).to.be.false;

			view.isOn = false;
			expect( domElement.classList.contains( 'ck-on' ) ).to.be.false;
			expect( domElement.classList.contains( 'ck-off' ) ).to.be.true;
		} );

		it( 'should fire #execute on DOM element click', () => {
			const spy = sinon.spy();
			view.on( 'execute', spy );

			domElement.dispatchEvent( new Event( 'click' ) );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'render()', () => {
		it( 'should assign passed element to #element', () => {
			view.render();
			expect( view.element ).to.equal( domElement );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #domElement', () => {
			const spy = sinon.spy( domElement, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
