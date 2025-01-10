/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, window */

import EmojiGridView from '../../src/ui/emojigridview.js';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

describe( 'EmojiGridView', () => {
	let view, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			t: str => str
		};

		view = new EmojiGridView( locale );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates view#tiles collection', () => {
			expect( view.tiles ).to.be.instanceOf( ViewCollection );
		} );

		it( 'creates #element from template', () => {
			const tile = view.createTile( '😊', 'smile' );
			const tilesElement = view.element.firstChild;

			view.tiles.add( tile );

			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-emoji-grid' ) ).to.be.true;

			expect( tilesElement.classList.contains( 'ck' ) ).to.be.true;
			expect( tilesElement.classList.contains( 'ck-emoji-grid__tiles' ) ).to.be.true;

			expect( tile.element.parentNode ).to.equal( tilesElement );
		} );

		describe( 'Focus management across the grid items using arrow keys', () => {
			let view;

			beforeEach( () => {
				view = new EmojiGridView( locale );

				createTilesForGrid( view );

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
						.getComputedStyle( view.element.firstChild ) // Responsive .ck-emoji-grid__tiles
						.getPropertyValue( 'grid-template-columns' )
						.split( ' ' )
						.length;

					const keyEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

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
				} );

				it( '"arrow right" should focus the next focusable grid item', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowright,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

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
			const tile = view.createTile( '😊', 'smile' );

			expect( tile ).to.be.instanceOf( ButtonView );
			expect( tile.label ).to.equal( '😊' );
			expect( tile.withText ).to.be.true;
			expect( tile.class ).to.equal( 'ck-emoji-grid__tile' );
		} );

		it( 'delegates #execute from the tile to the grid', () => {
			const tile = view.createTile( '😊', 'smile' );
			const spy = sinon.spy();

			view.on( 'execute', spy );
			tile.fire( 'execute' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, sinon.match.any, { name: 'smile', emoji: '😊' } );
		} );

		it( 'delegates #tileHover from the tile to the grid on hover the tile', () => {
			const tile = view.createTile( '😊', 'smile' );
			const spy = sinon.spy();

			view.on( 'tileHover', spy );
			tile.fire( 'mouseover' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, sinon.match.any, { name: 'smile', emoji: '😊' } );
		} );

		it( 'delegates #tileFocus from the tile to the grid on focus the tile', () => {
			const tile = view.createTile( '😊', 'smile' );
			const spy = sinon.spy();

			view.on( 'tileFocus', spy );
			tile.fire( 'focus' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, sinon.match.any, { name: 'smile', emoji: '😊' } );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first tile', () => {
			const tile = view.createTile( '😊', 'smile' );
			const spy = sinon.spy( tile, 'focus' );

			view.tiles.add( tile );
			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'render()', () => {
		describe( 'FocusTracker', () => {
			it( 'should add tiles to focus tracker when tiles are added to #tiles', () => {
				const tile = view.createTile( '😊', 'smile' );
				const spy = sinon.spy( view.focusTracker, 'add' );

				view.tiles.add( tile );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should remove tiles from focus tracker when tiles are removed from #tiles', () => {
				const tile = view.createTile( '😊', 'smile' );

				view.tiles.add( tile );

				const spy = sinon.spy( view.focusTracker, 'remove' );

				view.tiles.remove( tile );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	function createTilesForGrid( gridView ) {
		for ( let i = 0; i < 51; i++ ) {
			gridView.tiles.add( gridView.createTile( '😊', 'smile' ) );
		}
	}
} );
