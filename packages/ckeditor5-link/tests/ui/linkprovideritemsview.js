/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
	KeystrokeHandler,
	FocusTracker,
	keyCodes
} from '@ckeditor/ckeditor5-utils';

import {
	View,
	ListView,
	FocusCycler,
	ViewCollection,
	ButtonView
} from '@ckeditor/ckeditor5-ui';

import { LinkProviderItemsView } from '../../src/ui/linkprovideritemsview.js';

const mockLocale = { t: val => val };

describe( 'LinkProviderItemsView', () => {
	let view, linksButtonsArrayMock;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		view = new LinkProviderItemsView( mockLocale );
		view.render();
		document.body.appendChild( view.element );

		linksButtonsArrayMock = [
			createButton( 'Mocked link button 1' ),
			createButton( 'Mocked link button 2' ),
			createButton( 'Mocked link button 3' )
		];
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName.toLowerCase() ).toBe( 'div' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-link-providers' ) ).toBe( true );
			expect( view.element.getAttribute( 'tabindex' ) ).toBe( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.backButtonView ).toBeInstanceOf( ButtonView );
			expect( view.listView ).toBeInstanceOf( ListView );
			expect( view.emptyListInformation ).toBeInstanceOf( View );
			expect( view.children ).toBeInstanceOf( ViewCollection );
			expect( view.listChildren ).toBeInstanceOf( ViewCollection );
			expect( view.children ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).toBeInstanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should create #hasItems instance and set it to `false`', () => {
			expect( view.hasItems ).toBe( false );

			view.listChildren.addMany( linksButtonsArrayMock );

			expect( view.hasItems ).toBe( true );

			view.listChildren.clear();

			expect( view.hasItems ).toBe( false );
		} );

		it( 'should fire `cancel` event on backButtonView#execute', () => {
			const spy = vi.fn();

			view.on( 'cancel', spy );

			view.backButtonView.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		describe( 'template', () => {
			it( 'has back button', () => {
				const button = view.template.children[ 0 ].get( 0 ).template.children[ 0 ].get( 0 );

				expect( button ).toBe( view.backButtonView );
				expect( button.template.children[ 0 ].get( 1 ).text ).toBe( 'Back' );
			} );
		} );

		it( 'should create emptyListInformation element from template', () => {
			const emptyListInformation = view.emptyListInformation;

			expect( emptyListInformation.element.tagName.toLowerCase() ).toBe( 'p' );
			expect( emptyListInformation.element.classList.contains( 'ck' ) ).toBe( true );
			expect( emptyListInformation.element.classList.contains( 'ck-link__empty-list-info' ) ).toBe( true );
		} );
	} );

	describe( 'bindings', () => {
		it( 'should hide after Esc key press', () => {
			const keyEvtData = {
				keyCode: keyCodes.esc,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			};
			const spy = vi.fn();

			view.on( 'cancel', spy );

			view.keystrokes.press( keyEvtData );

			expect( spy ).toHaveBeenCalledOnce();
			expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
			expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
		} );

		it( 'should bind the #title to headerView.label', () => {
			view.title = 'Mocked header label';

			expect( view.children.get( 0 ).label ).toBe( 'Mocked header label' );
		} );

		it( 'should bind the #emptyListInformation to emptyListInformation', () => {
			view.emptyListPlaceholder = 'Mocked empty list information';

			expect( view.emptyListInformation.element.innerText ).toBe( 'Mocked empty list information' );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).toEqual(
				expect.arrayContaining( [ view.backButtonView, view.listView ] )
			);
			expect( view._focusables.length ).toBe( 2 );
		} );

		it( 'should register child views #element in #focusTracker', () => {
			const view = new LinkProviderItemsView( mockLocale );
			const spy = vi.spyOn( view.focusTracker, 'add' );

			view.render();

			expect( spy.mock.calls[ 0 ][ 0 ] ).toBe( view.listView.element );
			expect( spy.mock.calls[ 1 ][ 0 ] ).toBe( view.backButtonView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new LinkProviderItemsView( mockLocale );
			const spy = vi.spyOn( view.keystrokes, 'listenTo' );

			view.render();

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation', () => {
			let view;

			afterEach( () => {
				vi.restoreAllMocks();
			} );

			beforeEach( () => {
				view = new LinkProviderItemsView( mockLocale );
				view.render();
				document.body.appendChild( view.element );

				view.listChildren.addMany( linksButtonsArrayMock );
			} );

			afterEach( () => {
				view.element.remove();
				view.destroy();
			} );

			it( 'so "tab" focuses the next focusable item', () => {
				expect( view.hasItems ).toBe( true );

				const spy = vi.spyOn( view.backButtonView, 'focus' );
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the focus on list.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.listView.element;
				view.keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'so "shift + tab" focuses the previous focusable item', () => {
				expect( view.hasItems ).toBe( true );

				const spy = vi.spyOn( view.listView, 'focus' );
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the back button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.backButtonView.element;
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

	describe( 'focus()', () => {
		it( 'focuses the back button when links list is empty', () => {
			const backButtonSpy = vi.spyOn( view.backButtonView, 'focus' );

			view.focus();

			expect( backButtonSpy ).toHaveBeenCalledOnce();
		} );

		it( 'focuses the back button when links list is not empty', () => {
			const backButtonSpy = vi.spyOn( view.backButtonView, 'focus' );

			view.listChildren.addMany( linksButtonsArrayMock );

			const listItemSpy = vi.spyOn( view.listChildren.first, 'focus' );

			view.focus();

			expect( backButtonSpy ).not.toHaveBeenCalled();
			expect( listItemSpy ).toHaveBeenCalledOnce();
		} );
	} );

	function createButton( label ) {
		const button = new ButtonView( mockLocale );

		button.set( {
			label,
			withText: true
		} );

		return button;
	}
} );
