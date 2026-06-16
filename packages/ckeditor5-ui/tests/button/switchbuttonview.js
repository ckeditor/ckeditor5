/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SwitchButtonView } from '../../src/button/switchbuttonview.js';
import { View } from '../../src/view.js';

describe( 'SwitchButtonView', () => {
	let locale, view;

	beforeEach( () => {
		locale = { t() {} };

		view = new SwitchButtonView( locale );
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'creates #toggleSwitchView', () => {
			expect( view.toggleSwitchView ).toBeInstanceOf( View );
		} );

		it( 'sets CSS class', () => {
			expect( view.element.classList.contains( 'ck-switchbutton' ) ).toBe( true );
		} );

		it( 'sets isToggleable flag to true', () => {
			expect( view.isToggleable ).toBe( true );
		} );
	} );

	describe( 'render', () => {
		it( 'adds #toggleSwitchView to #children', () => {
			expect( view.children.get( 1 ) ).toBe( view.toggleSwitchView );
		} );
	} );

	describe( '#toggleSwitchView', () => {
		it( 'has proper DOM structure', () => {
			const toggleElement = view.toggleSwitchView.element;

			expect( toggleElement.classList.contains( 'ck' ) ).toBe( true );
			expect( toggleElement.classList.contains( 'ck-button__toggle' ) ).toBe( true );

			expect( toggleElement.firstChild.classList.contains( 'ck' ) ).toBe( true );
			expect( toggleElement.firstChild.classList.contains( 'ck-button__toggle__inner' ) ).toBe( true );
		} );
	} );
} );
