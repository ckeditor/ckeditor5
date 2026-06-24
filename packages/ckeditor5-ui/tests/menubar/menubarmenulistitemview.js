/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Locale } from '@ckeditor/ckeditor5-utils';
import {
	ListItemView,
	MenuBarMenuListItemView,
	MenuBarMenuView
} from '../../src/index.js';

describe( 'MenuBarMenuListItemView', () => {
	let listItemView, locale, parentMenuView;

	beforeEach( () => {
		locale = new Locale();
		parentMenuView = new MenuBarMenuView( locale );
		listItemView = new MenuBarMenuListItemView( locale, parentMenuView );
	} );

	afterEach( () => {
		listItemView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ListItemView', () => {
			expect( listItemView ).toBeInstanceOf( ListItemView );
		} );

		describe( 'template and DOM element', () => {
			it( 'should have a specific CSS class', () => {
				expect( listItemView.template.attributes.class ).toContain( 'ck-menu-bar__menu__item' );
			} );

			it( 'should fire #mousenter upon DOM mousenter', () => {
				const spy = vi.fn();

				listItemView.on( 'mouseenter', spy );
				listItemView.render();
				listItemView.element.dispatchEvent( new Event( 'mouseenter' ) );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );

		it( 'should delegate events to a parent menu view', () => {
			const spy = vi.fn();

			parentMenuView.on( 'mouseenter', spy );
			listItemView.render();
			listItemView.element.dispatchEvent( new Event( 'mouseenter' ) );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );
} );
