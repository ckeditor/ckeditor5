/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/dropdownmenulistdefinitionfactory
 */

import { once } from 'lodash-es';

import DropdownMenuListItemView from '../dropdownmenulistitemview.js';
import { isDropdownMenuObjectDefinition } from './dropdownmenudefinitionguards.js';

import type DropdownMenuListItemButtonView from '../dropdownmenulistitembuttonview.js';
import type DropdownMenuListView from '../dropdownmenulistview.js';
import type { ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import type { DropdownNestedMenuListItemView } from '../typings.js';
import type {
	DropdownMenuChildDefinition,
	DropdownMenuDefinition
} from './dropdownmenudefinitiontypings.js';

import DropdownMenuView from '../dropdownmenuview.js';
import ListSeparatorView from '../../../list/listseparatorview.js';

/**
 * Represents a factory for creating instances of the dropdown menu list views from definition.
 */
export class DropdownMenuListDefinitionFactory {
	/**
	 * Factory function for creating instances of the dropdown menu view.
	 * This property is readonly.
	 */
	private readonly _createMenuViewInstance: DropdownMenuViewFactory;

	/**
	 * The dropdown menu list view.
	 */
	private readonly _listView: DropdownMenuListView;

	/**
	 * Specifies whether submenus should be lazily initialized.
	 * If set to `true`, submenus will be initialized only when they are opened for the first time.
	 * If set to `false`, all submenus will be initialized when the dropdown menu is created.
	 */
	private readonly _lazyInitializeSubMenus: boolean;

	constructor(
		{
			createMenuViewInstance,
			listView,
			lazyInitializeSubMenus = false
		}: DropdownMenuListDefinitionFactoryOptions
	) {
		this._createMenuViewInstance = createMenuViewInstance;
		this._listView = listView;
		this._lazyInitializeSubMenus = lazyInitializeSubMenus;
	}

	/**
	 * Appends multiple menus to the dropdown menu definition parser.
	 *
	 * 	* It will initialize all menus that are not lazy-loaded.
	 *
	 * @param items An array of `DropdownMenuDefinition` objects representing the menus to be appended.
	 * @returns Inserted menu list item views.
	 */
	public appendChildren( items: Array<DropdownMenuChildDefinition> ): Array<DropdownNestedMenuListItemView> {
		return this.appendMenuChildrenAt( items );
	}

	/**
	 * Appends a menu to the dropdown menu definition parser.
	 *
	 * @param menuDefinition The menu definition to append.
	 * @returns Inserted menu list item view.
	 */
	public appendChild( children: DropdownMenuChildDefinition ): DropdownNestedMenuListItemView {
		return this.appendChildren( [ children ] )[ 0 ]!;
	}

	/**
	 * Appends menu children to the target parent menu view.
	 *
	 * @param children The children to be appended to the menu.
	 * @param targetParentMenuView The target parent menu view.
	 * @param index The index at which the children should be inserted.
	 * @returns Array of inserted items.
	 */
	public appendMenuChildrenAt(
		children: Array<DropdownMenuChildDefinition>,
		targetParentMenuView: DropdownMenuView | null = null,
		index?: number
	): Array<DropdownNestedMenuListItemView> {
		const menuListItems = children.map( ( itemDefinition ): DropdownNestedMenuListItemView => {
			// Register non-focusable items such like separators firstly.
			if ( itemDefinition instanceof ListSeparatorView ) {
				return itemDefinition;
			}

			// Register focusable items like menu buttons or menus.
			const menuOrFlatItem = this._createMenuOrFlatItemFromDefinition(
				itemDefinition,
				targetParentMenuView
			);

			return new DropdownMenuListItemView( this._listView.locale!, targetParentMenuView, menuOrFlatItem );
		} );

		if ( targetParentMenuView ) {
			targetParentMenuView.isPendingLazyInitialization = false;
			targetParentMenuView.listView.items.addMany( menuListItems, index );
		} else {
			this._listView.items.addMany( menuListItems, index );
		}

		return menuListItems;
	}

	/**
	 * Registers a child definition in the dropdown menu.
	 *
	 * @param child The child definition to register.
	 * @param parentMenuView The parent menu view.
	 * @returns The registered menu or reused instance.
	 */
	private _createMenuOrFlatItemFromDefinition(
		child: DropdownMenuChildDefinition,
		parentMenuView: DropdownMenuView | null
	) {
		if ( isDropdownMenuObjectDefinition( child ) ) {
			return this._appendMenuToParentUsingObjectDefinition( child, parentMenuView );
		}

		return this._recursiveAssignMenuChildrenParents( child, parentMenuView );
	}

	/**
	 * Creates a menu view from the given menu definition.
	 *
	 * @param menuDefinition The dropdown menu definition.
	 * @returns The created menu view.
	 */
	private _appendMenuToParentUsingObjectDefinition(
		menuDefinition: DropdownMenuDefinition,
		parentMenuView: DropdownMenuView | null
	) {
		const { children, menu } = menuDefinition;
		const menuView = this._createMenuViewInstance( menu, parentMenuView );

		if ( this._lazyInitializeSubMenus ) {
			// Prepend the first item to the menu and append the rest after opening menu.
			//
			// Appending such item is crucial because `.filter()` method in some of the `FilterView` implementations
			// may require at least one item to be present in the menu. If there are no items, these views often
			// display "No found items" placeholders which is not true because there are views in menus that are still
			// not rendered.
			const [ lazyAdded, rest ] = [
				children.slice( 0, 1 ),
				children.slice( 1 )
			];

			const initializeRestOfItems = once( () => {
				menuView.isPendingLazyInitialization = false;
				this.appendMenuChildrenAt( rest, menuView );
			} );

			menuView.on<ObservableChangeEvent<boolean>>(
				'change:isPendingLazyInitialization',
				( _, propertyName, isPendingLazyInitialization ) => {
					if ( !isPendingLazyInitialization ) {
						initializeRestOfItems();
					}
				}
			);

			menuView.once<ObservableChangeEvent<boolean>>( 'change:isOpen', ( _, propertyName, isOpen ) => {
				if ( isOpen ) {
					initializeRestOfItems();
				}
			} );

			this.appendMenuChildrenAt( lazyAdded, menuView );
			menuView.isPendingLazyInitialization = true;
		} else {
			this.appendMenuChildrenAt( children, menuView );
		}

		return menuView;
	}

	/**
	 * Registers a menu tree from the given component view definition.
	 *
	 * @param menuOrFlatItemView The component view definition.
	 * @param parentMenuView The parent menu view.
	 * @returns The registered component view.
	 */
	private _recursiveAssignMenuChildrenParents(
		menuOrFlatItemView: DropdownMenuView | DropdownMenuListItemButtonView,
		parentMenuView: DropdownMenuView | null
	) {
		// Register menu entries.
		if ( menuOrFlatItemView instanceof DropdownMenuView ) {
			menuOrFlatItemView.parentMenuView = parentMenuView;
			menuOrFlatItemView.menuItems.forEach( menuListItem => {
				if ( menuListItem instanceof DropdownMenuListItemView &&
						menuListItem.flatItemOrNestedMenuView instanceof DropdownMenuView ) {
					this._recursiveAssignMenuChildrenParents(
						menuListItem.flatItemOrNestedMenuView,
						menuOrFlatItemView
					);
				}
			} );
		}

		return menuOrFlatItemView;
	}
}

/**
 * Represents a factory function that creates a dropdown menu view.
 *
 * @param label The label for the dropdown menu.
 * @param parentMenuView The parent menu view, if any.
 * @returns The created dropdown menu view.
 */
type DropdownMenuViewFactory = ( label: string, parentMenuView?: DropdownMenuView | null ) => DropdownMenuView;

/**
 * Represents the attributes required to initialize a `DropdownMenuListDefinitionConstructor`.
 */
type DropdownMenuListDefinitionFactoryOptions = {

	/**
	 * A factory function that creates an instance of the dropdown menu view.
	 */
	createMenuViewInstance: DropdownMenuViewFactory;

	/**
	 * The dropdown menu list view.
	 */
	listView: DropdownMenuListView;

	/**
	 * Optional flag indicating whether sub-menus should be lazily initialized.
	 */
	lazyInitializeSubMenus?: boolean;
};
