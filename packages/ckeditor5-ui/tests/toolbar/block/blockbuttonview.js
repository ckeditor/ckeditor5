/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BlockButtonView } from '../../../src/toolbar/block/blockbuttonview.js';

describe( 'BlockButtonView', () => {
	let view;

	beforeEach( () => {
		view = new BlockButtonView();

		view.render();
	} );

	it( 'should be not visible on init', () => {
		expect( view.isVisible ).toBe( false );
	} );

	it( 'should create element from template', () => {
		expect( view.element.classList.contains( 'ck-block-toolbar-button' ) ).toBe( true );
	} );

	it( 'should be initialized as toggleable button', () => {
		expect( view.isToggleable ).toBe( true );
	} );

	describe( 'DOM binding', () => {
		it( 'should react on `view#top` change', () => {
			view.top = 0;

			expect( view.element.style.top ).toBe( '0px' );

			view.top = 10;

			expect( view.element.style.top ).toBe( '10px' );
		} );

		it( 'should react on `view#left` change', () => {
			view.left = 0;

			expect( view.element.style.left ).toBe( '0px' );

			view.left = 10;

			expect( view.element.style.left ).toBe( '10px' );
		} );
	} );
} );
