/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpinnerView } from '../../src/spinner/spinnerview.js';

describe( 'SpinnerView', () => {
	let view;

	beforeEach( () => {
		view = new SpinnerView();
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'sets #isVisible', () => {
			expect( view.isVisible ).toBe( false );
		} );

		it( 'creates element from template', () => {
			expect( view.element.tagName ).toBe( 'SPAN' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-spinner-container' ) ).toBe( true );

			expect( view.element.children[ 0 ].tagName ).toBe( 'SPAN' );
			expect( view.element.children[ 0 ].classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.children[ 0 ].classList.contains( 'ck-spinner' ) ).toBe( true );
		} );
	} );

	describe( 'bindings', () => {
		it( 'should react to changes in view#isVisible', () => {
			view.isVisible = true;

			expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( false );

			view.isVisible = false;

			expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( true );
		} );
	} );
} );
