/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import {
	FocusTracker,
	KeystrokeHandler,
	Locale
} from '@ckeditor/ckeditor5-utils';

import { createMockLocale } from './_utils/dropdowntreemock.js';

import { DropdownMenuView } from '../../../src/index.js';
import DropdownMenuButtonView from '../../../src/dropdown/menu/dropdownmenubuttonview.js';
import DropdownMenuPanelView from '../../../src/dropdown/menu/dropdownmenupanelview.js';
import { DropdownMenuBehaviors } from '../../../src/dropdown/menu/utils/dropdownmenubehaviors.js';
import { DropdownMenuViewPanelPositioningFunctions } from '../../../src/dropdown/menu/utils/dropdownmenupositioningfunctions.js';

describe( 'DropdownMenuView', () => {
	let menuView, parentMenuView, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = createMockLocale();
		parentMenuView = new DropdownMenuView( locale );
		menuView = new DropdownMenuView( locale, 'Hello' );
		menuView.parentMenuView = parentMenuView;
	} );

	afterEach( () => {
		if ( menuView.element ) {
			menuView.element.remove();
		}

		menuView.destroy();

		if ( parentMenuView ) {
			parentMenuView.destroy();
		}
	} );

	describe( 'constructor()', () => {
		it( 'should have a button view', () => {
			expect( menuView.buttonView ).to.be.instanceOf( DropdownMenuButtonView );
		} );

		it( 'should have a panel view', () => {
			expect( menuView.panelView ).to.be.instanceOf( DropdownMenuPanelView );
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
			expect( menuView.parentMenuView ).not.to.be.null;
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
				expect( menuView.template.attributes.class ).to.include.members( [ 'ck', 'ck-dropdown-menu__menu' ] );
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
				const menuView = new DropdownMenuView( locale );
				const parentMenuView = new DropdownMenuView( locale );

				menuView.parentMenuView = parentMenuView;
				menuView.render();
				parentMenuView.render();

				expect( menuView.element.classList.contains( 'ck-dropdown-menu__menu_top-level' ) ).to.be.false;

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

		it( 'should enable a behavior that closes the menu upon the Esc key press', () => {
			const spy = sinon.spy( DropdownMenuBehaviors, 'closeOnEscKey' );

			menuView.render();

			sinon.assert.calledOnceWithExactly( spy, menuView );
		} );

		describe( 'panel repositioning upon open', () => {
			it( 'should update the position whenever the menu gets open (but not when it closes)', () => {
				menuView.render();
				menuView.panelView.position = null;
				menuView.isOpen = true;

				expect( menuView.panelView.position ).to.not.be.null;

				const newPositionName = menuView.panelView.position;
				menuView.isOpen = false;
				expect( menuView.panelView.position ).to.equal( newPositionName );
			} );

			it( 'should use the default position if none were considered optimal (because off the viewport, etc.)', () => {
				sinon.stub( DropdownMenuView, '_getOptimalPosition' ).returns( null );

				menuView.render();
				menuView.panelView.position = null;
				menuView.isOpen = true;

				expect( menuView.panelView.position ).to.equal( menuView._panelPositions[ 0 ].name );
			} );

			describe( 'when the UI language is LTR', () => {
				it( 'should use a specific set of positioning functions in a specific priority order', () => {
					const spy = sinon.spy( DropdownMenuView, '_getOptimalPosition' );
					const locale = new Locale( { uiLanguage: 'pl' } );

					createSubMenuWithLocale( locale );

					menuView.isOpen = true;

					expect( spy.firstCall.args[ 0 ].positions ).to.have.ordered.members( [
						DropdownMenuViewPanelPositioningFunctions.eastSouth,
						DropdownMenuViewPanelPositioningFunctions.eastNorth,
						DropdownMenuViewPanelPositioningFunctions.westSouth,
						DropdownMenuViewPanelPositioningFunctions.westNorth
					] );
				} );
			} );

			describe( 'when the UI language is RTL', () => {
				it( 'should use a specific set of positioning functions in a specific priority order', () => {
					const spy = sinon.spy( DropdownMenuView, '_getOptimalPosition' );
					const locale = new Locale( { uiLanguage: 'ar' } );

					createSubMenuWithLocale( locale );

					menuView.isOpen = true;

					expect( spy.firstCall.args[ 0 ].positions ).to.have.ordered.members( [
						DropdownMenuViewPanelPositioningFunctions.westSouth,
						DropdownMenuViewPanelPositioningFunctions.westNorth,
						DropdownMenuViewPanelPositioningFunctions.eastSouth,
						DropdownMenuViewPanelPositioningFunctions.eastNorth
					] );
				} );
			} );

			function createSubMenuWithLocale( locale ) {
				if ( parentMenuView ) {
					parentMenuView.destroy();
				}

				if ( menuView ) {
					menuView.destroy();
				}

				menuView = new DropdownMenuView( locale );
				parentMenuView = new DropdownMenuView( locale );

				menuView.parentMenuView = parentMenuView;
				menuView.render();
				document.body.appendChild( menuView.element );
			}
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the button view', () => {
			const spy = sinon.spy( menuView.buttonView, 'focus' );

			menuView.render();
			menuView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( '_attachBehaviors', () => {
		let parentMenuView;

		beforeEach( () => {
			parentMenuView = new DropdownMenuView( locale );

			menuView.parentMenuView = parentMenuView;
		} );

		afterEach( () => {
			parentMenuView.destroy();
		} );

		it( 'should enable a behavior that shows the menu upon clicking', () => {
			const spy = sinon.spy( DropdownMenuBehaviors, 'openOnButtonClick' );

			menuView._attachBehaviors();

			sinon.assert.calledOnceWithExactly( spy, menuView );
		} );

		it( 'should enable a behavior that opens the menu upon arrow right key press', () => {
			const spy = sinon.spy( DropdownMenuBehaviors, 'openOnArrowRightKey' );

			menuView._attachBehaviors();

			sinon.assert.calledOnceWithExactly( spy, menuView );
		} );

		it( 'should enable a behavior that closes the menu upon arrow left key press', () => {
			const spy = sinon.spy( DropdownMenuBehaviors, 'closeOnArrowLeftKey' );

			menuView._attachBehaviors();

			sinon.assert.calledOnceWithExactly( spy, menuView );
		} );
	} );
} );
