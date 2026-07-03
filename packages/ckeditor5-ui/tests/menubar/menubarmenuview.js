/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	FocusTracker,
	KeystrokeHandler,
	Locale,
	keyCodes
} from '@ckeditor/ckeditor5-utils';
import {
	MenuBarMenuView,
	MenuBarView
} from '../../src/index.js';
import { MenuBarMenuButtonView } from '../../src/menubar/menubarmenubuttonview.js';
import { MenuBarMenuPanelView } from '../../src/menubar/menubarmenupanelview.js';
import {
	MenuBarMenuBehaviors,
	MenuBarMenuViewPanelPositioningFunctions
} from '../../src/menubar/utils.js';

describe( 'MenuBarMenuView', () => {
	let menuView, locale;

	beforeEach( () => {
		locale = new Locale();
		menuView = new MenuBarMenuView( locale );
	} );

	afterEach( () => {
		menuView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have a button view', () => {
			expect( menuView.buttonView ).toBeInstanceOf( MenuBarMenuButtonView );
		} );

		it( 'should have a panel view', () => {
			expect( menuView.panelView ).toBeInstanceOf( MenuBarMenuPanelView );
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
			expect( menuView.parentMenuView ).toBeNull();
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

		describe( '#panelView', () => {
			it( 'should bind its #isVisible to menu\'s #isOpen', () => {
				expect( menuView.panelView.isVisible ).toBe( false );

				menuView.isOpen = true;

				expect( menuView.panelView.isVisible ).toBe( true );
			} );
		} );

		describe( 'template and DOM element', () => {
			beforeEach( () => {
				menuView.render();
			} );

			it( 'should have CSS classes', () => {
				expect( menuView.template.attributes.class ).toEqual( expect.arrayContaining( [ 'ck', 'ck-menu-bar__menu' ] ) );
			} );

			it( 'should have CSS classes bound to #class', () => {
				menuView.class = 'my-class';

				expect( menuView.element.classList.contains( 'my-class' ) ).toBe( true );
			} );

			it( 'should bind #isEnabled to a CSS class', () => {
				menuView.isEnabled = false;
				expect( menuView.element.classList.contains( 'ck-disabled' ) ).toBe( true );

				menuView.isEnabled = true;
				expect( menuView.element.classList.contains( 'ck-disabled' ) ).toBe( false );
			} );

			it( 'should bind #parentMenuView to a CSS class', () => {
				const menuView = new MenuBarMenuView( locale );
				const parentMenuView = new MenuBarMenuView( locale );

				menuView.parentMenuView = parentMenuView;
				menuView.render();
				parentMenuView.render();

				expect( menuView.element.classList.contains( 'ck-menu-bar__menu_top-level' ) ).toBe( false );
				expect( parentMenuView.element.classList.contains( 'ck-menu-bar__menu_top-level' ) ).toBe( true );

				menuView.destroy();
				parentMenuView.destroy();
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should add button and panel to the focus tracker', () => {
			const focusTrackerAddSpy = vi.spyOn( menuView.focusTracker, 'add' );

			menuView.render();

			expect( focusTrackerAddSpy ).toHaveBeenNthCalledWith( 1, menuView.buttonView.element );
			expect( focusTrackerAddSpy ).toHaveBeenNthCalledWith( 2, menuView.panelView.element );
		} );

		it( 'should start listening to keystrokes', () => {
			const keystrokeHandlerAddSpy = vi.spyOn( menuView.keystrokes, 'listenTo' );

			menuView.render();

			expect( keystrokeHandlerAddSpy ).toHaveBeenCalledOnce();
			expect( keystrokeHandlerAddSpy ).toHaveBeenCalledWith( menuView.element );
		} );

		describe( 'top-level menu', () => {
			let menuBarView;

			beforeEach( () => {
				menuBarView = new MenuBarView( locale );
				menuBarView.registerMenu( menuView );
			} );

			afterEach( () => {
				menuBarView.destroy();
			} );

			it( 'should fire arrowright and arrowleft events upon arrow key press', () => {
				const spyRight = vi.fn();
				const spyLeft = vi.fn();
				const keyEvtDataRight = {
					keyCode: keyCodes.arrowright,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};
				const keyEvtDataLeft = {
					keyCode: keyCodes.arrowleft,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				menuView.on( 'arrowright', spyRight );
				menuView.on( 'arrowleft', spyLeft );

				menuBarView.children.add( menuView );
				menuBarView.render();

				menuView.keystrokes.press( keyEvtDataRight );
				expect( spyRight ).toHaveBeenCalledOnce();
				expect( spyLeft ).not.toHaveBeenCalled();
				expect( keyEvtDataRight.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtDataLeft.preventDefault ).not.toHaveBeenCalled();

				menuView.keystrokes.press( keyEvtDataLeft );
				expect( spyRight ).toHaveBeenCalledOnce();
				expect( spyLeft ).toHaveBeenCalledOnce();
				expect( keyEvtDataRight.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtDataLeft.preventDefault ).toHaveBeenCalledOnce();
			} );
		} );

		it( 'should enable a behavior that closes the menu upon the Esc key press', () => {
			const spy = vi.spyOn( MenuBarMenuBehaviors, 'closeOnEscKey' );

			menuView.render();

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( menuView );
		} );

		it( 'should close the menu when it gets disabled', () => {
			menuView.render();
			menuView.isOpen = true;

			menuView.isEnabled = false;

			expect( menuView.isOpen ).toBe( false );
		} );

		it( 'should not close the menu when it gets enabled', () => {
			menuView.render();
			menuView.isEnabled = false;
			menuView.isOpen = true;

			menuView.isEnabled = true;

			expect( menuView.isOpen ).toBe( true );
		} );

		describe( 'panel repositioning upon open', () => {
			let menuView, menuBarView, parentMenuView;

			it( 'should update the position whenever the menu gets open (but not when it closes)', () => {
				createTopLevelMenuWithLocale( locale );

				menuView.panelView.position = null;
				menuView.isOpen = true;

				expect( menuView.panelView.position ).not.toBeNull();

				const newPositionName = menuView.panelView.position;
				menuView.isOpen = false;
				expect( menuView.panelView.position ).toBe( newPositionName );
			} );

			it( 'should use the default position if none were considered optimal (because off the viewport, etc.)', () => {
				createTopLevelMenuWithLocale( locale );

				vi.spyOn( MenuBarMenuView, '_getOptimalPosition' ).mockReturnValue( null );

				menuView.panelView.position = null;

				menuView.isOpen = true;

				expect( menuView.panelView.position ).toBe( 'se' );
			} );

			it( 'should use the default position if none were considered optimal (has parent menu)', () => {
				createTopLevelMenuWithLocale( locale );

				vi.spyOn( MenuBarMenuView, '_getOptimalPosition' ).mockReturnValue( null );

				menuView.parentMenuView = new MenuBarMenuView( locale );

				menuView.panelView.position = null;

				menuView.isOpen = true;

				expect( menuView.panelView.position ).toBe( 'es' );
			} );

			it( 'should use the default position if none were considered optimal (RTL)', () => {
				createTopLevelMenuWithLocale( locale );

				vi.spyOn( MenuBarMenuView, '_getOptimalPosition' ).mockReturnValue( null );

				menuView.locale.uiLanguageDirection = 'rtl';

				menuView.panelView.position = null;

				menuView.isOpen = true;

				expect( menuView.panelView.position ).toBe( 'sw' );
			} );

			it( 'should use the default position if none were considered optimal (RTL, has parent menu)', () => {
				createTopLevelMenuWithLocale( locale );

				vi.spyOn( MenuBarMenuView, '_getOptimalPosition' ).mockReturnValue( null );

				menuView.locale.uiLanguageDirection = 'rtl';

				menuView.parentMenuView = new MenuBarMenuView( locale );

				menuView.panelView.position = null;

				menuView.isOpen = true;

				expect( menuView.panelView.position ).toBe( 'ws' );
			} );

			afterEach( () => {
				menuView.element.remove();
				menuBarView.destroy();
			} );

			describe( 'top-level menu', () => {
				describe( 'when the UI language is LTR', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {
						const spy = vi.spyOn( MenuBarMenuView, '_getOptimalPosition' );
						const locale = new Locale( { uiLanguage: 'pl' } );

						createTopLevelMenuWithLocale( locale );

						menuView.isOpen = true;

						expect( spy.mock.calls[ 0 ][ 0 ].positions ).toEqual( [
							MenuBarMenuViewPanelPositioningFunctions.southEast,
							MenuBarMenuViewPanelPositioningFunctions.southWest,
							MenuBarMenuViewPanelPositioningFunctions.northEast,
							MenuBarMenuViewPanelPositioningFunctions.northWest
						] );
					} );
				} );

				describe( 'when the UI language is RTL', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {
						const spy = vi.spyOn( MenuBarMenuView, '_getOptimalPosition' );
						const locale = new Locale( { uiLanguage: 'ar' } );

						createTopLevelMenuWithLocale( locale );

						menuView.isOpen = true;

						expect( spy.mock.calls[ 0 ][ 0 ].positions ).toEqual( [
							MenuBarMenuViewPanelPositioningFunctions.southWest,
							MenuBarMenuViewPanelPositioningFunctions.southEast,
							MenuBarMenuViewPanelPositioningFunctions.northWest,
							MenuBarMenuViewPanelPositioningFunctions.northEast
						] );
					} );
				} );
			} );

			describe( 'sub-menu', () => {
				describe( 'when the UI language is LTR', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {
						const spy = vi.spyOn( MenuBarMenuView, '_getOptimalPosition' );
						const locale = new Locale( { uiLanguage: 'pl' } );

						createSubMenuWithLocale( locale );

						menuView.isOpen = true;

						expect( spy.mock.calls[ 0 ][ 0 ].positions ).toEqual( [
							MenuBarMenuViewPanelPositioningFunctions.eastSouth,
							MenuBarMenuViewPanelPositioningFunctions.eastNorth,
							MenuBarMenuViewPanelPositioningFunctions.westSouth,
							MenuBarMenuViewPanelPositioningFunctions.westNorth
						] );
					} );
				} );

				describe( 'when the UI language is RTL', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {
						const spy = vi.spyOn( MenuBarMenuView, '_getOptimalPosition' );
						const locale = new Locale( { uiLanguage: 'ar' } );

						createSubMenuWithLocale( locale );

						menuView.isOpen = true;

						expect( spy.mock.calls[ 0 ][ 0 ].positions ).toEqual( [
							MenuBarMenuViewPanelPositioningFunctions.westSouth,
							MenuBarMenuViewPanelPositioningFunctions.westNorth,
							MenuBarMenuViewPanelPositioningFunctions.eastSouth,
							MenuBarMenuViewPanelPositioningFunctions.eastNorth
						] );
					} );
				} );
			} );

			function createTopLevelMenuWithLocale( locale ) {
				menuView = new MenuBarMenuView( locale );
				menuBarView = new MenuBarView( locale );
				menuBarView.registerMenu( menuView );
				menuView.render();
				document.body.appendChild( menuView.element );
			}

			function createSubMenuWithLocale( locale ) {
				menuView = new MenuBarMenuView( locale );
				parentMenuView = new MenuBarMenuView( locale );
				menuView.parentMenuView = parentMenuView;
				menuView.render();
				document.body.appendChild( menuView.element );
			}
		} );
	} );

	describe( '_attachBehaviors', () => {
		describe( 'top-level menu', () => {
			it( 'should enable a behavior that opens and focuses the panel on arrow down key', () => {
				const spy = vi.spyOn( MenuBarMenuBehaviors, 'openAndFocusPanelOnArrowDownKey' );

				menuView._attachBehaviors();

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( menuView );
			} );

			it( 'should enable a behavior that toggles visibility of the menu upon clicking', () => {
				const spy = vi.spyOn( MenuBarMenuBehaviors, 'toggleOnButtonClick' );

				menuView._attachBehaviors();

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( menuView );
			} );
		} );

		describe( 'sub-menu', () => {
			let parentMenuView;

			beforeEach( () => {
				parentMenuView = new MenuBarMenuView( locale );

				menuView.parentMenuView = parentMenuView;
			} );

			afterEach( () => {
				parentMenuView.destroy();
			} );

			it( 'should enable a behavior that opens the menu upon clicking (but does not close it)', () => {
				const spy = vi.spyOn( MenuBarMenuBehaviors, 'openOnButtonClick' );

				menuView._attachBehaviors();

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( menuView );
			} );

			it( 'should enable a behavior that opens the menu upon arrow right key press', () => {
				const spy = vi.spyOn( MenuBarMenuBehaviors, 'openOnArrowRightKey' );

				menuView._attachBehaviors();

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( menuView );
			} );

			it( 'should enable a behavior that closes the menu upon arrow left key press', () => {
				const spy = vi.spyOn( MenuBarMenuBehaviors, 'closeOnArrowLeftKey' );

				menuView._attachBehaviors();

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( menuView );
			} );

			it( 'should enable a behavior that closes the menu when its parent closes', () => {
				const spy = vi.spyOn( MenuBarMenuBehaviors, 'closeOnParentClose' );

				menuView._attachBehaviors();

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( menuView );
			} );
		} );
	} );
} );
