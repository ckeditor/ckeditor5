/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import {
	FocusTracker,
	KeystrokeHandler,
	Locale
} from '@ckeditor/ckeditor5-utils';

import DropdownMenuButtonView from '../../../src/dropdown/menu/dropdownmenubuttonview.js';
import DropdownMenuNestedMenuPanelView from '../../../src/dropdown/menu/dropdownmenunestedmenupanelview.js';
import { DropdownMenuNestedMenuView, DropdownMenuPanelPositioningFunctions } from '../../../src/index.js';
import { DropdownMenuBehaviors } from '../../../src/dropdown/menu/dropdownmenubehaviors.js';

describe( 'DropdownMenuNestedMenuView', () => {
	let menuView, element, editor, parentMenuView, locale, body;

	testUtils.createSinonSandbox();

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
			expect( menuView.buttonView ).to.be.instanceOf( DropdownMenuButtonView );
		} );

		it( 'should have a panel view', () => {
			expect( menuView.panelView ).to.be.instanceOf( DropdownMenuNestedMenuPanelView );
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

		describe( 'template and DOM element', () => {
			beforeEach( () => {
				menuView.render();
			} );

			it( 'should have CSS classes', () => {
				expect( menuView.template.attributes.class ).to.include.members( [ 'ck', 'ck-dropdown-menu-list__nested-menu' ] );
			} );

			it( 'should have a presentation role to keep the a11y tree clean', () => {
				expect( menuView.template.attributes.role ).to.include.members( [ 'presentation' ] );
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

		// https://github.com/cksource/ckeditor5-commercial/issues/6633
		it( 'should add the #listView to the focus tracker to allow for linking focus trackers and sharing state of nested menus', () => {
			const focusTrackerAddSpy = sinon.spy( menuView.focusTracker, 'add' );

			menuView.render();

			sinon.assert.calledWithExactly( focusTrackerAddSpy.thirdCall, menuView.listView );
		} );

		it( 'should start listening to keystrokes', () => {
			const keystrokeHandlerAddSpy = sinon.spy( menuView.keystrokes, 'listenTo' );

			menuView.render();

			sinon.assert.calledOnceWithExactly( keystrokeHandlerAddSpy, menuView.element );
		} );
	} );

	describe( 'panel repositioning upon open', () => {
		it( 'should use a specific set of positioning functions in a specific priority order (LTR)', () => {
			const spy = sinon.spy( menuView.panelView, 'pin' );

			menuView.render();
			document.body.appendChild( menuView.element );

			menuView.isOpen = true;

			expect( spy ).to.be.calledOnce;
			expect( spy.firstCall.args[ 0 ].positions ).to.have.ordered.members( [
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

			const spy = sinon.spy( rtlMenuView.panelView, 'pin' );

			rtlMenuView.render();
			document.body.appendChild( rtlMenuView.element );

			rtlMenuView.isOpen = true;

			expect( spy.firstCall.args[ 0 ].positions ).to.have.ordered.members( [
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

	describe( 'focus()', () => {
		it( 'should focus the button view', () => {
			const spy = sinon.spy( menuView.buttonView, 'focus' );

			menuView.render();
			menuView.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( '_attachBehaviors', () => {
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
