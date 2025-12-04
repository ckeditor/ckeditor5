/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmojiGridView } from '../../src/ui/emojigridview.js';
import { ViewCollection, ButtonView } from '@ckeditor/ckeditor5-ui';
import { keyCodes } from '@ckeditor/ckeditor5-utils';

describe( 'EmojiGridView', () => {
	let view, locale, emojiCategories;

	beforeEach( () => {
		locale = {
			t: str => str
		};

		emojiCategories = [
			{
				title: 'faces',
				icon: '😊',
				items: [
					{ 'annotation': 'grinning face', 'emoji': '😀', 'skins': { 'default': '😀' } },
					{ 'annotation': 'thumbs up', 'emoji': '👍', 'skins': { 'default': '👍' } },
					{ 'annotation': 'winking face', 'emoji': '😉', 'skins': { 'default': '😉' } },
					{ 'annotation': 'heart eyes', 'emoji': '😍', 'skins': { 'default': '😍' } },
					{ 'annotation': 'crying face', 'emoji': '😢', 'skins': { 'default': '😢' } },
					{ 'annotation': 'sunglasses', 'emoji': '😎', 'skins': { 'default': '😎' } }
				]
			}, {
				title: 'food',
				icon: '🍕',
				items: [
					{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
				]
			}, {
				title: 'things',
				icon: '📕',
				items: []
			}
		];

		view = new EmojiGridView( locale, {
			emojiCategories,
			categoryName: 'faces',
			skinTone: 'default',
			getEmojiByQuery: () => [
				{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } },
				{ 'annotation': 'thumbs up', 'emoji': '👍', 'skins': { 'default': '👍' } }
			]
		} );
		view.render();

		// Initial search to render grid.
		view.filter( null );
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates `view#tiles` collection', () => {
			expect( view.tiles ).toBeInstanceOf( ViewCollection );

			// To check if the `#createCollection()` factory was used.
			expect( view._viewCollections.has( view.tiles ) ).toBe( true );
		} );

		it( 'creates `view#cachedTiles` collection', () => {
			expect( view.cachedTiles ).toBeInstanceOf( ViewCollection );

			// To check if the `#createCollection()` factory was used.
			expect( view._viewCollections.has( view.cachedTiles ) ).toBe( true );
		} );

		it( 'creates #element from template', () => {
			expect( view.element.getAttribute( 'role' ) ).toBe( 'tabpanel' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-emoji__tiles' ) ).toBe( true );

			const tilesContainer = view.element.firstChild;

			expect( tilesContainer.getAttribute( 'role' ) ).toBe( 'grid' );
			expect( tilesContainer.classList.contains( 'ck' ) ).toBe( true );
			expect( tilesContainer.classList.contains( 'ck-emoji__grid' ) ).toBe( true );
		} );

		describe( 'focus management across the grid items using arrow keys', () => {
			let view;

			beforeEach( () => {
				view = new EmojiGridView( locale, {
					emojiCategories,
					categoryName: 'faces',
					skinTone: 'default',
					getEmojiByQuery: () => [
						{ 'annotation': 'grinning face', 'emoji': '😀', 'skins': { 'default': '😀' } },
						{ 'annotation': 'thumbs up', 'emoji': '👍', 'skins': { 'default': '👍' } },
						{ 'annotation': 'winking face', 'emoji': '😉', 'skins': { 'default': '😉' } },
						{ 'annotation': 'heart eyes', 'emoji': '😍', 'skins': { 'default': '😍' } },
						{ 'annotation': 'crying face', 'emoji': '😢', 'skins': { 'default': '😢' } },
						{ 'annotation': 'sunglasses', 'emoji': '😎', 'skins': { 'default': '😎' } }
					]
				} );

				view.render();
				document.body.appendChild( view.element );
			} );

			afterEach( () => {
				view.element.remove();
				view.destroy();
			} );

			describe( 'Default grid - responsive number of tiles depending on width', () => {
				it( '"arrow right" should focus the next focusable grid item', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowright,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					view.filter( new RegExp( 'smile' ) );

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = vi.spyOn( view.tiles.get( 1 ), 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );

				it( '"arrow down" should focus the focusable grid item in the second row', () => {
					const numberOfColumns = window
						.getComputedStyle( view.element.firstChild ) // Responsive `.ck-emoji__tile`.
						.getPropertyValue( 'grid-template-columns' )
						.split( ' ' )
						.length;

					const keyEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					view.filter( new RegExp( 'smile' ) );

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = vi.spyOn( view.tiles.get( numberOfColumns ), 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );

			describe( 'Responsive grid - changed to 5 tiles in a row instead of 10', () => {
				beforeEach( () => {
					view.element.firstChild.style.gridTemplateColumns = 'repeat(5, 1fr)';
					view.element.firstChild.style.display = 'grid';
				} );

				it( '"arrow right" should focus the next focusable grid item', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowright,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					view.filter( new RegExp( 'smile' ) );

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = vi.spyOn( view.tiles.get( 1 ), 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );

				it( '"arrow down" should focus the focusable grid item in the second row', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					view.filter( new RegExp( 'smile' ) );

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = vi.spyOn( view.tiles.get( 5 ), 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first tile', () => {
			view.filter( new RegExp( 'smile' ) );

			const spy = vi.spyOn( view.tiles.first, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not crash when a grid is empty', () => {
			const view = new EmojiGridView( locale, {
				emojiCategories: [],
				categoryName: '',
				getEmojiByQuery: vi.fn()
			} );

			view.render();

			expect( () => {
				view.focus();
			} ).not.toThrow();

			view.destroy();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy an instance of focus tracker', () => {
			const spy = vi.spyOn( view.focusTracker, 'destroy' );

			view.destroy();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should destroy an instance of keystroke handler', () => {
			const spy = vi.spyOn( view.keystrokes, 'destroy' );

			view.destroy();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'render()', () => {
		it( 'does not crash when a grid is empty', () => {
			const view = new EmojiGridView( locale, {
				emojiCategories: [],
				categoryName: '',
				getEmojiByQuery: vi.fn()
			} );

			const spy = vi.spyOn( view.keystrokes, 'listenTo' );

			view.render();

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( view.element );

			view.destroy();
		} );
	} );

	describe( 'filter()', () => {
		it( 'should filter emojis by query (non empty output)', () => {
			emojiCategories = [
				{
					title: 'faces',
					icon: '😊',
					items: [
						{ 'annotation': 'grinning face', 'emoji': '😀', 'skins': { 'default': '😀' } },
						{ 'annotation': 'thumbs up', 'emoji': '👍', 'skins': { 'default': '👍' } },
						{ 'annotation': 'winking face', 'emoji': '😉', 'skins': { 'default': '😉' } }
					]
				}
			];

			const spy = vi.fn().mockReturnValue( [
				{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
			] );

			const view = new EmojiGridView( locale, { emojiCategories, categoryName: 'faces', getEmojiByQuery: spy } );

			const result = view.filter( new RegExp( 'smile' ) );

			expect( result ).toEqual( { resultsCount: 1, totalItemsCount: 3 } );
			expect( view.isEmpty ).toBe( false );
			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( 'smile' );

			view.destroy();
		} );

		it( 'should filter emojis by query (empty output)', () => {
			emojiCategories = [
				{
					title: 'faces',
					icon: '😊',
					items: [
						{ 'annotation': 'grinning face', 'emoji': '😀', 'skins': { 'default': '😀' } },
						{ 'annotation': 'thumbs up', 'emoji': '👍', 'skins': { 'default': '👍' } },
						{ 'annotation': 'winking face', 'emoji': '😉', 'skins': { 'default': '😉' } }
					]
				}
			];

			const spy = vi.fn().mockReturnValue( [] );

			const view = new EmojiGridView( locale, { emojiCategories, categoryName: 'faces', getEmojiByQuery: spy } );

			const result = view.filter( new RegExp( 'smile' ) );

			expect( result ).toEqual( { resultsCount: 0, totalItemsCount: 3 } );
			expect( view.isEmpty ).toBe( true );
			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( 'smile' );

			view.destroy();
		} );

		it( 'should filter emojis by categories (empty query)', () => {
			emojiCategories = [
				{
					title: 'faces',
					icon: '😊',
					items: []
				}
			];

			const spy = vi.fn().mockReturnValue( [] );

			const view = new EmojiGridView( locale, { emojiCategories, categoryName: 'faces', getEmojiByQuery: spy } );

			const result = view.filter( null );

			expect( result ).toEqual( { resultsCount: 0, totalItemsCount: 0 } );
			expect( view.isEmpty ).toBe( true );
			expect( spy ).toHaveBeenCalledTimes( 0 );

			view.destroy();
		} );

		it( 'should re-use cached tile if it exists', () => {
			emojiCategories = [
				{
					title: 'faces',
					icon: '😊',
					items: [
						{ 'annotation': 'grinning face', 'emoji': '😀', 'skins': { 'default': '😀' } },
						{ 'annotation': 'thumbs up', 'emoji': '👍', 'skins': { 'default': '👍' } },
						{ 'annotation': 'winking face', 'emoji': '😉', 'skins': { 'default': '😉' } }
					]
				}
			];

			const spy = vi.fn().mockReturnValue( [
				{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
			] );

			const view = new EmojiGridView( locale, { emojiCategories, categoryName: 'faces', getEmojiByQuery: spy } );

			expect( view.cachedTiles.length ).toBe( 0 );

			view.filter( new RegExp( 'happy' ) );

			expect( view.cachedTiles.length ).toBe( 1 );
			expect( view.cachedTiles.has( '😀' ) ).toBe( true );

			view.filter( new RegExp( 'smile' ) );

			expect( view.cachedTiles.length ).toBe( 1 );
			expect( view.tiles.get( '😀' ) ).toBe( view.cachedTiles.get( '😀' ) );

			view.destroy();
		} );

		describe( '#focusTracker', () => {
			it( 'should include the added items in focus tracker', () => {
				const spy = vi.spyOn( view.focusTracker, 'add' );

				view.filter( new RegExp( 'smile' ) );

				// `getEmojiByQuery()` returns two items.
				expect( spy ).toHaveBeenCalledTimes( 2 );
			} );

			it( 'should exclude the removed items in focus tracker', () => {
				const spy = vi.spyOn( view.focusTracker, 'remove' );

				view.filter( new RegExp( 'smile' ) );

				// The initial render includes all items from the `faces` category.
				expect( spy ).toHaveBeenCalledTimes( 6 );
			} );
		} );
	} );

	describe( '_createTile()', () => {
		it( 'creates a new tile button', () => {
			const tile = view._createTile( '😊', 'smile' );

			expect( tile ).toBeInstanceOf( ButtonView );
			expect( tile.viewUid ).toBe( '😊' );
			expect( tile.label ).toBe( '😊' );
			expect( tile.tooltip ).toBe( 'smile' );
			expect( tile.withText ).toBe( true );
			expect( tile.element.classList.contains( 'ck-emoji__tile' ) ).toBe( true );
		} );

		it( 'does not use the `[aria-labelled-by]` attribute as the button is descriptive enough', () => {
			const tile = view._createTile( '😊', 'smile' );

			expect( tile.ariaLabel ).toBe( 'smile' );
			expect( tile.ariaLabelledBy ).toBe( undefined );
		} );

		it( 'delegates `execute` from the tile to the grid', () => {
			const tile = view._createTile( '😊', 'smile' );
			const spy = vi.fn();

			view.on( 'execute', spy );
			tile.fire( 'execute' );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( expect.anything(), { name: 'smile', emoji: '😊' } );
		} );

		it( 'adds created tile to the collection of cached tiles', () => {
			expect( view.cachedTiles.has( '😊' ) ).toBe( false );

			const tile = view._createTile( '😊', 'smile' );

			expect( view.cachedTiles.has( '😊' ) ).toBe( true );
			expect( view.cachedTiles.get( '😊' ) ).toBe( tile );
		} );
	} );
} );
