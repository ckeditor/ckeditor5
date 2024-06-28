/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event */

import { keyCodes } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import DropdownMenuRootListView from '../../../../src/dropdown/menu/dropdownmenurootlistview.js';
import { DropdownMenuListItemButtonView, DropdownMenuListItemView, DropdownMenuView } from '../../../../src/index.js';
import { createMockMenuDefinition } from '../_utils/dropdowntreemock.js';
import { findMenuTreeItemByLabel } from '../_utils/dropdowntreeutils.js';

describe( 'Menu Behaviors', () => {
	let clock, editor, element;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await ClassicTestEditor.create( element );
		clock = sinon.useFakeTimers();
	} );

	afterEach( async () => {
		element.remove();
		await editor.destroy();
		clock.restore();
	} );

	describe( 'DropdownRootMenuBehaviors', () => {
		let rootListView, tree;

		beforeEach( () => {
			rootListView = new DropdownMenuRootListView( editor, [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			] );

			rootListView.render();
			document.body.appendChild( rootListView.element );

			tree = rootListView.tree;
		} );

		afterEach( () => {
			rootListView.destroy();
			rootListView.element.remove();
		} );

		describe( 'closeWhenOutsideElementFocused', () => {
			let menuView;

			beforeEach( () => {
				menuView = treeNodeByLabel( 'Menu 1' ).menu;
				menuView.isOpen = true;
			} );

			it( 'should close when outside element is focused', () => {
				const button = document.createElement( 'button' );
				document.body.appendChild( button );

				sinon.stub( rootListView.element, 'contains' ).returns( false );
				stubActiveDocumentElement( button );

				clock.tick( 10 );
				expect( rootListView.isOpen ).to.be.false;
				button.remove();
			} );

			it( 'should not close if element inside menu is focused', () => {
				const button = document.createElement( 'button' );
				menuView.element.appendChild( button );

				sinon.stub( rootListView.element, 'contains' ).returns( true );
				stubActiveDocumentElement( button );

				clock.tick( 10 );
				expect( rootListView.isOpen ).to.be.true;
				button.remove();
			} );

			function stubActiveDocumentElement( element ) {
				element.focus();
				document.dispatchEvent( new Event( 'focus' ) );
			}
		} );

		describe( 'toggleMenusAndFocusItemsOnHover / closeMenuWhenAnotherOnTheSameLevelOpens', () => {
			let menuView, otherMenu;

			beforeEach( () => {
				menuView = treeNodeByLabel( 'Menu 1' ).menu;
				otherMenu = treeNodeByLabel( 'Menu 2' ).menu;
			} );

			it( 'should close other menu on hover menu button item', () => {
				otherMenu.isOpen = true;

				expect( menuView.isOpen ).to.be.false;

				menuView.fire( 'mouseenter' );

				expect( menuView.isOpen ).to.be.true;
				expect( otherMenu.isOpen ).to.be.false;
			} );

			it( 'should close other menu on hover custom menu list item instance', () => {
				const menuInstance = new DropdownMenuView( editor, 'Baz' );
				const nestedMenuListItem = new DropdownMenuListItemView(
					editor.locale,
					menuInstance,
					new DropdownMenuView( editor, 'Nested Menu Menu' )
				);

				menuInstance.menuItems.add( nestedMenuListItem );
				rootListView.factory.appendMenuChildrenAt(
					[ menuInstance ],
					treeNodeByLabel( 'Menu 2' ).menu
				);

				otherMenu.isOpen = true;
				nestedMenuListItem.fire( 'mouseenter' );

				expect( nestedMenuListItem.flatItemOrNestedMenuView.isOpen ).to.be.true;
			} );

			it( 'should focus hovered item only if any other menu was open and it\'s listView had focus', () => {
				otherMenu.isOpen = true;
				rootListView.factory.appendMenuChildrenAt(
					[
						new DropdownMenuListItemButtonView( editor.locale, 'Foo' )
					],
					otherMenu
				);

				sinon
					.stub( otherMenu.panelView.element, 'contains' )
					.withArgs( document.activeElement )
					.returns( true );

				const menuViewFocus = sinon.spy( menuView, 'focus' );

				expect( menuViewFocus ).not.to.be.called;

				menuView.fire( 'mouseenter' );

				expect( menuViewFocus ).to.be.calledOnce;
				expect( menuView.isOpen ).to.be.true;
				expect( otherMenu.isOpen ).to.be.false;

				menuView.isOpen = false;
			} );

			it( 'should focus hovered item only if any other menu was open and it had focus', () => {
				otherMenu.isOpen = true;
				rootListView.factory.appendMenuChildrenAt(
					[
						new DropdownMenuListItemButtonView( editor.locale, 'Foo' )
					],
					otherMenu
				);

				sinon
					.stub( otherMenu.element, 'contains' )
					.withArgs( document.activeElement )
					.returns( true );

				const menuViewFocus = sinon.spy( menuView, 'focus' );

				expect( menuViewFocus ).not.to.be.called;

				menuView.fire( 'mouseenter' );

				expect( menuViewFocus ).to.be.calledOnce;
				expect( menuView.isOpen ).to.be.true;
				expect( otherMenu.isOpen ).to.be.false;
			} );
		} );

		describe( 'closeOnClickOutside', () => {
			let menuView;

			beforeEach( () => {
				menuView = treeNodeByLabel( 'Menu 1' ).menu;
				menuView.isOpen = true;
			} );

			it( 'should close menu when clicked outside', () => {
				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
				clock.tick( 10 );
				expect( menuView.isOpen ).to.be.false;
			} );

			it( 'should not close menu when clicked nested menu', () => {
				menuView.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
				clock.tick( 10 );
				expect( menuView.isOpen ).to.be.true;
			} );
		} );

		function treeNodeByLabel( label ) {
			return findMenuTreeItemByLabel( label, tree );
		}
	} );

	describe( 'DropdownMenuBehaviors', () => {
		let rootListView, tree;

		const arrowKeyboardMappings = [
			[ 'arrowleft', 'arrowright', 'rtl' ],
			[ 'arrowright', 'arrowleft', 'ltr' ]
		];

		for ( const [ openArrowKey, hideArrowKey, uiDirection ] of arrowKeyboardMappings ) {
			let menuView;

			beforeEach( () => {
				editor.locale.uiLanguageDirection = uiDirection;
				createBasicMenuRootListView( editor.locale );

				menuView = treeNodeByLabel( 'Menu 1' ).menu;
			} );

			describe( `openOnArrowRightKey (${ uiDirection.toUpperCase() })`, () => {
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

			describe( `closeOnArrowLeftKey(${ uiDirection.toUpperCase() })`, () => {
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
		}

		describe( 'closeOnParentClose', () => {
			it( 'should close nested menu when parent menu is closed', () => {
				rootListView = new DropdownMenuRootListView( editor, [
					createMockMenuDefinition( 'Menu 1', [
						createMockMenuDefinition( 'Menu 1.1' )
					] )
				] );

				tree = rootListView.tree;

				const grandParentMenuView = treeNodeByLabel( 'Menu 1' ).menu;
				const nestedMenuView = treeNodeByLabel( 'Menu 1.1' ).menu;

				grandParentMenuView.isOpen = true;
				nestedMenuView.isOpen = true;

				clock.tick( 10 );
				expect( rootListView.isOpen ).to.be.true;

				grandParentMenuView.isOpen = false;
				expect( nestedMenuView.isOpen ).to.be.false;

				clock.tick( 10 );
				expect( rootListView.isOpen ).to.be.false;
			} );
		} );

		describe( 'openOnButtonClick', () => {
			beforeEach( createBasicMenuRootListView );

			it( 'should open menu on button click', () => {
				const menuView = treeNodeByLabel( 'Menu 1' ).menu;

				menuView.buttonView.fire( 'execute' );
				expect( menuView.isOpen ).to.be.true;
			} );

			it( 'should not open menu on button click if disabled', () => {
				const menuView = treeNodeByLabel( 'Menu 1' ).menu;

				menuView.isEnabled = false;
				menuView.buttonView.fire( 'execute' );
				expect( menuView.isOpen ).to.be.false;
			} );

			it( 'should not close menu on button click if already open', () => {
				const menuView = treeNodeByLabel( 'Menu 1' ).menu;

				menuView.isOpen = true;
				menuView.buttonView.fire( 'execute' );
				expect( menuView.isOpen ).to.be.true;
			} );
		} );

		function createBasicMenuRootListView( overrideLocale = editor.locale ) {
			editor.locale = overrideLocale;
			rootListView = new DropdownMenuRootListView( editor, [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			] );

			tree = rootListView.tree;
		}

		function treeNodeByLabel( label ) {
			return findMenuTreeItemByLabel( label, tree );
		}
	} );

	function getArrowKeyData( arrow ) {
		return {
			keyCode: keyCodes[ arrow ],
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};
	}
} );
