/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { FocusTracker, KeystrokeHandler, Locale, keyCodes } from '@ckeditor/ckeditor5-utils';
import { MenuBarMenuView, MenuBarView } from '../../src/index.js';
import MenuBarMenuButtonView from '../../src/menubar/menubarmenubuttonview.js';
import MenuBarMenuPanelView from '../../src/menubar/menubarmenupanelview.js';
import { MenuBarMenuBehaviors } from '../../src/menubar/utils.js';

describe( 'MenuBarMenuView', () => {
	let menuView, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		menuView = new MenuBarMenuView();
		locale = new Locale();
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

		it( 'should have #menuBarView reference', () => {
			expect( menuView.menuBarView ).to.be.null;
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

			it( 'should enable a behavior that opens and focuses the panel on arrow down key', () => {
				const spy = sinon.spy( MenuBarMenuBehaviors, 'openAndFocusPanelOnArrowDownKey' );

				menuView.render();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );

			it( 'should enable a behavior that toggles visibility of the menu upon clicking', () => {
				const spy = sinon.spy( MenuBarMenuBehaviors, 'toggleOnButtonClick' );

				menuView.render();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );

			it( 'should delegate specific events to the menu bar with a prefix', () => {
				menuBarView.children.add( menuView );
				menuBarView.render();

				[ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ].forEach( eventName => {
					const spy = sinon.spy();

					menuBarView.on( 'submenu:' + eventName, spy );
					menuView.fire( eventName );
					sinon.assert.calledOnce( spy );
				} );
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

				menuView.render();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );

			it( 'should enable a behavior that opens the menu upon arrow right key press', () => {
				const spy = sinon.spy( MenuBarMenuBehaviors, 'openOnArrowRightKey' );

				menuView.render();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );

			it( 'should enable a behavior that closes the menu upon arrow left key press', () => {
				const spy = sinon.spy( MenuBarMenuBehaviors, 'closeOnArrowLeftKey' );

				menuView.render();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );

			it( 'should enable a behavior that closes the menu when its parent closes', () => {
				const spy = sinon.spy( MenuBarMenuBehaviors, 'closeOnParentClose' );

				menuView.render();

				sinon.assert.calledOnceWithExactly( spy, menuView );
			} );

			it( 'should delegate specific events to the parent menu', () => {
				menuView.render();

				[ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ].forEach( eventName => {
					const spy = sinon.spy();

					parentMenuView.on( eventName, spy );
					menuView.fire( eventName );
					sinon.assert.calledOnce( spy );
				} );
			} );
		} );

		it( 'should enable a behavior that closes the menu upon the Esc key press', () => {

		} );

		describe( 'panel repositioning upon open', () => {
			it( 'should update the position whenever the menu gets open (but not when it closes)', () => {

			} );

			describe( 'top-level menu', () => {
				describe( 'when the UI language is LTR', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {

					} );
				} );

				describe( 'when the UI language is RTL', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {

					} );
				} );
			} );

			describe( 'sub-menu', () => {
				describe( 'when the UI language is LTR', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {

					} );
				} );

				describe( 'when the UI language is RTL', () => {
					it( 'should use a specific set of positioning functions in a specific priority order', () => {

					} );
				} );
			} );
		} );
	} );
} );
