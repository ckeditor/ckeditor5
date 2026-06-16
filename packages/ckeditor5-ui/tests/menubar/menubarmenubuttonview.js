/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconDropdownArrow } from '@ckeditor/ckeditor5-icons';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { MenuBarMenuButtonView } from '../../src/menubar/menubarmenubuttonview.js';
import { ButtonView, IconView } from '../../src/index.js';

describe( 'MenuBarMenuButtonView', () => {
	let buttonView, locale;

	beforeEach( () => {
		locale = new Locale();
		buttonView = new MenuBarMenuButtonView( locale );
	} );

	afterEach( () => {
		buttonView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ButtonView', () => {
			expect( buttonView ).toBeInstanceOf( ButtonView );
		} );

		it( 'should set #withText', () => {
			expect( buttonView.withText ).toBe( true );
		} );

		it( 'should set #role', () => {
			expect( buttonView.role ).toBe( 'menuitem' );
		} );

		describe( '#arrowView', () => {
			it( 'should inherit from IconView', () => {
				expect( buttonView.arrowView ).toBeInstanceOf( IconView );
			} );

			it( 'should have a specific CSS class', () => {
				expect( buttonView.arrowView.template.attributes.class ).toContain( 'ck-menu-bar__menu__button__arrow' );
			} );

			it( 'should use a specific SVG icon', () => {
				expect( buttonView.arrowView.content ).toBe( IconDropdownArrow );
			} );
		} );

		describe( 'DOM element and template', () => {
			it( 'should have a specific CSS class ', () => {
				expect( buttonView.template.attributes.class ).toContain( 'ck-menu-bar__menu__button' );
			} );

			it( 'should have aria-haspopup attribute set', () => {
				expect( buttonView.template.attributes[ 'aria-haspopup' ] ).toContain( true );
			} );

			it( 'should have aria-expanded attribute bound to #isOn', () => {
				buttonView.render();

				expect( buttonView.element.getAttribute( 'aria-expanded' ) ).toBe( 'false' );

				buttonView.isOn = true;
				expect( buttonView.element.getAttribute( 'aria-expanded' ) ).toBe( 'true' );
			} );

			it( 'should have data-cke-tooltip-disabled attribute bound to #isOn', () => {
				buttonView.render();

				expect( buttonView.element.getAttribute( 'data-cke-tooltip-disabled' ) ).toBeNull();

				buttonView.isOn = true;
				expect( buttonView.element.getAttribute( 'data-cke-tooltip-disabled' ) ).toBe( 'true' );
			} );

			it( 'should fire #mouseenter upon DOM mouseenter', () => {
				const spy = vi.fn();

				buttonView.on( 'mouseenter', spy );
				buttonView.render();
				buttonView.element.dispatchEvent( new Event( 'mouseenter' ) );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should add #arrowView to the children collection', () => {
			buttonView.render();

			expect( buttonView.children.has( buttonView.arrowView ) ).toBe( true );
		} );
	} );
} );
