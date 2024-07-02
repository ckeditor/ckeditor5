/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import DropdownMenuRootListView from '../../../src/dropdown/menu/dropdownmenurootlistview.js';
import { DropdownRootMenuBehaviors } from '../../../src/dropdown/menu/utils/dropdownmenubehaviors.js';
import {
	DropdownMenuListItemButtonView,
	DropdownMenuListItemView,
	DropdownMenuView,
	ListSeparatorView
} from '../../../src/index.js';

import {
	createBlankRootListView,
	createMockDropdownMenuDefinition,
	createMockMenuDefinition
} from './_utils/dropdowntreemock.js';

import { DropdownMenuFactory } from '../../../src/dropdown/menu/dropdownmenufactory.js';
import {
	findMenuTreeMenuViewByLabel,
	findMenuTreeItemByLabel,
	findMenuTreeViewFlatItemByLabel
} from './_utils/dropdowntreeutils.js';

describe( 'DropdownMenuRootListView', () => {
	let rootListView, element, editor;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element );
		rootListView = new DropdownMenuRootListView( editor );
	} );

	afterEach( async () => {
		await editor.destroy();

		rootListView.destroy();
		element.remove();
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			rootListView.render();
		} );

		it( 'should inherit from DropdownMenuListView', () => {
			expect( rootListView ).to.be.instanceOf( DropdownMenuRootListView );
		} );

		it( 'should have a specific CSS class', () => {
			expect( rootListView.element.classList.contains( 'ck-dropdown-menu' ) ).to.be.true;
		} );

		it( 'should have a specific role', () => {
			expect( rootListView.role ).to.equal( 'menu' );
		} );

		it( 'should set isOpen property to false', () => {
			expect( rootListView.isOpen ).to.be.false;
		} );

		it( 'should define top level menus if definition passed', () => {
			const definedRootListView = new DropdownMenuRootListView( editor, [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			] );

			const tree = definedRootListView.items;

			expect( findMenuTreeItemByLabel( 'Menu 1', tree ) ).not.to.be.null;
			expect( findMenuTreeItemByLabel( 'Menu 2', tree ) ).not.to.be.null;
			expect( findMenuTreeItemByLabel( 'Non existing menu', tree ) ).to.be.null;

			definedRootListView.destroy();
		} );
	} );

	describe( 'getCurrentlyVisibleMenusElements()', () => {
		it( 'should return all visible menus', () => {
			const rootListView = createRootListWithDefinition(
				[
					createMockMenuDefinition( 'Menu 1' ),
					createMockMenuDefinition( 'Menu 2' )
				]
			);

			const menu1 = findMenuTreeMenuViewByLabel( 'Menu 1', rootListView.items );
			const menu2 = findMenuTreeMenuViewByLabel( 'Menu 2', rootListView.items );

			menu1.isOpen = true;
			menu2.isOpen = true;

			const visibleMenus = rootListView.getCurrentlyVisibleMenusElements();

			expect( visibleMenus ).to.be.deep.equal( [
				menu1.panelView.element,
				menu2.panelView.element
			] );
		} );
	} );

	describe( 'close()', () => {
		let tree, clock;

		beforeEach( () => {
			rootListView.destroy();
			rootListView = new DropdownMenuRootListView( editor, [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			] );

			rootListView.render();
			tree = rootListView.items;
			clock = sinon.useFakeTimers();
		} );

		afterEach( () => {
			clock.restore();
		} );

		it( 'should be set to false if close() is called', () => {
			const menu = findMenuTreeMenuViewByLabel( 'Menu 1', tree );

			menu.isOpen = true;

			expect( rootListView.isOpen ).to.be.true;

			rootListView.close();
			clock.tick( 10 );

			expect( rootListView.isOpen ).to.be.false;
		} );

		it( 'should close all menus', () => {
			const rootListView = createRootListWithDefinition(
				createMockMenuDefinition()
			);

			rootListView.close();

			expect( rootListView.menus.some( menu => menu.isOpen ) ).to.be.false;
		} );
	} );

	describe( 'render()', () => {
		it( 'should add a behavior that makes the menus open and close while hovering using mouse by the user if ' +
			'the bar is already open', () => {
			const spy = sinon.spy( DropdownRootMenuBehaviors, 'toggleMenusAndFocusItemsOnHover' );

			rootListView.render();

			sinon.assert.calledOnceWithExactly( spy, rootListView );
		} );

		it( 'should add a behavior that closes a sub-menu when another one opens on the same level', () => {
			const spy = sinon.spy( DropdownRootMenuBehaviors, 'closeMenuWhenAnotherOnTheSameLevelOpens' );

			rootListView.render();

			sinon.assert.calledOnceWithExactly( spy, rootListView );
		} );

		it( 'should add a behavior that closes a sub-menu when another element in document is focused', () => {
			const spy = sinon.spy( DropdownRootMenuBehaviors, 'closeWhenOutsideElementFocused' );

			rootListView.render();

			sinon.assert.calledOnceWithExactly( spy, rootListView );
		} );

		it( 'should add a behavior that closes the bar when the user clicked somewhere outside of it', () => {
			const spy = sinon.spy( DropdownRootMenuBehaviors, 'closeOnClickOutside' );

			rootListView.render();

			sinon.assert.calledOnceWithExactly( spy, rootListView );
		} );
	} );

	describe( 'events', () => {
		const delegatedEvents = [ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen', 'item:execute' ];

		for ( const event of delegatedEvents ) {
			it( `should delegate ${ event } event to root menu view`, () => {
				const menuRootList = createBlankRootListView( editor );
				const menuInstance = new DropdownMenuView( editor, 'Hello World' );

				menuRootList.factory.appendChild(
					{
						menu: 'Menu Root',
						children: [ menuInstance ]
					}
				);

				const eventWatcherSpy = sinon.spy();

				menuRootList.on( `menu:${ event }`, eventWatcherSpy );
				menuInstance.fire( event );

				expect( eventWatcherSpy ).to.be.calledOnce;
			} );

			it( 'should delegate nested menu in custom menu instance event to root menu view', () => {
				const menuRootList = createBlankRootListView( editor );
				const menuInstance = new DropdownMenuView( editor, 'Hello World' );
				const nestedMenuInstance = new DropdownMenuView( editor, 'Nested Menu Menu' );

				menuInstance.menuItems.add(
					new DropdownMenuListItemView( editor.locale, menuInstance, nestedMenuInstance )
				);

				menuRootList.factory.appendChild(
					{
						menu: 'Menu Root',
						children: [ menuInstance ]
					}
				);

				const eventWatcherSpy = sinon.spy();

				menuRootList.on( `menu:${ event }`, eventWatcherSpy );
				nestedMenuInstance.fire( event );

				expect( eventWatcherSpy ).to.be.calledOnce;
			} );
		}

		it( 'should emit `menu:item:execute` event when item is executed', () => {
			const { menuRootList } = createMockDropdownMenuDefinition( editor );
			const eventWatcherSpy = sinon.spy();

			menuRootList.on( 'menu:item:execute', eventWatcherSpy );

			const insertedChild = findMenuTreeViewFlatItemByLabel( 'Foo', menuRootList.items );

			insertedChild.fire( 'execute' );
			expect( eventWatcherSpy ).to.be.calledOnce;
		} );

		it( 'should close all menus when `menu:item:execute` occurs', () => {
			const { menuRootList } = createMockDropdownMenuDefinition( editor );

			const menu = findMenuTreeMenuViewByLabel( 'Menu 2', menuRootList.items );
			const child = findMenuTreeViewFlatItemByLabel( 'Foo', menuRootList.items );

			menu.isOpen = true;

			expect( menuRootList.isOpen ).to.be.true;
			expect( menuRootList.menus.some( menu => menu.isOpen ) ).to.be.true;

			child.fire( 'execute' );

			expect( menuRootList.menus.some( menu => menu.isOpen ) ).to.be.false;
		} );
	} );

	describe( 'menuPanelClass', () => {
		it( 'should append `menuPanelClass` to every added submenu via constructor definition', () => {
			const rootListView = createRootListWithDefinition(
				createMockMenuDefinition(),
				{
					menuPanelClass: 'foo-bar'
				}
			);

			const menus = rootListView.menus.filter( menu => menu.panelView.element.classList.contains( 'foo-bar' ) ).length;

			expect( menus ).to.be.equal( 1 );
		} );

		it( 'should append `menuPanelClass` to every added submenu via appendChildren()', () => {
			const rootListView = createRootListWithDefinition(
				[],
				{
					menuPanelClass: 'foo-bar'
				}
			);

			rootListView.factory.appendChildren( [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			] );

			const menus = rootListView.menus.filter( menu => menu.panelView.element.classList.contains( 'foo-bar' ) ).length;

			expect( menus ).to.be.equal( 2 );
		} );

		it( 'should append `menuPanelClass` to reusing menu instance', () => {
			const rootListView = createRootListWithDefinition(
				[
					{
						menu: 'Tralala',
						children: [ new DropdownMenuView( editor, 'Hello World 1' ) ]
					},
					{
						menu: 'Tralala',
						children: [ new DropdownMenuView( editor, 'Hello World 2' ) ]
					}
				],
				{
					menuPanelClass: 'foo-bar'
				}
			);

			rootListView.factory.appendChild(
				{
					menu: 'Menu Root',
					children: [ new DropdownMenuView( editor, 'Hello World 3' ) ]
				}
			);

			const menus = rootListView.menus.filter( menu => menu.panelView.element.classList.contains( 'foo-bar' ) ).length;

			expect( menus ).to.be.equal( 6 );
		} );
	} );

	describe( 'factory', () => {
		it( 'returns instance of DropdownMenuFactory', () => {
			expect( rootListView.factory ).to.be.instanceOf( DropdownMenuFactory );
		} );

		describe( 'appendChildren()', () => {
			it( 'should not crash if called with empty array', () => {
				expect( () => {
					const rootListView = createRootListWithDefinition();

					rootListView.factory.appendChildren( [] );
				} ).not.to.throw();
			} );

			it( 'should append top level menus', () => {
				const rootListView = createRootListWithDefinition();

				rootListView.factory.appendChildren( [
					createMockMenuDefinition( 'Menu 2' ),
					createMockMenuDefinition( 'Menu 3' )
				] );

				rootListView.factory.appendChildren( [
					createMockMenuDefinition( 'Menu 4' )
				] );

				expect( rootListView.menus.map( menu => menu.buttonView.label ) ).to.be.deep.equal(
					[ 'Menu 1', 'Menu 2', 'Menu 3', 'Menu 4' ]
				);
			} );
		} );

		describe( 'appendChild()', () => {
			it( 'should append top level menu', () => {
				const rootListView = createRootListWithDefinition( [] );

				rootListView.factory.appendChild( createMockMenuDefinition( 'Menu 1' ) );
				rootListView.factory.appendChild( createMockMenuDefinition( 'Menu 2' ) );

				expect( rootListView.menus.map( menu => menu.buttonView.label ) ).to.be.deep.equal(
					[ 'Menu 1', 'Menu 2' ]
				);
			} );
		} );

		describe( 'appendMenuChildrenAt()', () => {
			it( 'should append flat menu items using definition only', () => {
				const onExecuteSpy = sinon.spy();
				const rootListView = createRootListWithDefinition(
					{
						menu: 'Hello World',
						children: []
					}
				);

				rootListView.factory.appendMenuChildrenAt(
					[
						{
							label: 'Baz',
							onExecute: onExecuteSpy
						}
					],
					findMenuTreeMenuViewByLabel( 'Hello World', rootListView.items )
				);

				const insertedChild = findMenuTreeItemByLabel( 'Baz', rootListView.items );

				expect( insertedChild.label ).to.be.equal( 'Baz' );
				expect( onExecuteSpy ).not.to.be.called;

				insertedChild.fire( 'execute' );
				expect( onExecuteSpy ).to.be.calledOnce;
			} );

			it( 'should append flat menu items to the menu', () => {
				const rootListView = createRootListWithDefinition(
					{
						menu: 'Hello World',
						children: []
					}
				);

				rootListView.factory.appendMenuChildrenAt(
					[
						new DropdownMenuListItemButtonView( editor.locale, 'Baz' )
					],
					findMenuTreeMenuViewByLabel( 'Hello World', rootListView.items )
				);

				const insertedChild = findMenuTreeItemByLabel( 'Baz', rootListView.items );

				expect( insertedChild.label ).to.be.equal( 'Baz' );
			} );

			it( 'should be possible to append list item separator', () => {
				const rootListView = createRootListWithDefinition(
					{
						menu: 'Hello World',
						children: []
					}
				);

				rootListView.factory.appendMenuChildrenAt(
					[
						new ListSeparatorView( editor.locale )
					],
					findMenuTreeMenuViewByLabel( 'Hello World', rootListView.items )
				);

				const parentMenuView = findMenuTreeMenuViewByLabel( 'Hello World', rootListView.items );

				expect( parentMenuView.menuItems.get( 0 ) ).to.be.instanceOf( ListSeparatorView );
			} );

			it( 'should reuse menu view instance on insert', () => {
				const rootListView = createRootListWithDefinition(
					{
						menu: 'Hello World',
						children: []
					}
				);

				const menuInstance = new DropdownMenuView( editor, 'Baz' );

				menuInstance.menuItems.add(
					new DropdownMenuListItemView(
						editor.locale,
						menuInstance,
						new DropdownMenuView( editor, 'Nested Menu Menu' )
					)
				);

				rootListView.factory.appendMenuChildrenAt(
					[ menuInstance ],
					findMenuTreeMenuViewByLabel( 'Hello World', rootListView.items )
				);

				const insertedChild = findMenuTreeItemByLabel( 'Nested Menu Menu', rootListView.items );

				expect( insertedChild.buttonView.label ).to.be.equal( 'Nested Menu Menu' );
			} );

			it( 'should not be possible to append children to lazy initialized menu', () => {
				const rootListView = createRootListWithDefinition(
					{
						menu: 'Hello World',
						children: [
							{
								menu: 'Nested menu',
								children: []
							}
						]
					},
					{
						lazyInitializeSubMenus: true
					}
				);

				const parentMenuView = findMenuTreeMenuViewByLabel( 'Hello World', rootListView.items );

				expect( () => {
					parentMenuView.factory.appendChildren(
						[
							new DropdownMenuListItemButtonView( editor.locale, 'Baz' )
						]
					);
				} ).to.throw( 'cannot-access-factory-on-lazy-loaded-menu' );
			} );
		} );
	} );

	describe( '`menus` getter', () => {
		it( 'should be empty after initialization', () => {
			const { menus } = createRootListWithDefinition( [] );

			expect( menus ).to.be.empty;
		} );

		it( 'should return flatten list of menus (excluding flat items)', () => {
			const mockDefinitions = [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			];

			const { menus, items } = createRootListWithDefinition( mockDefinitions );
			const tree = items;

			expect( menus ).to.be.deep.equal(
				[
					findMenuTreeMenuViewByLabel( 'Menu 1', tree ),
					findMenuTreeMenuViewByLabel( 'Menu 2', tree )
				]
			);
		} );

		describe( 'cache', () => {
			it( 'should use cache', () => {
				const rootListView = createRootListWithDefinition( [] );

				expect( rootListView.menus ).to.be.equal( rootListView.menus );
			} );

			it( 'should be invalidated on add new top level item', () => {
				const rootListView = createRootListWithDefinition();
				const oldMenus = rootListView.menus;

				rootListView.factory.appendChildren( [
					createMockMenuDefinition( 'Menu 2' ),
					createMockMenuDefinition( 'Menu 3' )
				] );

				expect( oldMenus ).not.to.be.equal( rootListView.menus );
			} );

			it( 'should be invalidated on add new menu item', () => {
				const rootListView = createRootListWithDefinition();
				const oldMenus = rootListView.menus;

				oldMenus[ 0 ].factory.appendChildren(
					[
						new DropdownMenuListItemButtonView( editor.locale, 'Baz' )
					]
				);

				expect( oldMenus ).not.to.be.equal( rootListView.menus );
			} );
		} );
	} );

	describe( 'lazy initialization', () => {
		it( 'should lazy initialize and render menu on close', () => {
			const rootListView = createRootListWithDefinition(
				createMockMenuDefinition( 'Hello World' ),
				{
					lazyInitializeSubMenus: true
				}
			);

			const parentMenuView = findMenuTreeMenuViewByLabel( 'Hello World', rootListView.items );

			expect( parentMenuView.isPendingLazyInitialization ).to.be.true;
			expect( parentMenuView.menuItems.length ).not.to.be.equal( 3 );

			parentMenuView.isOpen = true;

			expect( parentMenuView.isPendingLazyInitialization ).to.be.false;
			expect( parentMenuView.menuItems.length ).to.be.equal( 3 );
		} );
	} );

	function createRootListWithDefinition( definition = createMockMenuDefinition(), attributes ) {
		return new DropdownMenuRootListView(
			editor,
			Array.isArray( definition ) ? definition : [ definition ],
			attributes
		);
	}
} );
