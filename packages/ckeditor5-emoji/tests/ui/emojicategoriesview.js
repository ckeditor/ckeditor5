/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmojiCategoriesView } from '../../src/ui/emojicategoriesview.js';
import { ViewCollection } from '@ckeditor/ckeditor5-ui';

describe( 'EmojiCategoriesView', () => {
	let locale, emojiCategoriesView, emojiCategories;

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiCategories = [
			{
				title: 'faces',
				icon: '😊'
			}, {
				title: 'food',
				icon: '🍕'
			}, {
				title: 'things',
				icon: '📕'
			}
		];

		emojiCategoriesView = new EmojiCategoriesView( locale, { emojiCategories, categoryName: 'faces' } );
		emojiCategoriesView.render();
	} );

	afterEach( () => {
		emojiCategoriesView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates `view#buttonViews` collection', () => {
			expect( emojiCategoriesView.buttonViews ).toBeInstanceOf( ViewCollection );

			// To check if the `#createCollection()` factory was used.
			expect( emojiCategoriesView._viewCollections.has( emojiCategoriesView.buttonViews ) ).toBe( true );
		} );

		it( 'creates #element from template', () => {
			expect( emojiCategoriesView.element.classList.contains( 'ck' ) ).toBe( true );
			expect( emojiCategoriesView.element.classList.contains( 'ck-emoji__categories-list' ) ).toBe( true );

			expect( Object.values( emojiCategoriesView.element.childNodes ).length ).toBe( emojiCategories.length );

			expect( emojiCategoriesView.element.getAttribute( 'role' ) ).toBe( 'tablist' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first category item', () => {
			const spy = vi.spyOn( emojiCategoriesView.buttonViews.first, 'focus' );

			emojiCategoriesView.focus();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy an instance of focus tracker', () => {
			const spy = vi.spyOn( emojiCategoriesView.focusTracker, 'destroy' );

			emojiCategoriesView.destroy();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should destroy an instance of keystroke handler', () => {
			const spy = vi.spyOn( emojiCategoriesView.keystrokes, 'destroy' );

			emojiCategoriesView.destroy();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'enableCategories()', () => {
		it( 'enables all buttons', () => {
			emojiCategoriesView.enableCategories();

			emojiCategoriesView.buttonViews.forEach( buttonView => {
				expect( buttonView.isEnabled ).toBe( true );
			} );
		} );

		it( 'should restore the "active" category indicator when categories are enabled', () => {
			const button = emojiCategoriesView.buttonViews.get( 0 );

			expect( button.isOn ).toBe( true );

			emojiCategoriesView.disableCategories();
			expect( button.isOn ).toBe( false );

			emojiCategoriesView.enableCategories();
			expect( button.isOn ).toBe( true );
		} );
	} );

	describe( 'disableCategories()', () => {
		it( 'disables all buttons', () => {
			emojiCategoriesView.disableCategories();

			emojiCategoriesView.buttonViews.forEach( buttonView => {
				expect( buttonView.class ).toBe( '' );
				expect( buttonView.isOn ).toBe( false );
				expect( buttonView.isEnabled ).toBe( false );
			} );
		} );
	} );

	describe( '_createCategoryButton()', () => {
		it( 'renders the `[role]` attribute on each item', () => {
			const categoryButton = emojiCategoriesView._createCategoryButton( {
				title: 'faces',
				icon: '😊'
			} );

			expect( categoryButton.role ).toBe( 'tab' );
		} );

		it( 'does not use the `[aria-labelled-by]` attribute as the button is descriptive enough', () => {
			const categoryButton = emojiCategoriesView._createCategoryButton( {
				title: 'faces',
				icon: '😊'
			} );

			expect( categoryButton.ariaLabelledBy ).toBe( undefined );
		} );

		it( 'uses the emoji instead of a descriptive text label for a non-screen reader', () => {
			const categoryButton = emojiCategoriesView._createCategoryButton( {
				title: 'faces',
				icon: '😊'
			} );

			expect( categoryButton.label ).toBe( '😊' );
		} );

		it( 'uses the emoji name instead of an icon for a screen reader', () => {
			const categoryButton = emojiCategoriesView._createCategoryButton( {
				title: 'faces',
				icon: '😊'
			} );

			expect( categoryButton.ariaLabel ).toBe( 'faces' );
		} );
	} );

	describe( '#buttonViews', () => {
		it( 'updates `categoryName` upon clicking  a category item click', () => {
			expect( emojiCategoriesView.categoryName ).toBe( 'faces' );

			emojiCategoriesView.buttonViews.get( 1 ).fire( 'execute' );

			expect( emojiCategoriesView.categoryName ).toBe( 'food' );
		} );

		it( 'deactivates the previous active button upon clicking on a new one', () => {
			const facesButton = emojiCategoriesView.buttonViews.get( 0 );
			const thingsBottom = emojiCategoriesView.buttonViews.get( 2 );

			expect( facesButton.isOn ).toBe( true );
			expect( thingsBottom.isOn ).toBe( false );

			thingsBottom.fire( 'execute' );

			expect( facesButton.isOn ).toBe( false );
			expect( thingsBottom.isOn ).toBe( true );
		} );

		it( 'renders the `[aria-selected]` attribute on each item', () => {
			const facesButton = emojiCategoriesView.buttonViews.get( 0 );
			const foodButton = emojiCategoriesView.buttonViews.get( 1 );
			const thingsBottom = emojiCategoriesView.buttonViews.get( 2 );

			expect( facesButton.element.getAttribute( 'aria-selected' ) ).toBe( 'true' );
			expect( foodButton.element.getAttribute( 'aria-selected' ) ).toBe( 'false' );
			expect( thingsBottom.element.getAttribute( 'aria-selected' ) ).toBe( 'false' );
		} );
	} );
} );
