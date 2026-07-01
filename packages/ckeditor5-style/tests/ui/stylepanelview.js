/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FocusCycler, ViewCollection } from '@ckeditor/ckeditor5-ui';
import { FocusTracker, KeystrokeHandler, Locale, keyCodes } from '@ckeditor/ckeditor5-utils';

import { StyleGroupView } from '../../src/ui/stylegroupview.js';
import { StylePanelView } from '../../src/ui/stylepanelview.js';

describe( 'StylePanelView', () => {
	let locale, panel;

	beforeEach( async () => {
		locale = new Locale();
		panel = new StylePanelView( locale, {
			block: [
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
			],
			inline: [
				{
					name: 'Deleted text',
					element: 'span',
					classes: [ 'deleted' ],
					previewTemplate: {
						tag: 'span',
						attributes: {
							class: 'deleted'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				},
				{
					name: 'Cited work',
					element: 'span',
					classes: [ 'cited', 'another-class' ],
					previewTemplate: {
						tag: 'span',
						attributes: {
							class: [ 'cited', 'another-class' ]
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				},
				{
					name: 'Small text',
					element: 'span',
					classes: [ 'small' ],
					previewTemplate: {
						tag: 'span',
						attributes: {
							class: 'small'
						},
						children: [
							{ text: 'AaBbCcDdEeFfGgHhIiJj' }
						]
					}
				}
			]
		} );
	} );

	afterEach( async () => {
		panel.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'should create #focusTracker instance', () => {
			expect( panel.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( panel.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should set #children', () => {
			expect( panel.children ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should set #blockStylesGroupView', () => {
			expect( panel.blockStylesGroupView ).toBeInstanceOf( StyleGroupView );
			expect( panel.blockStylesGroupView.labelView.text ).toBe( 'Block styles' );
			expect( panel.blockStylesGroupView.gridView.children.length ).toBe( 2 );
		} );

		it( 'should set #inlineStylesGroupView', () => {
			expect( panel.inlineStylesGroupView ).toBeInstanceOf( StyleGroupView );
			expect( panel.inlineStylesGroupView.labelView.text ).toBe( 'Text styles' );
			expect( panel.inlineStylesGroupView.gridView.children.length ).toBe( 3 );
		} );

		it( 'should set #activeStyles', () => {
			expect( panel.activeStyles ).toEqual( [] );
		} );

		it( 'should set #enabledStyles', () => {
			expect( panel.enabledStyles ).toEqual( [] );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( panel._focusCycler ).toBeInstanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( panel._focusables ).toBeInstanceOf( ViewCollection );
		} );

		describe( 'style groups', () => {
			it( 'should add #blockStylesGroupView to #children when there are block definitions', () => {
				expect( panel.children.first ).toBe( panel.blockStylesGroupView );
			} );

			it( 'should add #inlineStylesGroupView to #children when there are inline definitions', () => {
				expect( panel.children.last ).toBe( panel.inlineStylesGroupView );
			} );

			it( 'should not add #blockStylesGroupView to #children when there are no block definitions', () => {
				const panel = new StylePanelView( locale, {
					block: [],
					inline: [
						{
							name: 'Deleted text',
							element: 'span',
							classes: [ 'deleted' ],
							previewTemplate: {
								tag: 'span',
								attributes: {
									class: 'deleted'
								},
								children: [
									{ text: 'AaBbCcDdEeFfGgHhIiJj' }
								]
							}
						}
					]
				} );

				expect( panel.children.first ).toBe( panel.inlineStylesGroupView );
				expect( panel.children.last ).toBe( panel.inlineStylesGroupView );

				panel.destroy();
			} );

			it( 'should not add #inlineStylesGroupView to #children when there are no inline definitions', () => {
				const panel = new StylePanelView( locale, {
					block: [
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
					],
					inline: []
				} );

				expect( panel.children.first ).toBe( panel.blockStylesGroupView );
				expect( panel.children.last ).toBe( panel.blockStylesGroupView );

				panel.destroy();
			} );

			it( 'should delegate #execute from #blockStylesGroupView grid', () => {
				const spy = vi.fn();

				panel.on( 'execute', spy );
				panel.blockStylesGroupView.gridView.fire( 'execute', 'foo' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( expect.any( Object ) );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( 'foo' );
			} );

			it( 'should delegate #execute from #inlineStylesGroupView grid', () => {
				const spy = vi.fn();

				panel.on( 'execute', spy );
				panel.inlineStylesGroupView.gridView.fire( 'execute', 'foo' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( expect.any( Object ) );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( 'foo' );
			} );

			it( 'should bind #activeStyles and #enabledStyles to #blockStylesGroupView grid', () => {
				panel.activeStyles = [ 'foo', 'bar' ];
				panel.enabledStyles = [ 'baz', 'qux' ];

				expect( panel.blockStylesGroupView.gridView.activeStyles ).toEqual( [ 'foo', 'bar' ] );
				expect( panel.blockStylesGroupView.gridView.enabledStyles ).toEqual( [ 'baz', 'qux' ] );

				panel.activeStyles = [ 'a' ];
				panel.enabledStyles = [];

				expect( panel.blockStylesGroupView.gridView.activeStyles ).toEqual( [ 'a' ] );
				expect( panel.blockStylesGroupView.gridView.enabledStyles ).toEqual( [] );
			} );

			it( 'should bind #activeStyles and #enabledStyles to #inlineStylesGroupView grid', () => {
				panel.activeStyles = [ 'foo', 'bar' ];
				panel.enabledStyles = [ 'baz', 'qux' ];

				expect( panel.inlineStylesGroupView.gridView.activeStyles ).toEqual( [ 'foo', 'bar' ] );
				expect( panel.inlineStylesGroupView.gridView.enabledStyles ).toEqual( [ 'baz', 'qux' ] );

				panel.activeStyles = [ 'a' ];
				panel.enabledStyles = [];

				expect( panel.inlineStylesGroupView.gridView.activeStyles ).toEqual( [ 'a' ] );
				expect( panel.inlineStylesGroupView.gridView.enabledStyles ).toEqual( [] );
			} );
		} );

		it( 'should be a <div>', () => {
			panel.render();

			expect( panel.element.tagName ).toBe( 'DIV' );
		} );

		it( 'should have a static CSS class', () => {
			panel.render();

			expect( panel.element.classList.contains( 'ck-style-panel' ) ).toBe( true );
		} );

		describe( 'focus management', () => {
			beforeEach( () => {
				panel.render();
				document.body.appendChild( panel.element );
			} );

			afterEach( () => {
				panel.element.remove();
			} );

			describe( 'keyboard navigation between style groups in the panel', () => {
				it( 'should focus the next focusable item on "tab"', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the first style grid is focused.
					panel.focusTracker.isFocused = true;
					panel.focusTracker.focusedElement = panel.blockStylesGroupView.gridView.element;

					const spy = vi.spyOn( panel.inlineStylesGroupView.gridView, 'focus' );

					panel.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );

				it( 'should focus the previous focusable item on "sfift + tab"', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the first style grid is focused.
					panel.focusTracker.isFocused = true;
					panel.focusTracker.focusedElement = panel.blockStylesGroupView.gridView.element;

					const spy = vi.spyOn( panel.inlineStylesGroupView.gridView, 'focus' );

					panel.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );

			describe( 'focus()', () => {
				it( 'should focus the first grid', () => {
					const spy = vi.spyOn( panel.blockStylesGroupView.gridView, 'focus' );

					panel.focus();

					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );

			describe( 'focusLast()', () => {
				it( 'should focus the last grid', () => {
					const spy = vi.spyOn( panel.inlineStylesGroupView.gridView, 'focus' );

					panel.focusLast();

					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		beforeEach( () => {
			panel.render();
			document.body.appendChild( panel.element );
		} );

		afterEach( () => {
			panel.element.remove();
		} );

		it( 'should register styleGroupView grids in #_focusables', () => {
			expect( panel._focusables.map( f => f ) ).toHaveLength( 2 );
			expect( panel._focusables.map( f => f ) ).toEqual( expect.arrayContaining( [
				panel.blockStylesGroupView.gridView,
				panel.inlineStylesGroupView.gridView
			] ) );
		} );

		it( 'should register styleGroupView grid elements in #focusTracker', () => {
			const panel = new StylePanelView( locale, {
				block: [
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
					}
				],
				inline: [
					{
						name: 'Deleted text',
						element: 'span',
						classes: [ 'deleted' ],
						previewTemplate: {
							tag: 'span',
							attributes: {
								class: 'deleted'
							},
							children: [
								{ text: 'AaBbCcDdEeFfGgHhIiJj' }
							]
						}
					}
				]
			} );

			const spyView = vi.spyOn( panel.focusTracker, 'add' );

			panel.render();

			expect( spyView ).toHaveBeenNthCalledWith( 1, panel.blockStylesGroupView.gridView.element );
			expect( spyView ).toHaveBeenNthCalledWith( 2, panel.inlineStylesGroupView.gridView.element );

			panel.destroy();
		} );
	} );
} );
