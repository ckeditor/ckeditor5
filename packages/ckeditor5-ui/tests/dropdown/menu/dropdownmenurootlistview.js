/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuRootListView from '../../../src/dropdown/menu/dropdownmenurootlistview.js';
import { getTotalDropdownMenuTreeFlatItemsCount } from '../../../src/dropdown/menu/search/gettotaldropdownmenutreeflatitemscount.js';
import { DropdownRootMenuBehaviors } from '../../../src/dropdown/menu/utils/dropdownmenubehaviors.js';
import {
	DropdownMenuListItemButtonView,
	DropdownMenuListItemView,
	DropdownMenuView,
	ListSeparatorView
} from '../../../src/index.js';

import {
	createBlankRootListView,
	createMockLocale,
	createMockMenuDefinition
} from './_utils/dropdowntreemock.js';

import {
	findMenuTreeMenuViewByLabel,
	findMenuTreeItemByLabel,
	createRootTree,
	mapMenuViewToMenuTreeItemByLabel,
	mapButtonViewToFlatMenuTreeItem,
	mapButtonViewToFlatMenuTreeItemByLabel
} from './_utils/dropdowntreeutils.js';

describe( 'DropdownMenuRootListView', () => {
	let locale, rootListView;

	beforeEach( () => {
		locale = createMockLocale();
		rootListView = new DropdownMenuRootListView( locale );
	} );

	afterEach( () => {
		rootListView.destroy();
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
			const definedRootListView = new DropdownMenuRootListView( locale, [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			] );

			const { tree } = definedRootListView;

			expect( findMenuTreeItemByLabel( 'Menu 1', tree ) ).not.to.be.null;
			expect( findMenuTreeItemByLabel( 'Menu 2', tree ) ).not.to.be.null;
			expect( findMenuTreeItemByLabel( 'Non existing menu', tree ) ).to.be.null;

			definedRootListView.destroy();
		} );
	} );

	describe( 'close()', () => {
		let tree, clock;

		beforeEach( () => {
			rootListView.destroy();
			rootListView = new DropdownMenuRootListView( locale, [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			] );

			rootListView.render();
			tree = rootListView.tree;
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

			expect( rootListView.tree.children.some( menu => menu.isOpen ) ).to.be.false;
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
		const delegatedEvents = [ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ];

		for ( const event of delegatedEvents ) {
			it( `should delegate ${ event } event to root menu view`, () => {
				const { locale, menuRootList } = createBlankRootListView();
				const menuInstance = new DropdownMenuView( locale, 'Hello World' );

				menuRootList.appendTopLevelChild(
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
				const { locale, menuRootList } = createBlankRootListView();
				const menuInstance = new DropdownMenuView( locale, 'Hello World' );
				const nestedMenuInstance = new DropdownMenuView( locale, 'Nested Menu Menu' );

				menuInstance.listView.items.add(
					new DropdownMenuListItemView( locale, menuInstance, nestedMenuInstance )
				);

				menuRootList.appendTopLevelChild(
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
	} );

	describe( 'walk()', () => {
		it( 'should properly walk through the tree', () => {
			const rootListView = createRootListWithDefinition( [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			] );

			const tracking = {
				entered: [],
				left: []
			};

			const trackedWalkers = {
				enter: ( { node } ) => {
					tracking.entered.push( node.search.raw );
				},
				leave: ( { node } ) => {
					tracking.left.unshift( node.search.raw );
				}
			};

			rootListView.walk(
				{
					Item: trackedWalkers,
					Menu: trackedWalkers
				}
			);

			expect( tracking.entered ).to.be.deep.equal( [
				'Menu 1', 'Foo', 'Bar', 'Buz', 'Menu 2', 'Foo', 'Bar', 'Buz'
			] );

			expect( tracking.left ).to.be.deep.equal( [
				'Menu 2', 'Buz', 'Bar', 'Foo', 'Menu 1', 'Buz', 'Bar', 'Foo'
			] );
		} );
	} );

	describe( 'appendTopLevelChildren()', () => {
		it( 'should not crash if called with empty array', () => {
			expect( () => {
				const rootListView = createRootListWithDefinition();

				rootListView.appendTopLevelChildren( [] );
			} ).not.to.throw();
		} );

		it( 'should append top level menus', () => {
			const rootListView = createRootListWithDefinition();

			rootListView.appendTopLevelChildren( [
				createMockMenuDefinition( 'Menu 2' ),
				createMockMenuDefinition( 'Menu 3' )
			] );

			rootListView.appendTopLevelChildren( [
				createMockMenuDefinition( 'Menu 4' )
			] );

			expect( rootListView.tree.children.map( menu => menu.search.raw ) ).to.be.deep.equal(
				[ 'Menu 1', 'Menu 2', 'Menu 3', 'Menu 4' ]
			);
		} );
	} );

	describe( 'appendMenuChildren()', () => {
		it( 'should append flat menu items to the menu', () => {
			const rootListView = createRootListWithDefinition(
				{
					menu: 'Hello World',
					children: []
				}
			);

			rootListView.appendMenuChildren(
				[
					new DropdownMenuListItemButtonView( locale, 'Baz' )
				],
				findMenuTreeMenuViewByLabel( 'Hello World', rootListView.tree )
			);

			const insertedChild = findMenuTreeItemByLabel( 'Baz', rootListView.tree.children[ 0 ] );

			expect( insertedChild.search.raw ).to.be.equal( 'Baz' );
		} );

		it( 'should be possible to append list item separator', () => {
			const rootListView = createRootListWithDefinition(
				{
					menu: 'Hello World',
					children: []
				}
			);

			rootListView.appendMenuChildren(
				[
					new ListSeparatorView( locale )
				],
				findMenuTreeMenuViewByLabel( 'Hello World', rootListView.tree )
			);

			const parentMenuView = findMenuTreeMenuViewByLabel( 'Hello World', rootListView.tree );

			expect( parentMenuView.nestedMenuListItems[ 0 ] ).to.be.instanceOf( ListSeparatorView );
		} );

		it( 'should reuse menu view instance on insert', () => {
			const rootListView = createRootListWithDefinition(
				{
					menu: 'Hello World',
					children: []
				}
			);

			const menuInstance = new DropdownMenuView( locale, 'Baz' );

			menuInstance.listView.items.add(
				new DropdownMenuListItemView(
					locale,
					menuInstance,
					new DropdownMenuView( locale, 'Nested Menu Menu' )
				)
			);

			rootListView.appendMenuChildren(
				[ menuInstance ],
				findMenuTreeMenuViewByLabel( 'Hello World', rootListView.tree )
			);

			const insertedChild = findMenuTreeItemByLabel( 'Nested Menu Menu', rootListView.tree );

			expect( insertedChild.search.raw ).to.be.equal( 'Nested Menu Menu' );
		} );

		it( 'should be not possible to append children to lazy initialized menu', () => {
			const rootListView = createRootListWithDefinition(
				{
					menu: 'Hello World',
					children: []
				},
				true
			);

			const parentMenuView = findMenuTreeMenuViewByLabel( 'Hello World', rootListView.tree );

			expect( () => {
				rootListView.appendMenuChildren(
					[
						new DropdownMenuListItemButtonView( locale, 'Baz' )
					],
					parentMenuView
				);
			} ).to.throw( 'dropdown-menu-append-to-lazy-initialized-menu' );
		} );
	} );

	describe( 'appendTopLevelChild()', () => {
		it( 'should append top level menu', () => {
			const rootListView = createRootListWithDefinition( [] );

			rootListView.appendTopLevelChild( createMockMenuDefinition( 'Menu 1' ) );
			rootListView.appendTopLevelChild( createMockMenuDefinition( 'Menu 2' ) );

			expect( rootListView.tree.children.map( menu => menu.search.raw ) ).to.be.deep.equal(
				[ 'Menu 1', 'Menu 2' ]
			);
		} );
	} );

	describe( '`tree` getter', () => {
		it( 'should return new tree instance every time it\'s called', () => {
			const menuRootList = createRootListWithDefinition( [] );

			expect( menuRootList.tree ).not.to.be.equal( menuRootList.tree );
		} );

		it( 'create proper tree for plain menu definition (single definition item)', () => {
			const mockDefinition = createMockMenuDefinition();
			const { tree } = createRootListWithDefinition( mockDefinition );

			expect( tree ).to.be.deep.equal(
				createRootTree( [
					mapMenuViewToMenuTreeItemByLabel(
						'Menu 1',
						tree,
						mockDefinition.children.map( mapButtonViewToFlatMenuTreeItem )
					)
				] )
			);
		} );

		it( 'create proper tree for plain menu definition (multiple definition items)', () => {
			const mockDefinitions = [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' ),
				createMockMenuDefinition( 'Menu 3' )
			];

			const { tree } = createRootListWithDefinition( mockDefinitions );

			expect( tree ).to.be.deep.equal(
				createRootTree(
					mockDefinitions.map(
						( mockDefinition, index ) => mapMenuViewToMenuTreeItemByLabel(
							`Menu ${ index + 1 }`,
							tree,
							mockDefinition.children.map( mapButtonViewToFlatMenuTreeItem )
						)
					)
				)
			);
		} );

		it( 'should properly handle three level depth menu definition', () => {
			const mockDefinition = {
				menu: 'Menu',
				children: [
					new DropdownMenuListItemButtonView( locale, 'Foo' ),
					{
						menu: 'Nested menu',
						children: [
							new DropdownMenuListItemButtonView( locale, 'Bar' )
						]
					}
				]
			};

			const { tree } = createRootListWithDefinition( mockDefinition );

			expect( tree ).to.be.deep.equal(
				createRootTree( [
					mapMenuViewToMenuTreeItemByLabel(
						'Menu',
						tree,
						[
							mapButtonViewToFlatMenuTreeItemByLabel( 'Foo', tree ),
							mapMenuViewToMenuTreeItemByLabel( 'Nested menu', tree, [
								mapButtonViewToFlatMenuTreeItemByLabel( 'Bar', tree )
							] )
						]
					)
				] )
			);
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

			const { tree, menus } = createRootListWithDefinition( mockDefinitions );

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

				rootListView.appendTopLevelChildren( [
					createMockMenuDefinition( 'Menu 2' ),
					createMockMenuDefinition( 'Menu 3' )
				] );

				expect( oldMenus ).not.to.be.equal( rootListView.menus );
			} );

			it( 'should be invalidated on add new menu item', () => {
				const rootListView = createRootListWithDefinition();
				const oldMenus = rootListView.menus;

				rootListView.appendMenuChildren(
					[
						new DropdownMenuListItemButtonView( locale, 'Baz' )
					],
					findMenuTreeMenuViewByLabel( 'Menu 1', rootListView.tree )
				);

				expect( oldMenus ).not.to.be.equal( rootListView.menus );
			} );
		} );
	} );

	describe( 'preloadAllMenus()', () => {
		it( 'should initialize all lazy collapsed menus', () => {
			const rootListView = createRootListWithDefinition(
				[
					createMockMenuDefinition( 'Hello World' ),
					createMockMenuDefinition( 'Hello World 2' )
				],
				true
			);

			const prevFlatItems = getTotalDropdownMenuTreeFlatItemsCount( rootListView.tree );

			rootListView.walk( {
				Menu: ( { node } ) => {
					expect( node.menu.pendingLazyInitialization ).to.be.true;
				}
			} );

			rootListView.preloadAllMenus();
			rootListView.walk( {
				Menu: ( { node } ) => {
					expect( node.menu.pendingLazyInitialization ).to.be.false;
				}
			} );

			const flatItems = getTotalDropdownMenuTreeFlatItemsCount( rootListView.tree );

			expect( prevFlatItems ).not.to.be.equal( flatItems );
		} );
	} );

	describe( 'lazy initialization', () => {
		it( 'should lazy initialize and render menu on close', () => {
			const rootListView = createRootListWithDefinition(
				createMockMenuDefinition( 'Hello World' ),
				true
			);

			const parentMenuView = findMenuTreeMenuViewByLabel( 'Hello World', rootListView.tree );

			expect( parentMenuView.pendingLazyInitialization ).to.be.true;
			expect( parentMenuView.nestedMenuListItems.length ).not.to.be.equal( 3 );

			parentMenuView.isOpen = true;

			expect( parentMenuView.pendingLazyInitialization ).to.be.false;
			expect( parentMenuView.nestedMenuListItems.length ).to.be.equal( 3 );
		} );
	} );

	function createRootListWithDefinition( definition = createMockMenuDefinition(), lazyInitialized = false ) {
		return new DropdownMenuRootListView(
			createMockLocale(),
			Array.isArray( definition ) ? definition : [ definition ],
			lazyInitialized
		);
	}
} );
