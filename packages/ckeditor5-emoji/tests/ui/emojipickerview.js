/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SearchInfoView, ViewCollection } from 'ckeditor5/src/ui.js';
import { EmojiCategoriesView } from '../../src/ui/emojicategoriesview.js';
import { EmojiGridView } from '../../src/ui/emojigridview.js';
import { EmojiPickerView } from '../../src/ui/emojipickerview.js';
import { EmojiSearchView } from '../../src/ui/emojisearchview.js';
import { EmojiToneView } from '../../src/ui/emojitoneview.js';

describe( 'EmojiPickerView', () => {
	let emojiPickerView, locale, emojiCategories, skinTones, emojiBySearchQuery;

	beforeEach( () => {
		locale = {
			t: val => val
		};

		emojiCategories = [
			{
				title: 'faces',
				icon: '😊',
				items: [
					{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
				]
			}, {
				title: 'food',
				icon: '🍕',
				items: []
			}, {
				title: 'things',
				icon: '📕',
				items: []
			}
		];

		skinTones = [
			{ id: 'default', icon: '👋', tooltip: 'Default skin tone' },
			{ id: 'light', icon: '👋🏻', tooltip: 'Light skin tone' },
			{ id: 'medium-light', icon: '👋🏼', tooltip: 'Medium Light skin tone' },
			{ id: 'medium', icon: '👋🏽', tooltip: 'Medium skin tone' },
			{ id: 'medium-dark', icon: '👋🏾', tooltip: 'Medium Dark skin tone' },
			{ id: 'dark', icon: '👋🏿', tooltip: 'Dark skin tone' }
		];

		emojiBySearchQuery = () => [
			{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } },
			{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
		];

		emojiPickerView = new EmojiPickerView( locale, {
			emojiCategories,
			skinTones,
			getEmojiByQuery: emojiBySearchQuery,
			skinTone: 'default'
		} );
	} );

	afterEach( () => {
		if ( emojiPickerView.element ) {
			emojiPickerView.element.remove();
		}

		emojiPickerView.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		const some = ( arg, callback ) => [ ...arg ].some( callback );

		it( 'should create search info view', () => {
			expect( some( emojiPickerView.items, view => view instanceof SearchInfoView ) ).toBe( true );
		} );

		it( 'should create grid view with correct arguments', () => {
			expect( some( emojiPickerView.items, view => view instanceof EmojiGridView ) ).toBe( true );
			expect( emojiPickerView.gridView.categoryName ).toBe( 'faces' );
			expect( emojiPickerView.gridView.emojiCategories ).toEqual( emojiCategories );
			expect( emojiPickerView.gridView._getEmojiByQuery ).toBe( emojiBySearchQuery );
			expect( emojiPickerView.gridView.skinTone ).toBe( 'default' );
		} );

		it( 'should create emoji search view with correct arguments', () => {
			expect( some( emojiPickerView.items, view => view instanceof EmojiSearchView ) ).toBe( true );
			expect( emojiPickerView.searchView.gridView ).toBe( emojiPickerView.gridView );
			expect( emojiPickerView.searchView.inputView.infoView ).toBe( emojiPickerView.infoView );
		} );

		it( 'should create emoji categories view with correct arguments', () => {
			expect( some( emojiPickerView.items, view => view instanceof EmojiCategoriesView ) ).toBe( true );
			expect( emojiPickerView.categoriesView.emojiCategories ).toBe( emojiPickerView.emojiCategories );
			expect( emojiPickerView.categoriesView.categoryName ).toBe( 'faces' );
		} );

		it( 'should create emoji tone view with correct arguments', () => {
			expect( some( emojiPickerView.items, view => view instanceof EmojiToneView ) ).toBe( true );
			expect( emojiPickerView.toneView.skinTone ).toBe( 'default' );
			expect( emojiPickerView.toneView._skinTones ).toBe( skinTones );
		} );

		// https://github.com/ckeditor/ckeditor5/pull/12319#issuecomment-1231779819
		it( 'sets tabindex to -1 to avoid focus loss', () => {
			expect( emojiPickerView.template.attributes.tabindex ).toEqual( [ '-1' ] );
		} );

		it( 'creates `view#items` collection', () => {
			expect( emojiPickerView.items ).toBeInstanceOf( ViewCollection );

			// To check if the `#createCollection()` factory was used.
			expect( emojiPickerView._viewCollections.has( emojiPickerView.items ) ).toBe( true );
		} );

		describe( 'events handling', () => {
			it( 'should disable categories on search event emitted when query is not empty', () => {
				const stub = vi.spyOn( emojiPickerView.categoriesView, 'disableCategories' );

				emojiPickerView.searchView.fire( 'search', { query: 'test' } );

				expect( stub ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should enable categories on search event emitted when query is empty', () => {
				const stub = vi.spyOn( emojiPickerView.categoriesView, 'enableCategories' );

				emojiPickerView.searchView.fire( 'search', { query: '' } );

				expect( stub ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should display a hint for users when the query is too short', () => {
				emojiPickerView.searchView.fire( 'search', { query: '1' } );

				expect( emojiPickerView.infoView.primaryText ).toBe( 'Keep on typing to see the emoji.' );
				expect( emojiPickerView.infoView.secondaryText ).toBe( 'The query must contain at least two characters.' );
				expect( emojiPickerView.infoView.isVisible ).toBe( true );
			} );

			it( 'should display a note when emoji were not matched with the specified query', () => {
				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 0 } );

				expect( emojiPickerView.infoView.primaryText ).toBe( 'No emojis were found matching "%0".' );
				expect( emojiPickerView.infoView.secondaryText ).toBe( 'Please try a different phrase or check the spelling.' );
				expect( emojiPickerView.infoView.isVisible ).toBe( true );
			} );

			it( 'should hide the hint view when found emoji matches with the specified query', () => {
				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 1 } );

				expect( emojiPickerView.infoView.isVisible ).toBe( false );
			} );

			it( 'should scroll to the top of the grid when an active category is changed', () => {
				const stub = vi.spyOn( emojiPickerView.gridView.element, 'scrollTo' );

				emojiPickerView.categoriesView.categoryName = 'food';

				expect( emojiPickerView.gridView.categoryName ).toBe( 'food' );
				expect( stub ).toHaveBeenCalledTimes( 1 );
				expect( stub ).toHaveBeenCalledWith( 0, 0 );
			} );

			it( 'should scroll to the top of the grid when a search event is emitted', () => {
				const stub = vi.spyOn( emojiPickerView.gridView.element, 'scrollTo' );

				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 1 } );

				expect( stub ).toHaveBeenCalledTimes( 1 );
				expect( stub ).toHaveBeenCalledWith( 0, 0 );
			} );

			it( 'should trigger the search mechanism when an active category is changed', () => {
				const stub = vi.spyOn( emojiPickerView.searchView, 'search' );

				emojiPickerView.categoriesView.categoryName = 'food';

				expect( emojiPickerView.gridView.categoryName ).toBe( 'food' );
				expect( stub ).toHaveBeenCalledTimes( 1 );
				expect( stub ).toHaveBeenCalledWith( '' );
			} );

			it( 'should use the current query value when updating the skin tone property', () => {
				const searchStub = vi.spyOn( emojiPickerView.searchView, 'search' ).mockImplementation( () => {} );
				const getInputValueStub = vi.spyOn( emojiPickerView.searchView, 'getInputValue' ).mockReturnValue( 'thum' );

				emojiPickerView.toneView.skinTone = 'medium';

				expect( emojiPickerView.gridView.skinTone ).toBe( 'medium' );
				expect( searchStub ).toHaveBeenCalledTimes( 1 );
				expect( searchStub ).toHaveBeenCalledWith( 'thum' );
				expect( getInputValueStub ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should fire an update event when search event is emitted', () => {
				const fireSpy = vi.spyOn( emojiPickerView, 'fire' );

				emojiPickerView.searchView.fire( 'search', { query: '' } );

				expect( fireSpy ).toHaveBeenCalledTimes( 1 );
				expect( fireSpy ).toHaveBeenCalledWith( 'update' );
			} );
		} );
	} );

	describe( 'render()', () => {
		describe( 'activates keyboard navigation in the emoji view', () => {
			it( 'should add emojiView to focusTracker', () => {
				const stub = vi.spyOn( emojiPickerView.focusTracker, 'add' );

				emojiPickerView.render();

				expect( stub ).toHaveBeenCalledTimes( 5 );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.searchView.element );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.toneView.element );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.categoriesView.element );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.gridView.element );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.infoView.element );
			} );

			it( 'should call keystrokes listenTo on emojiPickerView instance', () => {
				const stub = vi.spyOn( emojiPickerView.keystrokes, 'listenTo' );

				emojiPickerView.render();

				expect( stub ).toHaveBeenCalledTimes( 1 );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.element );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy focus tracker', () => {
			const stub = vi.spyOn( emojiPickerView.focusTracker, 'destroy' );

			emojiPickerView.destroy();

			expect( stub ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should destroy keystrokes handler', () => {
			const stub = vi.spyOn( emojiPickerView.keystrokes, 'destroy' );

			emojiPickerView.destroy();

			expect( stub ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first focusable', () => {
			const spy = vi.spyOn( emojiPickerView.searchView, 'focus' );

			emojiPickerView.render();
			emojiPickerView.focus();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
