/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconView } from '../../../src/icon/iconview.js';
import { DropdownButtonView } from '../../../src/dropdown/button/dropdownbuttonview.js';

describe( 'DropdownButtonView', () => {
	let locale, view;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		locale = { t() {} };

		view = new DropdownButtonView( locale );
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).toBe( locale );
		} );

		it( 'creates view#arrowView', () => {
			expect( view.arrowView ).toBeInstanceOf( IconView );
		} );

		it( 'creates element from template', () => {
			expect( view.element.tagName ).toBe( 'BUTTON' );
			expect( view.element.attributes[ 'aria-haspopup' ].value ).toBe( 'true' );
		} );
	} );

	describe( 'bindings', () => {
		it( 'delegates view#execute to view#open', () => {
			const spy = vi.fn();

			view.on( 'open', spy );

			view.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'binds button\'s aria-expanded attribute to #isOn', () => {
			view.isOn = true;
			expect( view.element.getAttribute( 'aria-expanded' ) ).toBe( 'true' );

			view.isOn = false;
			expect( view.element.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		} );
	} );
} );
