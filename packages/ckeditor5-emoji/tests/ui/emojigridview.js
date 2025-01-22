/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, window */

import EmojiGridView from '../../src/ui/emojigridview.js';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

describe( 'EmojiGridView', () => {
	let view, locale, emojiGroups;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: str => str
		};

		emojiGroups = [
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
			emojiGroups,
			categoryName: 'faces',
			skinTone: 'default',
			getEmojiBySearchQuery: () => [
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
		it( 'creates view#tiles collection', () => {
			expect( view.tiles ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates #element from template', () => {
			expect( view.element.getAttribute( 'role' ) ).to.equal( 'tabpanel' );
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-emoji__tiles' ) ).to.be.true;

			const tilesContainer = view.element.firstChild;

			expect( tilesContainer.getAttribute( 'role' ) ).to.equal( 'grid' );
			expect( tilesContainer.classList.contains( 'ck' ) ).to.be.true;
			expect( tilesContainer.classList.contains( 'ck-emoji__grid' ) ).to.be.true;
		} );

		describe( 'Focus management across the grid items using arrow keys', () => {
			let view;

			beforeEach( () => {
				view = new EmojiGridView( locale, {
					emojiGroups,
					categoryName: 'faces',
					skinTone: 'default',
					getEmojiBySearchQuery: () => [
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
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					view.filter( new RegExp( 'smile' ) );

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = sinon.spy( view.tiles.get( 1 ), 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );

				it( '"arrow down" should focus the focusable grid item in the second row', () => {
					const numberOfColumns = window
						.getComputedStyle( view.element.firstChild ) // Responsive `.ck-emoji__tile`.
						.getPropertyValue( 'grid-template-columns' )
						.split( ' ' )
						.length;

					const keyEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					view.filter( new RegExp( 'smile' ) );

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = sinon.spy( view.tiles.get( numberOfColumns ), 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
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
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					view.filter( new RegExp( 'smile' ) );

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = sinon.spy( view.tiles.get( 1 ), 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );

				it( '"arrow down" should focus the focusable grid item in the second row', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					view.filter( new RegExp( 'smile' ) );

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = sinon.spy( view.tiles.get( 5 ), 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );
			} );
		} );
	} );

	describe( 'createTile()', () => {
		it( 'creates a new tile button', () => {
			const tile = view._createTile( '😊', 'smile' );

			expect( tile ).to.be.instanceOf( ButtonView );
			expect( tile.label ).to.equal( '😊' );
			expect( tile.withText ).to.be.true;
			expect( tile.class ).to.equal( 'ck-emoji__tile' );
		} );

		it( 'delegates #execute from the tile to the grid', () => {
			const tile = view._createTile( '😊', 'smile' );
			const spy = sinon.spy();

			view.on( 'execute', spy );
			tile.fire( 'execute' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, sinon.match.any, { name: 'smile', emoji: '😊' } );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first tile', () => {
			view.filter( new RegExp( 'smile' ) );

			const spy = sinon.spy( view.tiles.first, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'render()', () => {
		describe( 'FocusTracker', () => {
			it( 'should add tiles to focus tracker when tiles are added to #tiles', () => {
				const spy = sinon.spy( view.focusTracker, 'add' );

				view.filter( new RegExp( 'smile' ) );

				view.categoryName = 'food';

				sinon.assert.calledTwice( spy );
			} );

			it( 'should remove tiles from focus tracker when tiles are removed from #tiles', () => {
				const spy = sinon.spy( view.focusTracker, 'remove' );

				view.filter( new RegExp( 'smile' ) );

				sinon.assert.callCount( spy, 6 );
			} );
		} );
	} );

	describe( 'filter()', () => {
		it( 'should filter emojis by query (non empty output)', () => {
			emojiGroups = [
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

			const spy = sinon.stub().returns( [
				{ 'annotation': 'grinning face', 'emoji': '😀', skins: { 'default': '😀' } }
			] );

			view = new EmojiGridView( locale, { emojiGroups, categoryName: 'faces', getEmojiBySearchQuery: spy } );

			const result = view.filter( new RegExp( 'smile' ) );

			expect( result ).to.deep.equal( { resultsCount: 1, totalItemsCount: 3 } );
			expect( view.isEmpty ).is.equal( false );
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, 'smile' );
		} );

		it( 'should filter emojis by query (empty output)', () => {
			emojiGroups = [
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

			const spy = sinon.stub().returns( [] );

			view = new EmojiGridView( locale, { emojiGroups, categoryName: 'faces', getEmojiBySearchQuery: spy } );

			const result = view.filter( new RegExp( 'smile' ) );

			expect( result ).to.deep.equal( { resultsCount: 0, totalItemsCount: 3 } );
			expect( view.isEmpty ).is.equal( true );
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, 'smile' );
		} );

		it( 'should filter emojis by categories (empty query)', () => {
			emojiGroups = [
				{
					title: 'faces',
					icon: '😊',
					items: []
				}
			];

			const spy = sinon.stub().returns( [] );

			view = new EmojiGridView( locale, { emojiGroups, categoryName: 'faces', getEmojiBySearchQuery: spy } );

			const result = view.filter( null );

			expect( result ).to.deep.equal( { resultsCount: 0, totalItemsCount: 0 } );
			expect( view.isEmpty ).is.equal( true );
			sinon.assert.callCount( spy, 0 );
		} );
	} );
} );
