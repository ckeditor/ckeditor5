/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputView } from '../../src/input/inputview.js';

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
			expect( view.element.tagName ).toBe( 'INPUT' );
			expect( view.element.type ).toBe( 'text' );
			expect( view.element.getAttribute( 'type' ) ).toBeNull();
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-input' ) ).toBe( true );
		} );

		it( 'should set the #inputMode observable property', () => {
			expect( view.inputMode ).toBe( 'text' );
		} );
	} );

	describe( 'DOM bindings', () => {
		beforeEach( () => {
			view.value = 'foo';
			view.id = 'bar';
		} );

		describe( 'inputmode attribute', () => {
			it( 'should react on view#inputMode', () => {
				expect( view.element.getAttribute( 'inputmode' ) ).toBe( 'text' );

				view.inputMode = 'numeric';

				expect( view.element.getAttribute( 'inputmode' ) ).toBe( 'numeric' );
			} );
		} );
	} );
} );
