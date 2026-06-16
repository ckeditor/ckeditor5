/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ViewCollection } from '../../src/viewcollection.js';
import { ListView } from '../../src/list/listview.js';
import { KeystrokeHandler, FocusTracker, keyCodes } from '@ckeditor/ckeditor5-utils';
import { FocusCycler } from '../../src/focuscycler.js';
import { View } from '../../src/view.js';
import { ListItemGroupView, ListItemView } from '../../src/index.js';
import { ListSeparatorView } from '../../src/list/listseparatorview.js';

describe( 'ListView', () => {
	let view;

	beforeEach( () => {
		view = new ListView();
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-reset' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-list' ) ).toBe( true );
		} );

		it( 'creates view#items collection', () => {
			expect( view.items ).toBeInstanceOf( ViewCollection );
			expect( view.template.children ).toHaveLength( 1 );
			expect( view.template.children[ 0 ] ).toBe( view.items );
		} );

		it( 'creates #focusTracker instance', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'creates #keystrokeHandler instance', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'creates #_focusCycler instance', () => {
			expect( view._focusCycler ).toBeInstanceOf( FocusCycler );
		} );
	} );

	describe( 'render()', () => {
		describe( 'focus tracker management', () => {
			let view, spyAdd, spyRemove;

			beforeEach( () => {
				view = new ListView();
				spyAdd = vi.spyOn( view.focusTracker, 'add' );
				spyRemove = vi.spyOn( view.focusTracker, 'remove' );
			} );

			afterEach( () => {
				view.destroy();
			} );

			it( 'registers all existing items before rendering', () => {
				const item1 = focusable();
				const item2 = focusable();

				view.items.add( item1 );
				view.items.add( item2 );

				view.render();

				expect( spyAdd ).toHaveBeenCalledTimes( 2 );
				expect( spyAdd ).toHaveBeenNthCalledWith( 1, item1.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 2, item2.element );
				expect( spyRemove ).not.toHaveBeenCalled();

				assertFocusables( view, [ item1, item2 ] );
			} );

			it( 'registers all items after rendering', () => {
				const item1 = focusable();
				const item2 = focusable();
				const item3 = focusable();

				view.items.add( item1 );
				view.items.add( item2 );

				view.render();

				view.items.add( item3 );

				expect( spyAdd ).toHaveBeenCalledTimes( 3 );
				expect( spyAdd ).toHaveBeenNthCalledWith( 1, item1.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 2, item2.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 3, item3.element );
				expect( spyRemove ).not.toHaveBeenCalled();

				assertFocusables( view, [ item1, item2, item3 ] );
			} );

			it( 'registers many items after rendering', () => {
				const item1 = focusable( '1' );
				const item2 = focusable( '2' );
				const item3 = focusable( '3' );

				view.items.add( item1 );

				view.render();

				view.items.addMany( [ item2, item3 ], 0 );

				expect( spyAdd ).toHaveBeenCalledTimes( 3 );
				expect( spyAdd ).toHaveBeenNthCalledWith( 1, item1.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 2, item3.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 3, item2.element );
				expect( spyRemove ).not.toHaveBeenCalled();

				assertFocusables( view, [ item2, item3, item1 ] );
			} );

			it( 'registers existing groups before rendering', () => {
				const item1 = focusable();
				const item21 = focusable();
				const item22 = focusable();

				const group1 = new ListItemGroupView();

				view.items.add( item1 );
				view.items.add( group1 );
				group1.items.add( item21 );
				group1.items.add( item22 );

				view.render();

				expect( spyAdd ).toHaveBeenCalledTimes( 3 );
				expect( spyAdd ).toHaveBeenNthCalledWith( 1, item1.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 2, item21.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 3, item22.element );
				expect( spyRemove ).not.toHaveBeenCalled();

				assertFocusables( view, [ item1, item21, item22 ] );
			} );

			it( 'registers new groups after rendering', () => {
				const item1 = focusable();
				const item21 = focusable();
				const item22 = focusable();

				const group1 = new ListItemGroupView();

				view.items.add( item1 );
				group1.items.add( item21 );
				group1.items.add( item22 );

				view.render();

				view.items.add( group1 );

				expect( spyAdd ).toHaveBeenCalledTimes( 3 );
				expect( spyAdd ).toHaveBeenNthCalledWith( 1, item1.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 2, item21.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 3, item22.element );
				expect( spyRemove ).not.toHaveBeenCalled();

				assertFocusables( view, [ item1, item21, item22 ] );
			} );

			it( 'registers new group items after rendering', () => {
				const item1 = focusable();
				const item21 = focusable();
				const item22 = focusable();

				const group1 = new ListItemGroupView();

				view.items.add( item1 );
				group1.items.add( item21 );

				view.render();

				view.items.add( group1 );
				group1.items.add( item22 );

				expect( spyAdd ).toHaveBeenCalledTimes( 3 );
				expect( spyAdd ).toHaveBeenNthCalledWith( 1, item1.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 2, item21.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 3, item22.element );
				expect( spyRemove ).not.toHaveBeenCalled();

				assertFocusables( view, [ item1, item21, item22 ] );
			} );

			it( 'registers many new group items after rendering', () => {
				const item1 = focusable( '1' );
				const item21 = focusable( '21' );
				const item22 = focusable( '22' );

				const group1 = new ListItemGroupView();

				view.items.add( item1 );

				view.render();

				view.items.add( group1, 0 );
				group1.items.addMany( [ item21, item22 ] );

				expect( spyAdd ).toHaveBeenCalledTimes( 3 );
				expect( spyAdd ).toHaveBeenNthCalledWith( 1, item1.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 2, item22.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 3, item21.element );
				expect( spyRemove ).not.toHaveBeenCalled();

				assertFocusables( view, [ item21, item22, item1 ] );
			} );

			it( 'doesn\'t register list separator', () => {
				const item = listSeparator();

				view.items.add( item );
				view.render();

				expect( spyAdd ).not.toHaveBeenCalled();
			} );

			it( 'deregisters items upon removal', () => {
				const item1 = focusable();
				const item2 = focusable();

				view.items.add( item1 );
				view.items.add( item2 );

				view.render();

				assertFocusables( view, [ item1, item2 ] );

				view.items.remove( 0 );

				expect( spyAdd ).toHaveBeenCalledTimes( 2 );
				expect( spyAdd ).toHaveBeenNthCalledWith( 1, item1.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 2, item2.element );
				expect( spyRemove ).toHaveBeenCalledTimes( 1 );
				expect( spyRemove ).toHaveBeenNthCalledWith( 1, item1.element );

				assertFocusables( view, [ item2 ] );
			} );

			it( 'deregisters nested items upon removal', () => {
				const item1 = focusable();
				const item21 = focusable();
				const item22 = focusable();

				const group1 = new ListItemGroupView();

				view.items.add( item1 );
				view.items.add( group1 );
				group1.items.add( item21 );
				group1.items.add( item22 );

				view.render();

				assertFocusables( view, [ item1, item21, item22 ] );

				group1.items.remove( 0 );

				expect( spyAdd ).toHaveBeenCalledTimes( 3 );
				expect( spyAdd ).toHaveBeenNthCalledWith( 1, item1.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 2, item21.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 3, item22.element );
				expect( spyRemove ).toHaveBeenCalledTimes( 1 );
				expect( spyRemove ).toHaveBeenNthCalledWith( 1, item21.element );

				assertFocusables( view, [ item1, item22 ] );
			} );

			it( 'deregisters entire groups', () => {
				const item1 = focusable();
				const item21 = focusable();
				const item22 = focusable();

				const group1 = new ListItemGroupView();

				view.items.add( item1 );
				view.items.add( group1 );
				group1.items.add( item21 );
				group1.items.add( item22 );

				view.render();

				assertFocusables( view, [ item1, item21, item22 ] );

				view.items.remove( 1 );

				expect( spyAdd ).toHaveBeenCalledTimes( 3 );
				expect( spyAdd ).toHaveBeenNthCalledWith( 1, item1.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 2, item21.element );
				expect( spyAdd ).toHaveBeenNthCalledWith( 3, item22.element );
				expect( spyRemove ).toHaveBeenCalledTimes( 2 );
				expect( spyRemove ).toHaveBeenNthCalledWith( 1, item21.element );
				expect( spyRemove ).toHaveBeenNthCalledWith( 2, item22.element );

				assertFocusables( view, [ item1 ] );
			} );

			it( 'doesn\'t deregister list separator', () => {
				const item = listSeparator();

				view.items.add( item );
				view.render();
				view.items.remove( 0 );

				expect( spyRemove ).not.toHaveBeenCalled();
			} );

			function assertFocusables( view, expected ) {
				expect( Array.from( view.focusables ) ).toEqual( expected );
			}
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new ListView();
			const spy = vi.spyOn( view.keystrokes, 'listenTo' );

			view.render();
			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation for the list', () => {
			it( 'so "arrowup" focuses previous focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowup,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// No children to focus.
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();

				view.items.add( nonFocusable() );
				view.items.add( nonFocusable() );

				// No focusable children.
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 2 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 2 );

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 4 ).element;

				const spy = vi.spyOn( view.items.get( 2 ), 'focus' );
				view.keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 3 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 3 );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'so "arrowdown" focuses next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// No children to focus.
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();

				view.items.add( nonFocusable() );
				view.items.add( nonFocusable() );

				// No focusable children.
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 2 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 2 );

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 4 ).element;

				const spy = vi.spyOn( view.items.get( 2 ), 'focus' );
				view.keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 3 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 3 );
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

	describe( 'focus()', () => {
		it( 'focuses the first focusable item in DOM', () => {
			// No children to focus.
			view.focus();

			// The second child is focusable.
			view.items.add( nonFocusable() );
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			const spy = vi.spyOn( view.items.get( 1 ), 'focus' );
			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focusFirst()', () => {
		it( 'focuses the first focusable item in DOM', () => {
			// No children to focus.
			view.focusFirst();

			// The second child is focusable.
			view.items.add( nonFocusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			const spy = vi.spyOn( view.items.get( 1 ), 'focus' );
			view.focusFirst();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'focuses the last focusable item in DOM', () => {
			// No children to focus.
			view.focusLast();

			// The second child is focusable.
			view.items.add( nonFocusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			const spy = vi.spyOn( view.items.get( 2 ), 'focus' );
			view.focusLast();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( '#ariaLabel', () => {
		it( 'should be not set by default', () => {
			expect( view.element.attributes[ 'aria-label' ] ).toBeUndefined();
		} );

		it( 'should set aria-label', () => {
			view.ariaLabel = 'foo';

			expect( view.element.attributes[ 'aria-label' ].value ).toBe( 'foo' );
		} );
	} );

	describe( '#ariaLabelledBy', () => {
		it( 'should be not set by default', () => {
			expect( view.element.attributes[ 'aria-labelledby' ] ).toBeUndefined();
		} );

		it( 'should set aria-labelledby', () => {
			view.ariaLabelledBy = 'foo';

			expect( view.element.attributes[ 'aria-labelledby' ].value ).toBe( 'foo' );
		} );
	} );

	describe( '#role', () => {
		it( 'should be not set by default', () => {
			expect( view.element.attributes.role ).toBeUndefined();
		} );

		it( 'should set role', () => {
			view.role = 'foo';

			expect( view.element.attributes.role.value ).toBe( 'foo' );
		} );
	} );
} );

function focusable( name ) {
	const view = new ListItemView();
	view.name = name;

	return view;
}

function nonFocusable() {
	const view = new View();
	view.element = document.createElement( 'li' );

	return view;
}

function listSeparator() {
	const view = new ListSeparatorView();

	return view;
}
