/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { keyCodes } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import DropdownMenuRootListView from '../../../src/dropdown/menu/dropdownmenurootlistview.js';
import { createMockMenuDefinition } from './_utils/dropdowntreemock.js';

describe( 'Menu Behaviors', () => {
	let clock, editor, element, locale, body, rootListView;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await ClassicTestEditor.create( element );
		locale = editor.locale;
		body = editor.ui.view.body;
		clock = sinon.useFakeTimers();
	} );

	afterEach( async () => {
		element.remove();
		await editor.destroy();
		clock.restore();
	} );

	describe( 'DropdownRootMenuBehaviors', () => {
		let menuView, otherMenu;

		beforeEach( () => {
			rootListView = createRootListView();

			menuView = menuViewById( 'menu_1' );
			otherMenu = menuViewById( 'menu_2' );
		} );

		afterEach( () => {
			rootListView.destroy();
			rootListView.element.remove();
		} );

		describe( 'toggleMenusAndFocusItemsOnHover', () => {
			it( 'should focus hovered item and set `isOpen` if it is a nested menu', () => {
				const menuViewFocus = sinon.spy( menuView, 'focus' );

				menuView.fire( 'mouseenter' );

				expect( menuViewFocus ).to.be.calledOnce;
				expect( menuView.isOpen ).to.be.true;
				expect( otherMenu.isOpen ).to.be.false; // Just in case check that only `menuView` is opened.

				const itemView = itemByButtonId( 'menu_1_foo' );
				const itemViewFocus = sinon.spy( itemView, 'focus' );

				itemView.element.dispatchEvent( new Event( 'mouseenter' ) );

				expect( itemViewFocus ).to.be.calledOnce;

				// Check if menus are still correctly open.
				expect( menuView.isOpen ).to.be.true;
				expect( otherMenu.isOpen ).to.be.false;
			} );
		} );

		describe( 'closeMenuWhenAnotherOnTheSameLevelOpens', () => {
			it( 'should close a nested menu if other opens on the same level', () => {
				otherMenu.isOpen = true;

				expect( menuView.isOpen ).to.be.false;

				menuView.fire( 'mouseenter' );

				expect( menuView.isOpen ).to.be.true;
				expect( otherMenu.isOpen ).to.be.false;
			} );

			it( 'should not close a nested menu if other opens on nested level', () => {
				otherMenu.isOpen = true; // Menu 2.

				const nestedMenu = menuViewById( 'menu_2_1' ); // Menu nested in Menu 2.

				expect( nestedMenu.isOpen ).to.be.false;

				nestedMenu.fire( 'mouseenter' );

				expect( nestedMenu.isOpen ).to.be.true;
				expect( otherMenu.isOpen ).to.be.true;
			} );
		} );
	} );

	describe( 'DropdownMenuBehaviors', () => {
		const arrowKeyboardMappings = [
			[ 'arrowleft', 'arrowright', 'rtl' ],
			[ 'arrowright', 'arrowleft', 'ltr' ]
		];

		let menuView;

		afterEach( () => {
			rootListView.destroy();
			rootListView.element.remove();
		} );

		for ( const [ openArrowKey, hideArrowKey, uiDirection ] of arrowKeyboardMappings ) {
			describe( uiDirection.toUpperCase(), () => {
				beforeEach( () => {
					locale.uiLanguageDirection = uiDirection;

					rootListView = createRootListView();

					menuView = menuViewById( 'menu_1' );
				} );

				describe( 'openOnArrowRightKey', () => {
					it( 'should not open menu on arrow right key if not focused', () => {
						menuView.isOpen = false;
						menuView.keystrokes.press( getArrowKeyData( openArrowKey ) );
						expect( menuView.isOpen ).to.be.false;
					} );

					it( 'should open menu on arrow right key if focused', () => {
						menuView.isOpen = false;
						menuView.focusTracker._focus( menuView.buttonView.element );
						menuView.keystrokes.press( getArrowKeyData( openArrowKey ) );
						expect( menuView.isOpen ).to.be.true;
					} );

					it( 'should not open menu on arrow right key if focused and disabled', () => {
						menuView.isOpen = false;
						menuView.isEnabled = false;
						menuView.focusTracker._focus( menuView.buttonView.element );
						menuView.keystrokes.press( getArrowKeyData( openArrowKey ) );
						expect( menuView.isOpen ).to.be.false;
					} );

					it( 'should not toggle menu on arrow right key when menu is already open', () => {
						menuView.isOpen = true;
						menuView.focusTracker._focus( menuView.buttonView.element );
						menuView.keystrokes.press( getArrowKeyData( openArrowKey ) );
						expect( menuView.isOpen ).to.be.true;
					} );
				} );

				describe( 'closeOnArrowLeftKey', () => {
					it( 'should not toggle menu on arrow left key when menu is already closed', () => {
						menuView.isOpen = false;
						menuView.focusTracker._focus( menuView.buttonView.element );
						menuView.keystrokes.press( getArrowKeyData( hideArrowKey ) );
						expect( menuView.isOpen ).to.be.false;
					} );

					it( 'should close menu on arrow left key', () => {
						menuView.isOpen = true;
						menuView.keystrokes.press( getArrowKeyData( hideArrowKey ) );
						expect( menuView.isOpen ).to.be.false;
					} );
				} );
			} );
		}

		describe( 'closeOnEscKey', () => {
			beforeEach( () => {
				rootListView = createRootListView();
				menuView = menuViewById( 'menu_2_1' );
			} );

			it( 'should not toggle menu on esc key when menu is already closed', () => {
				menuView.isOpen = false;
				menuView.focusTracker._focus( menuView.buttonView.element );
				menuView.keystrokes.press( getEscKeyData() );
				expect( menuView.isOpen ).to.be.false;
			} );

			it( 'should close menu on esc key', () => {
				menuView.isOpen = true;
				menuView.keystrokes.press( getEscKeyData() );
				expect( menuView.isOpen ).to.be.false;
			} );
		} );

		describe( 'closeOnParentClose', () => {
			it( 'should close nested menu when parent menu is closed', () => {
				rootListView = createRootListView();

				const grandParentMenuView = menuViewById( 'menu_2' );
				const nestedMenuView = menuViewById( 'menu_2_1' );

				grandParentMenuView.isOpen = true;
				nestedMenuView.isOpen = true;

				grandParentMenuView.isOpen = false;
				expect( nestedMenuView.isOpen ).to.be.false;
			} );
		} );

		describe( 'openOnButtonClick', () => {
			beforeEach( () => {
				rootListView = createRootListView();
			} );

			it( 'should open menu on button click', () => {
				const menuView = menuViewById( 'menu_1' );

				menuView.buttonView.fire( 'execute' );
				expect( menuView.isOpen ).to.be.true;
			} );

			it( 'should not open menu on button click if disabled', () => {
				const menuView = menuViewById( 'menu_1' );

				menuView.isEnabled = false;
				menuView.buttonView.fire( 'execute' );
				expect( menuView.isOpen ).to.be.false;
			} );

			it( 'should not close menu on button click if already open', () => {
				const menuView = menuViewById( 'menu_1' );

				menuView.isOpen = true;
				menuView.buttonView.fire( 'execute' );
				expect( menuView.isOpen ).to.be.true;
			} );
		} );

		describe( 'openAndFocusOnEnterKeyPress()', () => {
			beforeEach( () => {
				rootListView = createRootListView();
			} );

			it( 'should open the menu and focus its panel upon enter key press', () => {
				const menuView = menuViewById( 'menu_1' );
				const keyEvtData = {
					keyCode: keyCodes.enter,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				const focusSpy = sinon.spy( menuView.panelView, 'focus' );

				menuView.buttonView.focus();
				menuView.keystrokes.press( keyEvtData );

				expect( menuView.isOpen ).to.be.true;

				sinon.assert.calledOnce( focusSpy );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
			} );

			it( 'should not intercept enter key press from anywhere but the button view', () => {
				const menuView = menuViewById( 'menu_1' );
				const keyEvtData = {
					keyCode: keyCodes.enter,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				const focusSpy = sinon.spy( menuView.panelView, 'focus' );

				menuView.keystrokes.press( keyEvtData );

				expect( menuView.isOpen ).to.be.false;

				sinon.assert.notCalled( focusSpy );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
			} );
		} );
	} );

	function createRootListView() {
		const rootListView = new DropdownMenuRootListView( locale, body, [
			createMockMenuDefinition( 'Menu 1' ),
			createMockMenuDefinition( 'Menu 2', [
				createMockMenuDefinition( 'Menu 2 1' )
			] )
		] );

		rootListView.render();
		document.body.appendChild( rootListView.element );

		return rootListView;
	}

	function menuViewById( id ) {
		return rootListView.menus.find( menu => menu.id == id );
	}

	function itemByButtonId( id ) {
		for ( const menu of rootListView.menus ) {
			for ( const item of menu.listView.items ) {
				if ( item.childView.id == id ) {
					return item;
				}
			}
		}

		return null;
	}

	function getArrowKeyData( arrow ) {
		return {
			keyCode: keyCodes[ arrow ],
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};
	}

	function getEscKeyData() {
		return {
			keyCode: keyCodes.esc,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};
	}
} );
