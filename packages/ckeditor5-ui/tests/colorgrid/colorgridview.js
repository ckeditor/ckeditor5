/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ColorGridView } from './../../src/colorgrid/colorgridview.js';
import { ColorTileView } from '../../src/colorgrid/colortileview.js';

import { ViewCollection } from '../../src/viewcollection.js';
import { FocusTracker, KeystrokeHandler, keyCodes } from '@ckeditor/ckeditor5-utils';

describe( 'ColorGridView', () => {
	let locale, view;

	const colorDefinitions = [
		{
			color: '#000',
			label: 'Black',
			options: {
				hasBorder: false
			}
		},
		{
			color: 'rgb(255, 255, 255)',
			label: 'White',
			options: {
				hasBorder: true
			}
		},
		{
			color: 'red',
			label: 'Red',
			options: {
				hasBorder: false
			}
		}
	];

	beforeEach( () => {
		locale = { t() {} };
		view = new ColorGridView( locale, { colorDefinitions } );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-color-grid' ) ).toBe( true );
		} );

		it( 'uses the options#columns to control the grid', () => {
			const view = new ColorGridView( locale, { columns: 3 } );
			view.render();

			// Note: Different browsers use different value optimization.
			expect( [ '1fr 1fr 1fr', 'repeat(3, 1fr)' ] ).toContain( view.element.style.gridTemplateColumns );

			view.destroy();
		} );

		it( 'creates the view without provided color definitions', () => {
			const view = new ColorGridView( locale );
			view.render();

			expect( view.items ).toHaveLength( 0 );

			view.destroy();
		} );

		it( 'creates view collection with children', () => {
			expect( view.items ).toBeInstanceOf( ViewCollection );
		} );

		it( 'creates focus tracker', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'creates keystroke handler', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'reacts to changes in #selectedColor by setting the item#isOn', () => {
			expect( view.items.map( item => item ).some( item => item.isOn ) ).toBe( false );

			view.selectedColor = 'red';

			expect( view.items.get( 2 ).isOn ).toBe( true );

			view.selectedColor = 'rgb(255, 255, 255)';

			expect( view.items.get( 1 ).isOn ).toBe( true );
			expect( view.items.get( 2 ).isOn ).toBe( false );
		} );

		it( 'should determine #isOn value when a ColorTileView is added', () => {
			view.selectedColor = 'gold';

			const tile = new ColorTileView();
			tile.set( {
				color: 'gold',
				label: 'Gold',
				options: {
					hasBorder: false
				}
			} );

			view.items.add( tile );

			expect( view.items.get( 3 ).isOn ).toBe( true );
		} );

		describe( 'add colors from definition as child items', () => {
			it( 'has proper number of elements', () => {
				expect( view.items.length ).toEqual( 3 );
			} );

			colorDefinitions.forEach( ( color, index ) => {
				describe( 'child items has proper attributes', () => {
					it( `for (index: ${ index }, color: ${ color.color }) child`, () => {
						const colorTile = view.items.get( index );

						expect( colorTile ).toBeInstanceOf( ColorTileView );
						expect( colorTile.color ).toEqual( color.color );
					} );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		describe( 'Focus management across the grid items using arrow keys', () => {
			let view;

			beforeEach( () => {
				view = new ColorGridView( locale, { colorDefinitions, columns: 2 } );

				view.render();
				document.body.appendChild( view.element );
			} );

			afterEach( () => {
				view.element.remove();
				view.destroy();
			} );

			it( '"arrow right" should focus the next focusable grid item', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the first grid item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.first.element;

				const spy = vi.spyOn( view.items.get( 1 ), 'focus' );

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
				view.focusTracker.focusedElement = view.items.first.element;

				const spy = vi.spyOn( view.items.get( 2 ), 'focus' );

				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = vi.spyOn( view.focusTracker, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = vi.spyOn( view.keystrokes, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'execute()', () => {
		it( 'fires event for rendered tiles', () => {
			const spy = vi.fn();
			const firstTile = view.items.first;

			view.on( 'execute', spy );

			firstTile.isEnabled = true;

			firstTile.element.dispatchEvent( new Event( 'click' ) );
			expect( spy ).toHaveBeenCalledTimes( 1 );

			firstTile.isEnabled = false;

			firstTile.element.dispatchEvent( new Event( 'click' ) );
			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'focus', () => {
		it( 'focuses the tile in DOM', () => {
			const spy = vi.spyOn( view.items.first, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();

			view.items.clear();
			view.focus();

			expect( view.items.length ).toEqual( 0 );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'focuses last the tile in DOM', () => {
			const spy = vi.spyOn( view.items.last, 'focus' );

			view.focusLast();

			expect( spy ).toHaveBeenCalledOnce();

			view.items.clear();
			view.focusLast();

			expect( view.items.length ).toEqual( 0 );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		describe( 'update elements in focus tracker', () => {
			it( 'adding new element', () => {
				const spy = vi.spyOn( view.focusTracker, 'add' );

				const colorTile = new ColorTileView();
				colorTile.set( {
					color: 'yellow',
					label: 'Yellow',
					tooltip: true,
					options: {
						hasBorder: false
					}
				} );
				view.items.add( colorTile );

				expect( view.items.length ).toEqual( 4 );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'removes element', () => {
				const spy = vi.spyOn( view.focusTracker, 'remove' );

				view.items.remove( view.items.length - 1 );

				expect( view.items.length ).toEqual( 2 );
				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );
} );
