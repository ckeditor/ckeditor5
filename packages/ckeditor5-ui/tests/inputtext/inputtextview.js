/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputView } from '../../src/input/inputview.js';
import { InputTextView } from '../../src/inputtext/inputtextview.js';

describe( 'InputTextView', () => {
	let view;

	beforeEach( () => {
		view = new InputTextView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should extend InputView', () => {
			expect( view ).toBeInstanceOf( InputView );
		} );

		it( 'should creates element from template', () => {
			expect( view.element.getAttribute( 'type' ) ).toBe( 'text' );
			expect( view.element.type ).toBe( 'text' );
			expect( view.element.classList.contains( 'ck-input-text' ) ).toBe( true );
		} );
	} );
} );
