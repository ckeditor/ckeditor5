/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ViewCollection, ButtonView } from '@ckeditor/ckeditor5-ui';
import { InsertTableView } from '../../src/ui/inserttableview.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils';

describe( 'InsertTableView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t() {} };

		view = new InsertTableView( locale );
		view.render();

		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).toBe( locale );
		} );

		it( 'sets view#rows to 0', () => {
			expect( view.rows ).toBe( 0 );
		} );

		it( 'sets view#columns to 0', () => {
			expect( view.columns ).toBe( 0 );
		} );

		it( 'sets #label to default rows & columns', () => {
			expect( view.label ).toBe( '0 × 0' );
		} );

		it( 'creates #element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.children ).toHaveLength( 2 );
			expect( view.element.children[ 0 ].classList.contains( 'ck-insert-table-dropdown__grid' ) ).toBe( true );
			expect( view.element.children[ 1 ].classList.contains( 'ck-insert-table-dropdown__label' ) ).toBe( true );
		} );

		describe( 'view#items collection', () => {
			it( 'should be created', () => {
				expect( view.items ).toBeInstanceOf( ViewCollection );
				expect( view.items ).toHaveLength( 100 );
			} );

			it( 'should create items from template', () => {
				expect( Array.from( view.items ).every(
					item => item.element.classList.contains( 'ck' )
				) ).toBe( true );

				expect( Array.from( view.items ).every(
					item => item.element.classList.contains( 'ck-insert-table-dropdown-grid-box' )
				) ).toBe( true );

				expect( Array.from( view.items ).every(
					item => item.element.getAttribute( 'tabindex' ) === '-1'
				) ).toBe( true );

				expect( Array.from( view.items ).every(
					item => 'row' in item.element.dataset
				) ).toBe( true );

				expect( Array.from( view.items ).every(
					item => 'column' in item.element.dataset
				) ).toBe( true );
			} );

			it( 'every item should be the #ButtonView instance', () => {
				expect( Array.from( view.items ).every(
					item => item instanceof ButtonView
				) ).toBe( true );

				expect( Array.from( view.items ).every(
					item => item.withText === false
				) ).toBe( true );

				expect( Array.from( view.items ).every(
					( item, index ) => {
						const row = Math.ceil( ( index + 1 ) / 10 );
						const col = ( index % 10 ) + 1;
						const labelToCompare = `${ row } × ${ col }`;

						return item.label === labelToCompare;
					}
				) ).toBe( true );
			} );
		} );

		it( 'should not throw error for DropdownPanelFocusable interface methods', () => {
			expect( () => view.focus() ).not.toThrow();
			expect( () => view.focusLast() ).not.toThrow();
		} );

		describe( 'view#items bindings', () => {
			it( 'updates view#height & view#width on DOM "mouseover" event', () => {
				const boxView = view.items.get( 0 );

				expect( boxView.isOn ).toBe( false );

				boxView.element.dispatchEvent( new Event( 'mouseover', { bubbles: true } ) );

				expect( boxView.isOn ).toBe( true );

				expect( view.rows ).toBe( 1 );
				expect( view.columns ).toBe( 1 );

				const boxViewB = view.items.get( 22 );

				boxViewB.element.dispatchEvent( new Event( 'mouseover', { bubbles: true } ) );

				expect( view.rows ).toBe( 3 );
				expect( view.columns ).toBe( 3 );
			} );
		} );

		describe( 'bindings', () => {
			it( 'binds #label to rows & columns', () => {
				view.rows = 3;

				expect( view.label ).toBe( '3 × 0' );

				view.columns = 7;

				expect( view.label ).toBe( '3 × 7' );
			} );

			it( 'mousedown event should be prevented', () => {
				const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

				expect( ret ).toBe( false );
			} );

			describe( 'DOM', () => {
				it( 'fires execute on "click" event', () => {
					const spy = vi.fn();

					view.on( 'execute', spy );

					dispatchEvent( view.element, 'click' );

					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );

			describe( 'focus', () => {
				it( 'should not update #columns and #rows when the focus is moved out of view', () => {
					view.focusTracker.focusedElement = view.items.first.element;

					expect( view.columns ).toBe( 1 );
					expect( view.rows ).toBe( 1 );

					view.focusTracker.focusedElement = null;

					expect( view.columns ).toBe( 1 );
					expect( view.rows ).toBe( 1 );
				} );

				it( 'should update #columns and #rows (focus the first tile) when the focus is moved to the view', () => {
					view.focusTracker.focusedElement = null;

					view.focusTracker.focusedElement = view.items.first.element;

					expect( view.columns ).toBe( 1 );
					expect( view.rows ).toBe( 1 );

					view.focusTracker.focusedElement = view.items.get( 24 ).element;

					expect( view.columns ).toBe( 5 );
					expect( view.rows ).toBe( 3 );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		describe( 'keyboard navigation in the insert table grid', () => {
			it( '"arrow right" should focus the next focusable tile', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.focusTracker.focusedElement = view.items.first.element;

				const spy = vi.spyOn( view.items.get( 1 ), 'focus' );

				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( '"arrow down" should focus the focusable tile in the second row', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				view.focusTracker.focusedElement = view.items.first.element;

				const spy = vi.spyOn( view.items.get( 10 ), 'focus' );

				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( 'reset()', () => {
		it( 'should set rows and columns properties to 1', () => {
			view.focusTracker.focusedElement = view.items.get( 24 ).element;

			expect( view.columns ).toBe( 5 );
			expect( view.rows ).toBe( 3 );

			view.reset();

			expect( view.columns ).toBe( 1 );
			expect( view.rows ).toBe( 1 );
		} );
	} );
} );

function dispatchEvent( el, domEvtName ) {
	if ( !el.parentNode ) {
		throw new Error( 'To dispatch an event, element must be in DOM. Otherwise #target is null.' );
	}

	el.dispatchEvent( new Event( domEvtName, {
		bubbles: true
	} ) );
}
