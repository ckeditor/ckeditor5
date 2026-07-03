/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { SearchResultsView } from '../../src/search/searchresultsview.js';

import { ButtonView, View, ViewCollection } from '../../src/index.js';

describe( 'SearchResultsView', () => {
	let locale, view;

	beforeEach( () => {
		locale = new Locale();

		view = new SearchResultsView( locale );
		view.children.addMany( [ createNonFocusableView(), createFocusableView(), createFocusableView() ] );
		view.render();

		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.destroy();
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'creates and element from template with CSS classes', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-search__results' ) ).toBe( true );
			expect( view.element.getAttribute( 'tabIndex' ) ).toBe( '-1' );
		} );

		it( 'has a collection of #children', () => {
			expect( view.children ).toBeInstanceOf( ViewCollection );

			view.children.add( new ButtonView() );

			expect( view.element.firstChild ).toBe( view.children.first.element );
		} );
	} );

	describe( 'focus()', () => {
		it( 'does nothing for empty panel', () => {
			expect( () => view.focus() ).not.toThrow();
		} );

		it( 'focuses first focusable view in #children', () => {
			view.focus();

			expect( view.children.get( 1 ).focus ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focusFirst()', () => {
		it( 'focuses first focusable view in #children', () => {
			view.focusFirst();

			expect( view.children.get( 1 ).focus ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'focuses first focusable view in #children', () => {
			view.focusLast();

			expect( view.children.get( 2 ).focus ).toHaveBeenCalledOnce();
		} );
	} );

	function createFocusableView( name ) {
		const view = createNonFocusableView();

		view.name = name;
		view.focus = vi.fn( () => view.element.focus() );

		return view;
	}

	function createNonFocusableView() {
		const view = new View();

		view.element = document.createElement( 'div' );
		view.element.textContent = 'foo';
		document.body.appendChild( view.element );

		return view;
	}
} );
