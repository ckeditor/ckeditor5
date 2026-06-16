/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import {
	FocusTracker,
	KeystrokeHandler,
	Locale
} from '@ckeditor/ckeditor5-utils';

import { DropdownMenuButtonView } from '../../../src/dropdown/menu/dropdownmenubuttonview.js';
import { DropdownMenuNestedMenuPanelView } from '../../../src/dropdown/menu/dropdownmenunestedmenupanelview.js';
import { DropdownMenuNestedMenuView, DropdownMenuPanelPositioningFunctions } from '../../../src/index.js';
import { DropdownMenuBehaviors } from '../../../src/dropdown/menu/dropdownmenubehaviors.js';

describe( 'DropdownMenuNestedMenuView', () => {
	let menuView, element, editor, parentMenuView, locale, body;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await ClassicTestEditor.create( element );

		locale = editor.locale;
		body = editor.ui.view.body;

		parentMenuView = new DropdownMenuNestedMenuView( locale, body, 'parent', 'Parent' );
		parentMenuView.panelView.class = 'parentCSSClass';

		menuView = new DropdownMenuNestedMenuView( locale, body, 'menu', 'Menu', parentMenuView );
	} );

	afterEach( async () => {
		if ( menuView.element ) {
			menuView.element.remove();
		}

		menuView.destroy();

		if ( parentMenuView ) {
			parentMenuView.destroy();
		}

		await editor.destroy();
		element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should have a button view', () => {
			expect( menuView.buttonView ).toBeInstanceOf( DropdownMenuButtonView );
		} );

		it( 'should have a panel view', () => {
			expect( menuView.panelView ).toBeInstanceOf( DropdownMenuNestedMenuPanelView );
		} );

		it( 'should have a focus tracker instance', () => {
			expect( menuView.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should have a keystrokes handler instance', () => {
			expect( menuView.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should have #isOpen property set false by default', () => {
			expect( menuView.isOpen ).toBe( false );
		} );

		it( 'should have #isEnabled property set true by default', () => {
			expect( menuView.isEnabled ).toBe( true );
		} );

		it( 'should have #class property', () => {
			expect( menuView.class ).toBeUndefined();
		} );

		it( 'should have #panelPosition property', () => {
			expect( menuView.panelPosition ).toBe( 'w' );
		} );

		it( 'should have #parentMenuView reference', () => {
			expect( menuView.parentMenuView ).not.toBeNull();
		} );

		describe( '#buttonView', () => {
			it( 'should delegate mouseenter to the menu', () => {
				const spy = vi.fn();

				menuView.on( 'mouseenter', spy );
				menuView.buttonView.fire( 'mouseenter' );

				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should have #isOn state bound to the menu\'s #isOpen', () => {
				expect( menuView.buttonView.isOn ).toBe( false );

				menuView.isOpen = true;

				expect( menuView.buttonView.isOn ).toBe( true );
			} );

			it( 'should have #isEnabled state bound to the menu\'s #isEnabled', () => {
				menuView.isEnabled = true;
				expect( menuView.buttonView.isEnabled ).toBe( true );

				menuView.isEnabled = false;
				expect( menuView.buttonView.isEnabled ).toBe( false );
			} );
		} );

		describe( 'template and DOM element', () => {
			beforeEach( () => {
				menuView.render();
			} );

			it( 'should have CSS classes', () => {
				expect( menuView.template.attributes.class ).toEqual(
					expect.arrayContaining( [ 'ck', 'ck-dropdown-menu-list__nested-menu' ] )
				);
			} );

			it( 'should have a presentation role to keep the a11y tree clean', () => {
				expect( menuView.template.attributes.role ).toEqual(
					expect.arrayContaining( [ 'presentation' ] )
				);
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should add button and panel to the focus tracker', () => {
			const focusTrackerAddSpy = vi.spyOn( menuView.focusTracker, 'add' );

			menuView.render();

			expect( focusTrackerAddSpy ).toHaveBeenCalledWith( menuView.buttonView.element );
			expect( focusTrackerAddSpy.mock.calls[ 0 ][ 0 ] ).toBe( menuView.buttonView.element );
			expect( focusTrackerAddSpy.mock.calls[ 1 ][ 0 ] ).toBe( menuView.panelView.element );
		} );

		// https://github.com/ckeditor/ckeditor5-commercial/issues/6633
		it( 'should add the #listView to the focus tracker to allow for linking focus trackers and sharing state of nested menus', () => {
			const focusTrackerAddSpy = vi.spyOn( menuView.focusTracker, 'add' );

			menuView.render();

			expect( focusTrackerAddSpy.mock.calls[ 2 ][ 0 ] ).toBe( menuView.listView );
		} );

		it( 'should start listening to keystrokes', () => {
			const keystrokeHandlerAddSpy = vi.spyOn( menuView.keystrokes, 'listenTo' );

			menuView.render();

			expect( keystrokeHandlerAddSpy ).toHaveBeenCalledOnce();
			expect( keystrokeHandlerAddSpy ).toHaveBeenCalledWith( menuView.element );
		} );
	} );

	describe( 'panel repositioning upon open', () => {
		it( 'should use a specific set of positioning functions in a specific priority order (LTR)', () => {
			const spy = vi.spyOn( menuView.panelView, 'pin' );

			menuView.render();
			document.body.appendChild( menuView.element );

			menuView.isOpen = true;

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 0 ].positions ).toEqual( [
				DropdownMenuPanelPositioningFunctions.eastSouth,
				DropdownMenuPanelPositioningFunctions.eastNorth,
				DropdownMenuPanelPositioningFunctions.westSouth,
				DropdownMenuPanelPositioningFunctions.westNorth
			] );
		} );

		it( 'should use a specific set of positioning functions in a specific priority order (RTL)', () => {
			const rtlParentMenuView = new DropdownMenuNestedMenuView( new Locale( { uiLanguage: 'ar' } ), body, 'parent', 'Parent' );
			rtlParentMenuView.panelView.class = 'parentCSSClass';

			const rtlMenuView = new DropdownMenuNestedMenuView(
				new Locale( { uiLanguage: 'ar' } ), body, 'menu', 'Menu', rtlParentMenuView
			);

			const spy = vi.spyOn( rtlMenuView.panelView, 'pin' );

			rtlMenuView.render();
			document.body.appendChild( rtlMenuView.element );

			rtlMenuView.isOpen = true;

			expect( spy.mock.calls[ 0 ][ 0 ].positions ).toEqual( [
				DropdownMenuPanelPositioningFunctions.westSouth,
				DropdownMenuPanelPositioningFunctions.westNorth,
				DropdownMenuPanelPositioningFunctions.eastSouth,
				DropdownMenuPanelPositioningFunctions.eastNorth
			] );

			rtlMenuView.element.remove();
			rtlMenuView.destroy();
			rtlParentMenuView.destroy();
		} );
	} );

	describe( '_addPanelToBody()', () => {
		it( 'should not add the panel to body if already added (opening menu twice)', () => {
			menuView.render();
			document.body.appendChild( menuView.element );

			menuView.isOpen = true;
			const panelCountBefore = body.length;

			// Setting isOpen to true again should not add the panel again.
			menuView.isOpen = false;
			menuView.isOpen = true;

			expect( body.length ).toBe( panelCountBefore );

			menuView.element.remove();
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the button view', () => {
			const spy = vi.spyOn( menuView.buttonView, 'focus' );

			menuView.render();
			menuView.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( '_attachBehaviors', () => {
		it( 'should enable a behavior that shows the menu upon clicking', () => {
			const spy = vi.spyOn( DropdownMenuBehaviors, 'openOnButtonClick' );

			menuView._attachBehaviors();

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( menuView );
		} );

		it( 'should enable a behavior that opens the menu upon arrow right key press', () => {
			const spy = vi.spyOn( DropdownMenuBehaviors, 'openOnArrowRightKey' );

			menuView._attachBehaviors();

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( menuView );
		} );

		it( 'should enable a behavior that closes the menu upon arrow left key press', () => {
			const spy = vi.spyOn( DropdownMenuBehaviors, 'closeOnArrowLeftKey' );

			menuView._attachBehaviors();

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( menuView );
		} );
	} );
} );
