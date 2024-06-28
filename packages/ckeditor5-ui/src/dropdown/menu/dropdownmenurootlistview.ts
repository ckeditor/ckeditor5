/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenurootlistview
 */

import { compact } from 'lodash-es';

import type { CollectionAddEvent } from '@ckeditor/ckeditor5-utils';
import type DropdownMenuListItemView from './dropdownmenulistitemview.js';
import type { Editor } from '@ckeditor/ckeditor5-core';
import type { DropdownMenuDefinition } from './definition/dropdownmenudefinitiontypings.js';
import type {
	DropdownMenuExecuteItemEvent,
	DropdownMenuChangeIsOpenEvent,
	DropdownMenuSubmenuChangeEvent
} from './events.js';

import DropdownMenuListView from './dropdownmenulistview.js';

import { DropdownMenuListDefinitionFactory } from './definition/dropdownmenulistdefinitionfactory.js';
import { DropdownRootMenuBehaviors } from './utils/dropdownmenubehaviors.js';
import DropdownMenuView from './dropdownmenuview.js';

import { flattenDropdownMenuTree } from './tree/dropdownmenutreeflattenutils.js';

/**
 * Represents the root list view of a dropdown menu.
 *
 * ```ts
 * const view = new DropdownMenuRootListView( editor, [
 * 	{
 * 		menu: 'Menu 1',
 * 		children: [
 * 			{
 * 				label: 'Menu item defined object definition',
 * 				icon: 'your-icon',
 * 				onExecute: () => { ... }
 * 			},
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
 * ```
 */
export default class DropdownMenuRootListView extends DropdownMenuListView {
	/**
	 * Indicates whether any of the top-level menus are open in the dropdown menu. To close
	 * the dropdown menu, use the `close` method.
	 *
	 * @observable
	 */
	declare public isOpen: boolean;

	/**
	 * The editor instance associated with the dropdown menu root list view.
	 */
	public readonly editor: Editor;

	/**
	 * The factory used to create the dropdown menu list based on definition.
	 */
	public readonly factory: DropdownMenuListDefinitionFactory;

	/**
	 * The CSS class to be applied to the menu panel.
	 *
	 * @observable
	 */
	private readonly _menuPanelClass: string | undefined;

	/**
	 * The cached array of all menus in the dropdown menu.
	 */
	private _cachedMenus: Array<DropdownMenuView> | null = null;

	/**
	 * Creates an instance of the DropdownMenuRootListView class.
	 *
	 * @param locale - The locale object.
	 * @param definition The definition object for the dropdown menu root factory.
	 * @param options The options for the dropdown menu root list view.
	 */
	constructor(
		editor: Editor,
		definitions?: Array<DropdownMenuDefinition>,
		options: DropdownMenuRootListViewAttributes = {}
	) {
		super( editor.locale );

		this.set( {
			isOpen: false
		} );

		this.editor = editor;
		this.factory = new DropdownMenuListDefinitionFactory( {
			createMenuViewInstance: ( ...args ) => new DropdownMenuView( editor, ...args ),
			listView: this,
			lazyInitializeSubMenus: options.lazyInitializeSubMenus
		} );

		this._menuPanelClass = options.menuPanelClass;
		this._setupIsOpenUpdater();
		this._watchRootMenuEvents();

		if ( definitions && definitions.length ) {
			this.factory.appendChildren( definitions );
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
	 * Returns an array of currently visible menus elements. In other words it returns the elements of the menus that are
	 * currently attached to the DOM. Menus are attached to the dom only when they are open.
	 */
	public getCurrentlyVisibleMenusElements(): Array<HTMLElement> {
		const allMenusElements = this.menus.flatMap( menu => [
			menu.element,
			menu.panelView.element
		] );

		return compact( allMenusElements ).filter(
			( element: HTMLElement ) => document.body.contains( element )
		);
	}

	/**
	 * Gets the array of all menus in the dropdown menu.
	 *
	 * @returns The array of all menus.
	 */
	public get menus(): Array<DropdownMenuView> {
		const { tree, _cachedMenus } = this;

		if ( !_cachedMenus ) {
			const result = flattenDropdownMenuTree( tree ).flatMap( ( { node } ) => {
				if ( node.type === 'Menu' ) {
					return [ node.menu ];
				}

				return [];
			} );

			this._cachedMenus = result;
		}

		return this._cachedMenus!;
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
	 * Ensures that all menus are preloaded.
	 *
	 * 	* It's helpful used together with some search functions where menu must be preloaded before searching.
	 */
	public preloadAllMenus(): void {
		this.menus.forEach( menuView => {
			menuView.isPendingLazyInitialization = false;
		} );
	}

	/**
	 * Watches the root menu events.
	 */
	private _watchRootMenuEvents(): void {
		this.on<DropdownMenuExecuteItemEvent>( 'menu:item:execute', this.close.bind( this ) );
		this.on<DropdownMenuSubmenuChangeEvent>( 'menu:submenu:change', () => {
			this._cachedMenus = null;
		} );

		this.items.on( 'change', () => {
			this.fire<DropdownMenuSubmenuChangeEvent>( 'menu:submenu:change' );
		} );

		this.items.on<CollectionAddEvent<DropdownMenuListItemView>>( 'add', ( evt, item ) => {
			const { childView } = item;

			// Add additional CSS class to the panel view if it's a dropdown menu.
			if ( childView instanceof DropdownMenuView ) {
				childView.panelView.class = this._menuPanelClass;
			}

			childView.delegate( ...DropdownMenuView.DELEGATED_EVENTS ).to( this, name => `menu:${ name }` );
		} );
	}

	/**
	 * Manages the state of the `isOpen` property of the dropdown menu. Because the state is a sum of individual
	 * top-level menus' states, it's necessary to listen to their changes and update the state accordingly.
	 *
	 * Additionally, it prevents unnecessary changes of `isOpen` when one top-level menu opens and another closes
	 * (regardless of the order), maintaining a stable `isOpen === true` in that situation.
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

/**
 * Represents the attributes for the DropdownMenuRootListView.
 */
export type DropdownMenuRootListViewAttributes = {

	/**
	 * Specifies whether to lazily initialize submenus.
	 */
	lazyInitializeSubMenus?: boolean;

	/**
	 * Specifies the CSS class for the menu panel.
	 */
	menuPanelClass?: string;
};
