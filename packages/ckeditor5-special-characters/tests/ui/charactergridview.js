/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CharacterGridView } from '../../src/ui/charactergridview.js';
import { ViewCollection, ButtonView } from '@ckeditor/ckeditor5-ui';
import { keyCodes } from '@ckeditor/ckeditor5-utils';

describe( 'CharacterGridView', () => {
	let view;

	beforeEach( () => {
		view = new CharacterGridView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'creates view#tiles collection', () => {
			expect( view.tiles ).toBeInstanceOf( ViewCollection );
		} );

		it( 'creates #element from template', () => {
			const tile = view.createTile( 'ε', 'foo bar baz' );
			const tilesElement = view.element.firstChild;

			view.tiles.add( tile );

			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-character-grid' ) ).toBe( true );

			expect( tilesElement.classList.contains( 'ck' ) ).toBe( true );
			expect( tilesElement.classList.contains( 'ck-character-grid__tiles' ) ).toBe( true );

			expect( tile.element.parentNode ).toBe( tilesElement );
		} );

		describe( 'Focus management across the grid items using arrow keys', () => {
			let view, parentContainer;

			beforeEach( () => {
				view = new CharacterGridView();

				createTilesForGrid( view );

				view.render();

				parentContainer = document.createElement( 'div' );
				parentContainer.style.width = '800px';

				parentContainer.appendChild( view.element );
				document.body.appendChild( parentContainer );
			} );

			afterEach( () => {
				view.element.remove();
				parentContainer.remove();
				view.destroy();
			} );

			describe( 'Default grid - responsive number of tiles depending on width', () => {
				it( '"arrow right" should focus the next focusable grid item', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowright,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = vi.spyOn( view.tiles.get( 1 ), 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( '"arrow down" should focus the focusable grid item in the second row', () => {
					const numberOfColumns = window
						.getComputedStyle( view.element.firstChild ) // Responsive .ck-character-grid__tiles
						.getPropertyValue( 'grid-template-columns' )
						.split( ' ' )
						.length;

					const keyEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = vi.spyOn( view.tiles.get( numberOfColumns ), 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
					expect( spy ).toHaveBeenCalledOnce();
				} );
			} );

			describe( 'Responsive grid - changed to 5 tiles in a row instead of 10', () => {
				beforeEach( () => {
					view.element.firstChild.style.gridTemplateColumns = 'repeat(5, 1fr)';
				} );

				it( '"arrow right" should focus the next focusable grid item', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowright,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = vi.spyOn( view.tiles.get( 1 ), 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( '"arrow down" should focus the focusable grid item in the second row', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the first grid item is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.tiles.first.element;

					const spy = vi.spyOn( view.tiles.get( 5 ), 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
					expect( spy ).toHaveBeenCalledOnce();
				} );
			} );
		} );
	} );

	describe( 'createTile()', () => {
		it( 'creates a new tile button', () => {
			const tile = view.createTile( 'ε', 'foo bar baz' );

			expect( tile ).toBeInstanceOf( ButtonView );
			expect( tile.label ).toBe( 'ε' );
			expect( tile.withText ).toBe( true );
			expect( tile.class ).toBe( 'ck-character-grid__tile' );
		} );

		it( 'delegates #execute from the tile to the grid', () => {
			const tile = view.createTile( 'ε', 'foo bar baz' );
			const spy = vi.fn();

			view.on( 'execute', spy );
			tile.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( expect.anything(), { name: 'foo bar baz', character: 'ε' } );
		} );

		it( 'delegates #tileHover from the tile to the grid on hover the tile', () => {
			const tile = view.createTile( 'ε', 'foo bar baz' );
			const spy = vi.fn();

			view.on( 'tileHover', spy );
			tile.fire( 'mouseover' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( expect.anything(), { name: 'foo bar baz', character: 'ε' } );
		} );

		it( 'delegates #tileFocus from the tile to the grid on focus the tile', () => {
			const tile = view.createTile( 'ε', 'foo bar baz' );
			const spy = vi.fn();

			view.on( 'tileFocus', spy );
			tile.fire( 'focus' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( expect.anything(), { name: 'foo bar baz', character: 'ε' } );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first tile', () => {
			const tile = view.createTile( 'ε', 'foo bar baz' );
			const spy = vi.spyOn( tile, 'focus' );

			view.tiles.add( tile );
			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'render()', () => {
		describe( 'FocusTracker', () => {
			it( 'should add tiles to focus tracker when tiles are added to #tiles', () => {
				const tile = view.createTile( 'ε', 'foo bar baz' );
				const spy = vi.spyOn( view.focusTracker, 'add' );

				view.tiles.add( tile );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should remove tiles from focus tracker when tiles are removed from #tiles', () => {
				const tile = view.createTile( 'ε', 'foo bar baz' );

				view.tiles.add( tile );

				const spy = vi.spyOn( view.focusTracker, 'remove' );

				view.tiles.remove( tile );

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	function createTilesForGrid( gridView ) {
		for ( let i = 0; i < 51; i++ ) {
			gridView.tiles.add( gridView.createTile( 'ε', 'foo bar baz' ) );
		}
	}
} );
