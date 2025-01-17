/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dropdown/menu/dropdownmenurootlistview
 */

import DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';
import DropdownMenuNestedMenuView from './dropdownmenunestedmenuview.js';
import DropdownMenuListView from './dropdownmenulistview.js';
import DropdownMenuListItemView from './dropdownmenulistitemview.js';
import { DropdownRootMenuBehaviors } from './dropdownmenubehaviors.js';

import type BodyCollection from '../../editorui/bodycollection.js';
import type { DropdownMenuDefinition } from './utils.js';

import type { Locale, BaseEvent } from '@ckeditor/ckeditor5-utils';

/**
 * Creates and manages a multi-level menu UI structure, suitable to be used inside dropdown components.
 *
 * This class creates a menu structure based on {@link module:ui/dropdown/menu/utils~DropdownMenuDefinition declarative definition}
 * passed in the constructor.
 *
 * Below is an example of a simple definition, that describes a menu with two sub-menus (Menu 1, Menu 2) and four buttons in total (Item A,
 * Item B, Item C, Item D):
 *
 * ```js
 * [
 * 	{
 * 		id: 'menu_1',
 * 		menu: 'Menu 1',
 * 		children: [
 * 			{ id: 'menu_1_a', label: 'Item A' },
 * 			{ id: 'menu_1_b', label: 'Item B' }
 * 		]
 * 	},
 * 	{
 * 		id: 'menu_2',
 * 		menu: 'Menu 2',
 * 		children: [
 * 			{ id: 'menu_2_c', label: 'Item C' },
 * 		]
 * 	},
 * 	{ id: 'item_d', label: 'Item D' }
 * ]
 * ```
 *
 * The menu is build using multiple view classes. The most important are:
 *
 * * {@link module:ui/dropdown/menu/dropdownmenunestedmenuview~DropdownMenuNestedMenuView `DropdownMenuNestedMenuView`} - "menu" - provides
 * a panel with a nested menu, and a button which opens the panel,
 * * {@link module:ui/dropdown/menu/dropdownmenulistitembuttonview~DropdownMenuListItemButtonView `DropdownMenuListItemButtonView`} -
 * "button" or "leaf button" (as opposed to buttons provided by `DropdownMenuNestedMenuView`) - should trigger some action when pressed.
 *
 * Instances of these two classes are created based on the data provided in definitions. They are assigned proper IDs and labels.
 * Other view classes build a proper DOM structure around menus and buttons.
 *
 * The `DropdownMenuNestedMenuView` instances provides panels, which may include further menus or buttons. These panels are added to
 * a `BodyCollection` view, which means they are appended outside the DOM editor and UI structure.
 *
 * When "leaf button" is pressed, it fires `execute` event which is delegated to `DropdownMenuRootListView` as `menu:execute` event. You
 * can listen to this event to perform an action:
 *
 * ```js
 * rootListView.on( 'menu:execute', evt => {
 * 	console.log( evt.source.id ); // E.g. will print 'menu_1_a' when 'Item A' is pressed.
 * } );
 * ```
 *
 * All menus and "leaf" buttons created from the definition can be easily accessed through {@link ~DropdownMenuRootListView#menus `menus`}
 * and {@link ~DropdownMenuRootListView#buttons `buttons`} properties.
 *
 * For performance reasons, the whole menu structure is created only when `DropdownMenuRootListView` is rendered for the first time.
 *
 * It is recommended to use this class together with {@link module:ui/dropdown/utils~addMenuToDropdown `addMenuToDropdown()` helper}.
 */
export default class DropdownMenuRootListView extends DropdownMenuListView {
	/**
	 * The CSS class to be applied to nested menu panels in this dropdown menu.
	 *
	 * It is necessary, as the panels are created in body collection, outside editor and UI structure.
	 */
	declare public menuPanelClass: string | undefined;

	/**
	 * The definitions object used to create the whole menu structure.
	 */
	private readonly _definition: DropdownMenuDefinition;

