/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenurootlistview
 */

import type { CollectionAddEvent, Locale } from '@ckeditor/ckeditor5-utils';
import type {
	DropdownMenuDefinitions,
	DropdownMenuChildDefinition,
	DropdownMenuChildrenDefinition,
	DropdownMenuDefinition
} from './definition/dropdownmenudefinitiontypings.js';

import DropdownMenuListView from './dropdownmenulistview.js';

import type { NonEmptyArray } from '@ckeditor/ckeditor5-core';

import type {
	DropdownMenuFocusableView,
	DropdownNestedMenuListItemView
} from './typings.js';

import type { DropdownMenuChangeIsOpenEvent } from './events.js';
import type { DropdownMenuViewsRootTree } from './search/tree/dropdownsearchtreetypings.js';

import DropdownMenuListItemView from './dropdownmenulistitemview.js';
import { isDropdownMenuObjectDefinition } from './definition/dropdownmenudefinitionguards.js';
import { createTreeFromDropdownMenuView } from './search/createtreefromdropdownmenuview.js';

import { DropdownRootMenuBehaviors } from './utils/dropdownmenubehaviors.js';
import DropdownMenuView from './dropdownmenuview.js';
import {
	isDropdownListItemSeparatorView,
	isDropdownMenuListItemView,
	isDropdownMenuView
} from './guards.js';

import { dumpDropdownMenuTree } from './search/dumpdropdownmenutree.js';
import { flattenDropdownMenuTree } from './search/flattendropdownmenutree.js';
import { isDropdownTreeMenuItem } from './search/tree/dropdownsearchtreeguards.js';
import {
	walkOverDropdownMenuTreeItems,
	type DropdownMenuViewsTreeWalkers
} from './search/walkoverdropdownmenutreeitems.js';

/**
 * Represents the root list view of a dropdown menu.
 *
 * ```ts
 * const view = new DropdownMenuRootListView( locale, [
 * 	{
 * 		menu: 'Menu 1',
 * 		children: [
 * 			new DropdownMenuListItemButtonView( locale, 'Item' ),
 * 			new ListSeparatorView( locale ),
 * 			{
 * 				menu: 'Menu 1.1',
 * 				children: [
 * 					new DropdownMenuListItemButtonView( locale, 'Nested Item' ),
 * 				]
 * 			}
 * 		]
 * 	}
 * ] );
 *
 * view.render();
 *
 * // Somewhere later in the code:
 * view.appendTopLevelChild( {
 * 	menu: 'Menu 2',
 * 	children: [
 * 		new DropdownMenuListItemButtonView( locale, 'Item 2' )
 * 	]
 * } );
 * ```
 */
export default class DropdownMenuRootListView extends DropdownMenuListView {
	/**
	 * Indicates whether any of the top-level menus are open in the menu bar. To close
	 * the menu bar, use the `close` method.
	 *
	 * @observable
	 */
	declare public isOpen: boolean;

