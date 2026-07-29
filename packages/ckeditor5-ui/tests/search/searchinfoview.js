/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchInfoView } from '../../src/search/searchinfoview.js';

describe( 'SearchInfoView', () => {
	let view;

	beforeEach( () => {
		view = new SearchInfoView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates and element from template with CSS classes', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-search__info' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( true );
		} );

		it( 'sets #isVisible and creates a DOM binding', () => {
			expect( view.isVisible ).toBe( false );

			view.isVisible = true;

			expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( false );
		} );

		it( 'sets #primaryText and creates a DOM binding', () => {
			expect( view.primaryText ).toBe( '' );

			view.primaryText = 'foo';

			expect( view.element.innerHTML ).toBe( '<span>foo</span><span></span>' );
		} );

		it( 'sets #secondaryText', () => {
			expect( view.secondaryText ).toBe( '' );

			view.secondaryText = 'bar';

			expect( view.element.innerHTML ).toBe( '<span></span><span>bar</span>' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus #element', () => {
			const spy = vi.spyOn( view.element, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );
} );