	/**
	 * Cached array of all menus in the dropdown menu (including nested menus).
	 */
	private _cachedMenus: Array<DropdownMenuNestedMenuView> = [];

	/**
	 * Cached array of all buttons in the dropdown menu (including buttons in nested menus).
	 */
	private _cachedButtons: Array<DropdownMenuListItemButtonView> = [];

	/**
	 * Editor body collection into which nested menus panels will be appended.
	 */
	private _bodyCollection: BodyCollection;

	/**
	 * Creates an instance of the DropdownMenuRootListView class.
	 *
	 * @param locale
	 * @param bodyCollection
	 * @param definition The definition object used to create the menu structure.
	 */
	constructor(
		locale: Locale,
		bodyCollection: BodyCollection,
		definition: DropdownMenuDefinition
	) {
		super( locale );

		this._bodyCollection = bodyCollection;
		this._definition = definition;

		this.set( 'menuPanelClass', undefined );
	}

	/**
	 * Returns the array of all menus in the dropdown menu (including nested menus).
	 */
	public get menus(): Array<DropdownMenuNestedMenuView> {
		return Array.from( this._cachedMenus.values() );
	}

	/**
	 * Returns the array of all buttons in the dropdown menu (including buttons in nested menus).
	 *
	 * Note, that this includes only "leaf" buttons, as specified in the definition passed in constructor. Buttons created as a part of
	 * the nested menus, that open nested menus when hovered or pressed, are not included.
	 */
	public get buttons(): Array<DropdownMenuListItemButtonView> {
		return Array.from( this._cachedButtons.values() );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		this._createStructure( this._definition, null );

		super.render();

		DropdownRootMenuBehaviors.toggleMenusAndFocusItemsOnHover( this );
		DropdownRootMenuBehaviors.closeMenuWhenAnotherOnTheSameLevelOpens( this );
	}

	/**
	 * Closes all nested menus.
	 */
	public closeMenus(): void {
		this.menus.forEach( menu => {
			menu.isOpen = false;
		} );
	}

	/**
	 * Recursively creates the whole view tree structure for the dropdown menu, according to the passed `definitions`.
	 *
	 * @private
	 */
	private _createStructure( definitions: DropdownMenuDefinition, parentMenuView: DropdownMenuNestedMenuView | null ): void {
		const items: Array<DropdownMenuListItemView> = [];

		for ( const def of definitions ) {
			let createdView: DropdownMenuNestedMenuView | DropdownMenuListItemButtonView;

			if ( 'menu' in def ) {
				createdView = new DropdownMenuNestedMenuView( this.locale!, this._bodyCollection, def.id, def.menu, parentMenuView );
				createdView.panelView.bind( 'class' ).to( this, 'menuPanelClass' );

				if ( !parentMenuView ) {
					createdView.delegate( ...DropdownMenuNestedMenuView.DELEGATED_EVENTS ).to( this, ( name: string ) => `menu:${ name }` );
				}

				this._cachedMenus.push( createdView );
				this._createStructure( def.children, createdView );
			} else {
				createdView = new DropdownMenuListItemButtonView( this.locale!, def.id, def.label );

				if ( !parentMenuView ) {
					createdView.delegate( 'execute' ).to( this, 'menu:execute' );
				}

				this._cachedButtons.push( createdView );
			}

			const listItemView = new DropdownMenuListItemView( this.locale!, parentMenuView, createdView );

			if ( !parentMenuView ) {
				listItemView.delegate( 'mouseenter' ).to( this, 'menu:mouseenter' );
			}

			items.push( listItemView );
		}

		const targetListView = parentMenuView ? parentMenuView.listView : this;

		targetListView.items.addMany( items );
	}
}

/**
 * Fired when one of the menu buttons is executed (through mouse click or keyboard).
 *
 * This event is a delegated `execute` event fired by the pressed button. The `event.source` is the button which was executed.
 *
 * @eventName ~DropdownMenuRootListView#menu:execute
 */
export interface DropdownMenuRootListViewExecuteEvent extends BaseEvent {
	name: 'menu:execute';
	args: [];
}