	/**
	 * Creates an instance of the DropdownMenuRootListView class.
	 *
	 * @param locale - The locale object.
	 * @param definition The definition object for the dropdown menu root factory.
	 */
	constructor( locale: Locale, definitions?: DropdownMenuDefinitions ) {
		super( locale );

		this.set( 'isOpen', false );

		this._setupIsOpenUpdater();
		this._watchRootMenuEvents();

		if ( definitions && definitions.length ) {
			this.appendTopLevelChildren( definitions );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		DropdownRootMenuBehaviors.toggleMenusAndFocusItemsOnHover( this );
		DropdownRootMenuBehaviors.closeMenuWhenAnotherOnTheSameLevelOpens( this );
		DropdownRootMenuBehaviors.closeOnClickOutside( this );
		DropdownRootMenuBehaviors.closeWhenOutsideElementFocused( this );
	}

	/**
	 * Gets the array of all menus in the dropdown menu.
	 *
	 * @returns The array of all menus.
	 */
	public get menus(): Array<DropdownMenuView> {
		return flattenDropdownMenuTree( this.tree ).flatMap( ( { node } ) => {
			if ( isDropdownTreeMenuItem( node ) ) {
				return [ node.menu ];
			}

			return [];
		} );
	}

	/**
	 * Gets the tree representation of the dropdown menu views.
	 *
	 * @returns The tree representation of the dropdown menu views.
	 */
	public get tree(): DropdownMenuViewsRootTree {
		return createTreeFromDropdownMenuView( {
			nestedMenuListItems: [ ...this.items ]
		} );
	}

	/**
	 * Dumps the dropdown menu tree to a string.
	 */
	public dump(): string {
		return dumpDropdownMenuTree( this.tree );
	}

	/**
	 * Closes all menus.
	 */
	public close(): void {
		this.menus.forEach( menuView => {
			menuView.isOpen = false;
		} );
	}

	/**
	 * Walks over the dropdown menu views using the specified walkers.
	 *
	 * @param walkers - The walkers to use.
	 */
	public walk( walkers: DropdownMenuViewsTreeWalkers ): void {
		walkOverDropdownMenuTreeItems( walkers, this.tree );
	}

	/**
	 * Appends multiple menus to the dropdown menu definition parser.
	 *
	 * @param items An array of `DropdownMenuDefinition` objects representing the menus to be appended.
	 * @returns Inserted menu list item views.
	 */
	public appendTopLevelChildren( items: DropdownMenuChildrenDefinition ): Array<DropdownNestedMenuListItemView> {
		return this.appendMenuChildren( items );
	}

	/**
	 * Appends a menu to the dropdown menu definition parser.
	 *
	 * @param menuDefinition The menu definition to append.
	 * @returns Inserted menu list item view.
	 */
	public appendTopLevelChild( children: DropdownMenuChildDefinition ): DropdownNestedMenuListItemView {
		return this.appendTopLevelChildren( [ children ] )[ 0 ]!;
	}

	/**
	 * Appends menu children to the target parent menu view.
	 *
	 * @param children The children to be appended to the menu.
	 * @param targetParentMenuView The target parent menu view.
	 * @returns Array of inserted items.
	 */
	public appendMenuChildren(
		children: DropdownMenuChildrenDefinition,
		targetParentMenuView: DropdownMenuView | null = null
	): Array<DropdownNestedMenuListItemView> {
		const menuListItems = children.flatMap( ( itemDefinition ): NonEmptyArray<DropdownNestedMenuListItemView> => {
			// Register non-focusable items such like separators firstly.
			if ( isDropdownListItemSeparatorView( itemDefinition ) ) {
				return [
					itemDefinition
				];
			}

			// Register focusable items like menu buttons or menus.
			const menuOrFlatItem = this._createFocusableDefinitionChild(
				itemDefinition,
				targetParentMenuView
			);

			return [
				new DropdownMenuListItemView( this.locale!, targetParentMenuView, menuOrFlatItem )
			];
		} );

		if ( targetParentMenuView ) {
			targetParentMenuView.listView.items.addMany( menuListItems );
		} else {
			this.items.addMany( menuListItems );
		}

		return menuListItems;
	}

	/**
	 * Registers a child definition in the dropdown menu.
	 *
	 * @internal
	 * @param child The child definition to register.
	 * @param parentMenuView The parent menu view.
	 * @returns The registered menu or reused instance.
	 */
	private _createFocusableDefinitionChild(
		child: DropdownMenuChildDefinition,
		parentMenuView: DropdownMenuView | null
	) {
		if ( isDropdownMenuObjectDefinition( child ) ) {
			return this._createMenuFromObjectDefinition( child, parentMenuView );
		}

		return this._recursiveAssignMenuChildrenParents( child, parentMenuView );
	}

	/**
	 * Creates a menu view from the given menu definition.
	 *
	 * @internal
	 * @param menuDefinition The dropdown menu definition.
	 * @returns The created menu view.
	 */
	private _createMenuFromObjectDefinition(
		menuDefinition: DropdownMenuDefinition,
		parentMenuView: DropdownMenuView | null
	) {
		const menuView = new DropdownMenuView( this.locale!, menuDefinition.menu, parentMenuView );

		this.appendMenuChildren( menuDefinition.children, menuView );

		return menuView;
	}

	/**
	 * Registers a menu tree from the given component view definition.
	 *
	 * @internal
	 * @param menuOrFlatItemView The component view definition.
	 * @param parentMenuView The parent menu view.
	 * @returns The registered component view.
	 */
	private _recursiveAssignMenuChildrenParents(
		menuOrFlatItemView: DropdownMenuFocusableView,
		parentMenuView: DropdownMenuView | null
	) {
		// Register menu entries.
		if ( isDropdownMenuView( menuOrFlatItemView ) ) {
			menuOrFlatItemView.parentMenuView = parentMenuView;
			menuOrFlatItemView.nestedMenuListItems.forEach( menuListItem => {
				if ( isDropdownMenuListItemView( menuListItem ) && isDropdownMenuView( menuListItem.flatItemOrNestedMenuView ) ) {
					this._recursiveAssignMenuChildrenParents(
						menuListItem.flatItemOrNestedMenuView,
						menuOrFlatItemView
					);
				}
			} );
		}

		return menuOrFlatItemView;
	}

	/**
	 * Watches the root menu events.
	 *
	 * @internal
	 */
	private _watchRootMenuEvents(): void {
		this.on( 'closeall', this.close.bind( this ) );
		this.items.on<CollectionAddEvent<DropdownMenuListItemView>>( 'add', ( evt, item ) => {
			item.flatItemOrNestedMenuView.delegate( ...DropdownMenuView.DELEGATED_EVENTS ).to( this, name => `menu:${ name }` );
		} );
	}

	/**
	 * Manages the state of the `isOpen` property of the dropdown menu bar. Because the state is a sum of individual
	 * top-level menus' states, it's necessary to listen to their changes and update the state accordingly.
	 *
	 * Additionally, it prevents unnecessary changes of `isOpen` when one top-level menu opens and another closes
	 * (regardless of the order), maintaining a stable `isOpen === true` in that situation.
	 *
	 * @internal
	 */
	private _setupIsOpenUpdater() {
		let closeTimeout: ReturnType<typeof setTimeout>;

		this.on<DropdownMenuChangeIsOpenEvent>( 'menu:change:isOpen', ( evt, name, isOpen ) => {
			clearTimeout( closeTimeout );

			if ( isOpen ) {
				this.isOpen = true;
			} else {
				closeTimeout = setTimeout( () => {
					this.isOpen = this.menus.some( ( { isOpen } ) => isOpen );
				}, 0 );
			}
		} );
	}
}
