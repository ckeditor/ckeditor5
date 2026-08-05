/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchInfoView, ViewCollection } from '@ckeditor/ckeditor5-ui';
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
				const stub = vi.spyOn( emojiPickerView.categoriesView, 'disableCategories' ).mockImplementation( () => {} );

				emojiPickerView.searchView.fire( 'search', { query: 'test' } );

				expect( stub ).toHaveBeenCalledOnce();
			} );

			it( 'should enable categories on search event emitted when query is empty', () => {
				const stub = vi.spyOn( emojiPickerView.categoriesView, 'enableCategories' ).mockImplementation( () => {} );

				emojiPickerView.searchView.fire( 'search', { query: '' } );

				expect( stub ).toHaveBeenCalledOnce();
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
				const stub = vi.spyOn( emojiPickerView.gridView.element, 'scrollTo' ).mockImplementation( () => {} );

				emojiPickerView.categoriesView.categoryName = 'food';

				expect( emojiPickerView.gridView.categoryName ).toBe( 'food' );
				expect( stub ).toHaveBeenCalledOnce();
				expect( stub ).toHaveBeenCalledWith( 0, 0 );
			} );

			it( 'should scroll to the top of the grid when a search event is emitted', () => {
				const stub = vi.spyOn( emojiPickerView.gridView.element, 'scrollTo' ).mockImplementation( () => {} );

				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 1 } );

				expect( stub ).toHaveBeenCalledOnce();
				expect( stub ).toHaveBeenCalledWith( 0, 0 );
			} );

			it( 'should trigger the search mechanism when an active category is changed', () => {
				const stub = vi.spyOn( emojiPickerView.searchView, 'search' ).mockImplementation( () => {} );

				emojiPickerView.categoriesView.categoryName = 'food';

				expect( emojiPickerView.gridView.categoryName ).toBe( 'food' );
				expect( stub ).toHaveBeenCalledOnce();
				expect( stub ).toHaveBeenCalledWith( '' );
			} );

			it( 'should use the current query value when updating the skin tone property', () => {
				const searchStub = vi.spyOn( emojiPickerView.searchView, 'search' ).mockImplementation( () => {} );
				const getInputValueStub = vi.spyOn( emojiPickerView.searchView, 'getInputValue' ).mockReturnValue( 'thum' );

				emojiPickerView.toneView.skinTone = 'medium';

				expect( emojiPickerView.gridView.skinTone ).toBe( 'medium' );
				expect( searchStub ).toHaveBeenCalledOnce();
				expect( searchStub ).toHaveBeenCalledWith( 'thum' );
				expect( getInputValueStub ).toHaveBeenCalledOnce();
			} );

			it( 'should fire an update event when search event is emitted', () => {
				const fireSpy = vi.spyOn( emojiPickerView, 'fire' );

				emojiPickerView.searchView.fire( 'search', { query: '' } );

				expect( fireSpy ).toHaveBeenCalledOnce();
				expect( fireSpy ).toHaveBeenCalledWith( 'update' );
			} );

			it( 'should not update the info view when there are no categories loaded', () => {
				emojiPickerView.categoriesView.buttonViews.clear();

				const setInfoSpy = vi.spyOn( emojiPickerView.infoView, 'set' );

				// A single-character query that would normally trigger the "keep typing" hint.
				emojiPickerView.searchView.fire( 'search', { query: 'a' } );

				expect( setInfoSpy ).not.toHaveBeenCalled();
			} );

			it( 'should not update the info view for "no results" message when there are no categories loaded', () => {
				emojiPickerView.categoriesView.buttonViews.clear();

				const setInfoSpy = vi.spyOn( emojiPickerView.infoView, 'set' );

				emojiPickerView.searchView.fire( 'search', { query: 'foo', resultsCount: 0 } );

				expect( setInfoSpy ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'setCategories()', () => {
		beforeEach( () => {
			emojiPickerView.render();
			document.body.appendChild( emojiPickerView.element );
		} );

		afterEach( () => {
			emojiPickerView.element.remove();
		} );

		it( 'should replace gridView.emojiCategories with the provided categories', () => {
			const newCategories = [
				{
					title: 'animals',
					icon: '🐶',
					items: [
						{ 'annotation': 'dog', 'emoji': '🐶', skins: { 'default': '🐶' } }
					]
				}
			];

			emojiPickerView.setCategories( newCategories );

			expect( emojiPickerView.gridView.emojiCategories.length ).toBe( newCategories.length );
			expect( emojiPickerView.gridView.emojiCategories[ 0 ] ).toEqual( newCategories[ 0 ] );
		} );

		it( 'should update categoryName in categoriesView and gridView to the first new category', () => {
			const newCategories = [
				{
					title: 'animals',
					icon: '🐶',
					items: []
				}
			];

			emojiPickerView.setCategories( newCategories );

			expect( emojiPickerView.categoriesView.categoryName ).toBe( 'animals' );
			expect( emojiPickerView.gridView.categoryName ).toBe( 'animals' );
		} );

		it( 'should pass new categories to categoriesView.setCategories()', () => {
			const newCategories = [
				{
					title: 'animals',
					icon: '🐶',
					items: []
				}
			];

			const stub = vi.spyOn( emojiPickerView.categoriesView, 'setCategories' ).mockImplementation( () => {} );

			emojiPickerView.setCategories( newCategories );

			expect( stub ).toHaveBeenCalledOnce();
			expect( stub ).toHaveBeenCalledWith( newCategories );
		} );

		it( 'should trigger a search using the current input value after updating categories', () => {
			const newCategories = [
				{
					title: 'animals',
					icon: '🐶',
					items: []
				}
			];

			const searchStub = vi.spyOn( emojiPickerView.searchView, 'search' ).mockImplementation( () => {} );
			const getInputValueStub = vi.spyOn( emojiPickerView.searchView, 'getInputValue' ).mockReturnValue( 'dog' );

			emojiPickerView.setCategories( newCategories );

			expect( getInputValueStub ).toHaveBeenCalledOnce();
			expect( searchStub ).toHaveBeenCalledTimes( 2 );
			expect( searchStub.mock.calls[ searchStub.mock.calls.length - 1 ] ).toEqual( [ 'dog' ] );
		} );

		it( 'should trigger a search with empty string when input is empty', () => {
			const newCategories = [
				{
					title: 'animals',
					icon: '🐶',
					items: []
				}
			];

			const searchStub = vi.spyOn( emojiPickerView.searchView, 'search' ).mockImplementation( () => {} );

			vi.spyOn( emojiPickerView.searchView, 'getInputValue' ).mockReturnValue( '' );

			emojiPickerView.setCategories( newCategories );

			expect( searchStub ).toHaveBeenCalledTimes( 2 );
			expect( searchStub.mock.calls[ searchStub.mock.calls.length - 1 ] ).toEqual( [ '' ] );
		} );
	} );

	describe( 'render()', () => {
		describe( 'activates keyboard navigation in the emoji view', () => {
			it( 'should add emojiView to focusTracker', () => {
				const stub = vi.spyOn( emojiPickerView.focusTracker, 'add' ).mockImplementation( () => {} );

				emojiPickerView.render();

				expect( stub ).toHaveBeenCalledTimes( 5 );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.searchView.element );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.toneView.element );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.categoriesView.element );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.gridView.element );
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.infoView.element );
			} );

			it( 'should call keystrokes listenTo on emojiPickerView instance', () => {
				const stub = vi.spyOn( emojiPickerView.keystrokes, 'listenTo' ).mockImplementation( () => {} );

				emojiPickerView.render();

				expect( stub ).toHaveBeenCalledOnce();
				expect( stub ).toHaveBeenCalledWith( emojiPickerView.element );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy focus tracker', () => {
			const stub = vi.spyOn( emojiPickerView.focusTracker, 'destroy' ).mockImplementation( () => {} );

			emojiPickerView.destroy();

			expect( stub ).toHaveBeenCalledOnce();
		} );

		it( 'should destroy keystrokes handler', () => {
			const stub = vi.spyOn( emojiPickerView.keystrokes, 'destroy' ).mockImplementation( () => {} );

			emojiPickerView.destroy();

			expect( stub ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first focusable', () => {
			const spy = vi.spyOn( emojiPickerView.searchView, 'focus' );

			emojiPickerView.render();
			emojiPickerView.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );
} );
