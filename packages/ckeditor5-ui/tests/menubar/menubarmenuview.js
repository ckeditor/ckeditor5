/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
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
import MenuBarMenuButtonView from '../../src/menubar/menubarmenubuttonview.js';
import MenuBarMenuPanelView from '../../src/menubar/menubarmenupanelview.js';
import {
	MenuBarMenuBehaviors,
	MenuBarMenuViewPanelPositioningFunctions
} from '../../src/menubar/utils.js';

describe( 'MenuBarMenuView', () => {
	let menuView, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();
		menuView = new MenuBarMenuView( locale );
	} );

	afterEach( () => {
		menuView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have a button view', () => {
			expect( menuView.buttonView ).to.be.instanceOf( MenuBarMenuButtonView );
		} );

		it( 'should have a panel view', () => {
			expect( menuView.panelView ).to.be.instanceOf( MenuBarMenuPanelView );
		} );

		it( 'should have a focus tracker instance', () => {
			expect( menuView.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should have a keystrokes handler instance', () => {
			expect( menuView.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should have #isOpen property set false by default', () => {
			expect( menuView.isOpen ).to.be.false;
		} );

		it( 'should have #isEnabled property set true by default', () => {
			expect( menuView.isEnabled ).to.be.true;
		} );

		it( 'should have #class property', () => {
			expect( menuView.class ).to.be.undefined;
		} );

		it( 'should have #panelPosition property', () => {
			expect( menuView.panelPosition ).to.equal( 'w' );
		} );

		it( 'should have #parentMenuView reference', () => {
			expect( menuView.parentMenuView ).to.be.null;
		} );

		describe( '#buttonView', () => {
			it( 'should delegate mouseenter to the menu', () => {
				const spy = sinon.spy();

				menuView.on( 'mouseenter', spy );
				menuView.buttonView.fire( 'mouseenter' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should have #isOn state bound to the menu\'s #isOpen', () => {
				expect( menuView.buttonView.isOn ).to.be.false;

				menuView.isOpen = true;

				expect( menuView.buttonView.isOn ).to.be.true;
			} );

			it( 'should have #isEnabled state bound to the menu\'s #isEnabled', () => {
				menuView.isEnabled = true;
				expect( menuView.buttonView.isEnabled ).to.be.true;

				menuView.isEnabled = false;
				expect( menuView.buttonView.isEnabled ).to.be.false;
			} );
		} );

		describe( '#panelView', () => {
			it( 'should bind its #isVisible to menu\'s #isOpen', () => {
				expect( menuView.panelView.isVisible ).to.be.false;

				menuView.isOpen = true;

				expect( menuView.panelView.isVisible ).to.be.true;
			} );
		} );

		describe( 'template and DOM element', () => {
			beforeEach( () => {
				menuView.render();
			} );

			it( 'should have CSS classes', () => {
				expect( menuView.template.attributes.class ).to.include.members( [ 'ck', 'ck-menu-bar__menu' ] );
			} );

			it( 'should have CSS classes bound to #class', () => {
				menuView.class = 'my-class';

				expect( menuView.element.classList.contains( 'my-class' ) ).to.be.true;
			} );

			it( 'should bind #isEnabled to a CSS class', () => {
				menuView.isEnabled = false;
				expect( menuView.element.classList.contains( 'ck-disabled' ) ).to.be.true;

				menuView.isEnabled = true;
				expect( menuView.element.classList.contains( 'ck-disabled' ) ).to.be.false;
			} );

			it( 'should bind #parentMenuView to a CSS class', () => {
				const menuView = new MenuBarMenuView( locale );
				const parentMenuView = new MenuBarMenuView( locale );

				menuView.parentMenuView = parentMenuView;
				menuView.render();
				parentMenuView.render();

				expect( menuView.element.classList.contains( 'ck-menu-bar__menu_top-level' ) ).to.be.false;
				expect( parentMenuView.element.classList.contains( 'ck-menu-bar__menu_top-level' ) ).to.be.true;

				menuView.destroy();
				parentMenuView.destroy();
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should add button and panel to the focus tracker', () => {
			const focusTrackerAddSpy = sinon.spy( menuView.focusTracker, 'add' );

			menuView.render();

			sinon.assert.calledWithExactly( focusTrackerAddSpy.firstCall, menuView.buttonView.element );
			sinon.assert.calledWithExactly( focusTrackerAddSpy.secondCall, menuView.panelView.element );
		} );

		it( 'should start listening to keystrokes', () => {
			const keystrokeHandlerAddSpy = sinon.spy( menuView.keystrokes, 'listenTo' );

			menuView.render();

			sinon.assert.calledOnceWithExactly( keystrokeHandlerAddSpy, menuView.element );
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
				const spyRight = sinon.spy();
				const spyLeft = sinon.spy();
				const keyEvtDataRight = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
				const keyEvtDataLeft = {
					keyCode: keyCodes.arrowleft,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				menuView.on( 'arrowright', spyRight );
				menuView.on( 'arrowleft', spyLeft );

				menuBarView.children.add( menuView );
				menuBarView.render();

				menuView.keystrokes.press( keyEvtDataRight );
				sinon.assert.calledOnce( spyRight );
				sinon.assert.notCalled( spyLeft );
				sinon.assert.calledOnce( keyEvtDataRight.preventDefault );
				sinon.assert.notCalled( keyEvtDataLeft.preventDefault );

				menuView.keystrokes.press( keyEvtDataLeft );
				sinon.assert.calledOnce( spyRight );
				sinon.assert.calledOnce( spyLeft );
				sinon.assert.calledOnce( keyEvtDataRight.preventDefault );
				sinon.assert.calledOnce( keyEvtDataLeft.preventDefault );
			} );
		} );

		it( 'should enable a behavior that closes the menu upon the Esc key press', () => {
			const spy = sinon.spy( MenuBarMenuBehaviors, 'closeOnEscKey' );

			menuView.render();

			sinon.assert.calledOnceWithExactly( spy, menuView );
		} );

		describe( 'panel repositioning upon open', () => {
			let menuView, menuBarView, parentMenuView;

			it( 'should update the position whenever the menu gets open (but not when it closes)', () => {
				createTopLevelMenuWithLocale( locale );

				menuView.panelView.position = null;
				menuView.isOpen = true;

				expect( menuView.panelView.position ).to.not.be.null;

				const newPositionName = menuView.panelView.position;
				menuView.isOpen = false;
				expect( menuView.panelView.position ).to.equal( newPositionName );
			} );

			it( 'should use the default position if none were considered optimal (because off the viewport, etc.)', () => {
				createTopLevelMenuWithLocale( locale );

				sinon.stub( MenuBarMenuView, '_getOptimalPosition' ).returns( null );

				menuView.panelView.position = null;

				menuView.isOpen = true;

				expect( menuView.panelView.position ).to.equal( 'se' );
			} );

			it( 'should use the default position if none were considered optimal (has parent menu)', () => {
				createTopLevelMenuWithLocale( locale );

				sinon.stub( MenuBarMenuView, '_getOptimalPosition' ).returns( null );

				menuView.parentMenuView = new MenuBarMenuView( locale );

				menuView.panelView.position = null;

				menuView.isOpen = true;

				expect( menuView.panelView.position ).to.equal( 'es' );
			} );

			it( 'should use the default position if none were considered optimal (RTL)', () => {
				createTopLevelMenuWithLocale( locale );

				sinon.stub( MenuBarMenuView, '_getOptimalPosition' ).returns( null );

				menuView.locale.uiLanguageDirection = 'rtl';

				menuView.panelView.position = null;

				menuView.isOpen = true;

				expect( menuView.panelView.position ).to.equal( 'sw' );
			} );

			it( 'should use the default position if none were considered optimal (RTL, has parent menu)', () => {
				createTopLevelMenuWithLocale( locale );

				sinon.stub( MenuBarMenuView, '_getOptimalPosition' ).returns( null );

				menuView.locale.uiLanguageDirection = 'rtl';

				menuView.parentMenuView = new MenuBarMenuView( locale );

				menuView.panelView.position = null;

				menuView.isOpen = true;

				expect( menuView.panelView.position ).to.equal( 'ws' );
			} );

			afterEach( () => {
				menuView.element.remove();
				menuBarView.destroy();
			} );

			describe( 'top-level menu', () => {
				describe( 'when the UI language is LTR', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {
						const spy = sinon.spy( MenuBarMenuView, '_getOptimalPosition' );
						const locale = new Locale( { uiLanguage: 'pl' } );

						createTopLevelMenuWithLocale( locale );

						menuView.isOpen = true;

						expect( spy.firstCall.args[ 0 ].positions ).to.have.ordered.members( [
							MenuBarMenuViewPanelPositioningFunctions.southEast,
							MenuBarMenuViewPanelPositioningFunctions.southWest,
							MenuBarMenuViewPanelPositioningFunctions.northEast,
							MenuBarMenuViewPanelPositioningFunctions.northWest
						] );
					} );
				} );

				describe( 'when the UI language is RTL', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {
						const spy = sinon.spy( MenuBarMenuView, '_getOptimalPosition' );
						const locale = new Locale( { uiLanguage: 'ar' } );

						createTopLevelMenuWithLocale( locale );

						menuView.isOpen = true;

						expect( spy.firstCall.args[ 0 ].positions ).to.have.ordered.members( [
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
						const spy = sinon.spy( MenuBarMenuView, '_getOptimalPosition' );
						const locale = new Locale( { uiLanguage: 'pl' } );

						createSubMenuWithLocale( locale );

						menuView.isOpen = true;

						expect( spy.firstCall.args[ 0 ].positions ).to.have.ordered.members( [
							MenuBarMenuViewPanelPositioningFunctions.eastSouth,
							MenuBarMenuViewPanelPositioningFunctions.eastNorth,
							MenuBarMenuViewPanelPositioningFunctions.westSouth,
							MenuBarMenuViewPanelPositioningFunctions.westNorth
						] );
					} );
				} );

				describe( 'when the UI language is RTL', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {
						const spy = sinon.spy( MenuBarMenuView, '_getOptimalPosition' );
						const locale = new Locale( { uiLanguage: 'ar' } );

						createSubMenuWithLocale( locale );

						menuView.isOpen = true;

						expect( spy.firstCall.args[ 0 ].positions ).to.have.ordered.members( [
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
				const spy = sinon.spy( MenuBarMenuBehaviors, 'openAndFocusPanelOnArrowDownKey' );

				menuView._attachBehaviors();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );

			it( 'should enable a behavior that toggles visibility of the menu upon clicking', () => {
				const spy = sinon.spy( MenuBarMenuBehaviors, 'toggleOnButtonClick' );

				menuView._attachBehaviors();

				sinon.assert.calledOnceWithExactly( spy, menuView );
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
				const spy = sinon.spy( MenuBarMenuBehaviors, 'openOnButtonClick' );

				menuView._attachBehaviors();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );

			it( 'should enable a behavior that opens the menu upon arrow right key press', () => {
				const spy = sinon.spy( MenuBarMenuBehaviors, 'openOnArrowRightKey' );

				menuView._attachBehaviors();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );

			it( 'should enable a behavior that closes the menu upon arrow left key press', () => {
				const spy = sinon.spy( MenuBarMenuBehaviors, 'closeOnArrowLeftKey' );

				menuView._attachBehaviors();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );

			it( 'should enable a behavior that closes the menu when its parent closes', () => {
				const spy = sinon.spy( MenuBarMenuBehaviors, 'closeOnParentClose' );

				menuView._attachBehaviors();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );
		} );
	} );
} );
