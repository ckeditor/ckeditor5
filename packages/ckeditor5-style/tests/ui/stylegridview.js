/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ViewCollection } from '@ckeditor/ckeditor5-ui';
import { Locale, FocusTracker, KeystrokeHandler, keyCodes } from '@ckeditor/ckeditor5-utils';

import { StyleGridButtonView } from '../../src/ui/stylegridbuttonview.js';
import { StyleGridView } from '../../src/ui/stylegridview.js';

describe( 'StyleGridView', () => {
	let locale, grid;

	beforeEach( async () => {
		locale = new Locale();
		grid = new StyleGridView( locale, [
			{
				name: 'Red heading',
				element: 'h2',
				classes: [ 'red-heading' ],
				previewTemplate: {
					tag: 'h2',
					attributes: {
						class: 'red-heading'
					},
					children: [
						{ text: 'AaBbCcDdEeFfGgHhIiJj' }
					]
				}
			},
			{
				name: 'Large heading',
				element: 'h2',
				classes: [ 'large-heading' ],
				previewTemplate: {
					tag: 'h2',
					attributes: {
						class: 'large-heading'
					},
					children: [
						{ text: 'AaBbCcDdEeFfGgHhIiJj' }
					]
				}
			}
		] );
	} );

	afterEach( async () => {
		grid.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'should have #focusTracker', () => {
			expect( grid.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should have #keystrokes', () => {
			expect( grid.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should set #children', () => {
			expect( grid.children ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should set #activeStyles', () => {
			expect( grid.activeStyles ).toEqual( [] );
		} );

		it( 'should set #enabledStyles', () => {
			expect( grid.enabledStyles ).toEqual( [] );
		} );

		it( 'should delegate #execute from #children', () => {
			const spy = vi.fn();

			grid.on( 'execute', spy );
			grid.children.first.fire( 'execute', 'foo' );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( expect.any( Object ) );
			expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( 'foo' );
		} );

		it( 'should create #children from style definitions', () => {
			for ( const child of grid.children ) {
				expect( child ).toBeInstanceOf( StyleGridButtonView );
			}

			expect( grid.children.map( ( { label } ) => label ) ).toEqual( [ 'Red heading', 'Large heading' ] );
		} );

		it( 'should change #isOn state of #children depending on #activeStyles', () => {
			grid.activeStyles = [];

			expect( grid.children.map( ( { isOn } ) => isOn ) ).toEqual( [ false, false ] );

			grid.activeStyles = [ 'Large heading' ];

			expect( grid.children.map( ( { isOn } ) => isOn ) ).toEqual( [ false, true ] );
		} );

		it( 'should change #isEnabled state of #children depending on #enabledStyles', () => {
			grid.enabledStyles = [];

			expect( grid.children.map( ( { isEnabled } ) => isEnabled ) ).toEqual( [ false, false ] );

			grid.enabledStyles = [ 'Large heading' ];

			expect( grid.children.map( ( { isEnabled } ) => isEnabled ) ).toEqual( [ false, true ] );
		} );

		it( 'should be a <div>', () => {
			grid.render();

			expect( grid.element.tagName ).toBe( 'DIV' );
		} );

		it( 'should have a static CSS class', () => {
			grid.render();

			expect( grid.element.classList.contains( 'ck' ) ).toBe( true );
			expect( grid.element.classList.contains( 'ck-style-grid' ) ).toBe( true );
		} );

		it( 'should have a role attribute', () => {
			grid.render();

			expect( grid.element.getAttribute( 'role' ) ).toBe( 'listbox' );
		} );

		it( 'should have children in DOM', () => {
			grid.render();

			expect( grid.element.firstChild ).toBe( grid.children.first.element );
			expect( grid.element.lastChild ).toBe( grid.children.last.element );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register styleGridView children elements in #focusTracker', () => {
			const grid = new StyleGridView( new Locale(), [
				{
					name: 'Red heading',
					element: 'h2',
					classes: [ 'red-heading' ],
					previewTemplate: {
						tag: 'h2',
						attributes: {
							class: 'red-heading'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				},
				{
					name: 'Large heading',
					element: 'h2',
					classes: [ 'large-heading' ],
					previewTemplate: {
						tag: 'h2',
						attributes: {
							class: 'large-heading'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				}
			] );

			const spyView = vi.spyOn( grid.focusTracker, 'add' );

			grid.render();

			expect( spyView ).toHaveBeenNthCalledWith( 1, grid.children.first.element );
			expect( spyView ).toHaveBeenNthCalledWith( 2, grid.children.last.element );

			grid.destroy();
		} );

		describe( 'keyboard navigation in the grid', () => {
			let grid;

			beforeEach( async () => {
				grid = new StyleGridView( locale, [
					{
						name: 'Red heading',
						element: 'h2',
						classes: [ 'red-heading' ],
						previewTemplate: {
							tag: 'h2',
							attributes: {
								class: 'red-heading'
							},
							children: [
								{ text: 'AaBbCcDdEeFfGgHhIiJj' }
							]
						}
					},
					{
						name: 'Yellow heading',
						element: 'h2',
						classes: [ 'yellow-heading' ],
						previewTemplate: {
							tag: 'h2',
							attributes: {
								class: 'yellow-heading'
							},
							children: [
								{ text: 'AaBbCcDdEeFfGgHhIiJj' }
							]
						}
					},
					{
						name: 'Green heading',
						element: 'h2',
						classes: [ 'green-heading' ],
						previewTemplate: {
							tag: 'h2',
							attributes: {
								class: 'green-heading'
							},
							children: [
								{ text: 'AaBbCcDdEeFfGgHhIiJj' }
							]
						}
					},
					{
						name: 'Large heading',
						element: 'h2',
						classes: [ 'large-heading' ],
						previewTemplate: {
							tag: 'h2',
							attributes: {
								class: 'large-heading'
							},
							children: [
								{ text: 'AaBbCcDdEeFfGgHhIiJj' }
							]
						}
					}
				] );

				grid.render();
			} );

			afterEach( async () => {
				grid.destroy();
				vi.restoreAllMocks();
			} );

			it( '"arrow right" should focus the next focusable style', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the first color button is focused.
				grid.focusTracker.isFocused = true;
				grid.focusTracker.focusedElement = grid.children.first.element;

				const spy = vi.spyOn( grid.children.get( 1 ), 'focus' );

				grid.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( '"arrow down" should focus the focusable style in the second row', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the first color button is focused.
				grid.focusTracker.isFocused = true;
				grid.focusTracker.focusedElement = grid.children.first.element;

				const spy = vi.spyOn( grid.children.get( 3 ), 'focus' );

				grid.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		it( 'starts listening for #keystrokes coming from the #element of the grid view', () => {
			const grid = new StyleGridView( locale, [
				{
					name: 'Red heading',
					element: 'h2',
					classes: [ 'red-heading' ],
					previewTemplate: {
						tag: 'h2',
						attributes: {
							class: 'red-heading'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				},
				{
					name: 'Large heading',
					element: 'h2',
					classes: [ 'large-heading' ],
					previewTemplate: {
						tag: 'h2',
						attributes: {
							class: 'large-heading'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				}
			] );

			const spy = vi.spyOn( grid.keystrokes, 'listenTo' );

			grid.render();

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( grid.element );

			grid.destroy();
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first style', () => {
			const spy = vi.spyOn( grid.children.first, 'focus' );

			grid.focus();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = vi.spyOn( grid.focusTracker, 'destroy' );

			grid.destroy();

			expect( destroySpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = vi.spyOn( grid.keystrokes, 'destroy' );

			grid.destroy();

			expect( destroySpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
