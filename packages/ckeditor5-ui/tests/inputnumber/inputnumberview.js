/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputNumberView } from '../../src/inputnumber/inputnumberview.js';
import { InputView } from '../../src/input/inputview.js';

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
			expect( view ).toBeInstanceOf( InputView );
		} );

		it( 'should create element from template', () => {
			expect( view.element.getAttribute( 'type' ) ).toBe( 'number' );
			expect( view.element.type ).toBe( 'number' );
			expect( view.element.classList.contains( 'ck-input-number' ) ).toBe( true );

			expect( view.element.getAttribute( 'min' ) ).toBeNull();
			expect( view.element.getAttribute( 'max' ) ).toBeNull();
			expect( view.element.getAttribute( 'step' ) ).toBeNull();
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'min attribute', () => {
			it( 'should respond to view#min', () => {
				expect( view.element.getAttribute( 'min' ) ).toBeNull();

				view.min = 20;

				expect( view.element.getAttribute( 'min' ) ).toBe( '20' );
			} );
		} );

		describe( 'max attribute', () => {
			it( 'should respond to view#max', () => {
				expect( view.element.getAttribute( 'max' ) ).toBeNull();

				view.max = 20;

				expect( view.element.getAttribute( 'max' ) ).toBe( '20' );
			} );
		} );

		describe( 'step attribute', () => {
			it( 'should respond to view#step', () => {
				expect( view.element.getAttribute( 'step' ) ).toBeNull();

				view.step = 20;

				expect( view.element.getAttribute( 'step' ) ).toBe( '20' );
			} );
		} );
	} );
} );
