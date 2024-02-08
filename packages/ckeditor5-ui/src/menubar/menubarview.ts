/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarview
 */

import {
	logWarning,
	type BaseEvent,
	type Locale,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';
import { type FocusableView } from '../focuscycler.js';
import View from '../view.js';
import { cloneDeep, isObject } from 'lodash-es';
import ListSeparatorView from '../list/listseparatorview.js';
import type ViewCollection from '../viewcollection.js';
import type ComponentFactory from '../componentfactory.js';

import MenuBarMenuView from './menubarmenuview.js';
import MenuBarMenuListView from './menubarmenulistview.js';
import MenuBarMenuListItemView from './menubarmenulistitemview.js';
import MenuBarMenuListItemButtonView from './menubarmenulistitembuttonview.js';
import { EVENT_NAME_DELEGATES, MenuBarBehaviors } from './utils.js';

import '../../theme/components/menubar/menubar.css';

/**
 * TODO
 */
export default class MenuBarView extends View implements FocusableView {
	public children: ViewCollection<MenuBarMenuView>;
	declare public isOpen: boolean;
	public menus: Array<MenuBarMenuView> = [];

	constructor( locale: Locale ) {
		super( locale );

		const t = locale.t;

		this.set( 'isOpen', false );
		this._setupIsOpenUpdater();

		this.children = this.createCollection();

		// Logs events in the main event bus of the component.
		// this.on( 'submenu', ( evt, data ) => {
		// 	console.log( `MenuBarView:${ evt.name }`, evt.path.map( view => view.element ) );
		// } );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-menu-bar'
				],
				'aria-label': t( 'Editor menu bar' ),
				role: 'menubar'
			},
			children: this.children
		} );
	}

	/**
	 * TODO
	 */
	public fillFromConfig( config: MenuBarConfig, componentFactory: ComponentFactory ): void {
		const locale = this.locale!;
		const localizedConfig = localizeConfigCategories( locale, config );
		const topLevelCategoryMenuViews = localizedConfig.map( menuDefinition => this._createMenu( {
			componentFactory,
			menuDefinition
		} ) );

		this.children.addMany( topLevelCategoryMenuViews );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		MenuBarBehaviors.toggleMenusAndFocusItemsOnHover( this );
		MenuBarBehaviors.closeMenusWhenTheBarCloses( this );
		MenuBarBehaviors.closeMenuWhenAnotherOnTheSameLevelOpens( this );
		MenuBarBehaviors.focusCycleMenusOnArrows( this );
		MenuBarBehaviors.closeOnClickOutside( this );
	}

	/**
	 * Focuses the menu.
	 */
	public focus(): void {
		this.children.first!.focus();
	}

	/**
	 * Closes all menus in the bar.
	 */
	public close(): void {
		// TODO: We need to close all sub-menus in the structure too.
		for ( const topLevelCategoryMenuView of this.children ) {
			topLevelCategoryMenuView.isOpen = false;
		}
	}

	/**
	 * Registers a menu view in the menu bar.
	 */
	public registerMenu( menuView: MenuBarMenuView, parentMenuView?: MenuBarMenuView ): void {
		menuView.parentMenuView = parentMenuView;
		menuView.menuBarView = this;

		this.menus.push( menuView );
	}

	/**
	 * TODO
	 */
	public static get defaultConfig(): MenuBarConfig {
		return [
			{
				id: 'edit',
				label: 'Edit',
				items: [
					'menuBar:undo',
					'menuBar:redo',
					'-',
					'menuBar:selectAll',
					'-',
					'menuBar:findAndReplace'
				]
			},
			{
				id: 'view',
				label: 'View',
				items: [
					'menuBar:sourceEditing',
					'-',
					'menuBar:showBlocks'
				]
			},
			{
				id: 'format',
				label: 'Format',
				items: [
					'menuBar:insertTable',
					'-',
					'menuBar:bold',
					'menuBar:italic',
					'menuBar:underline',
					'-',
					'menuBar:heading'
				]
			},
			{
				id: 'test',
				label: 'Test',
				items: [
					'menuBar:bold',
					'menuBar:italic',
					'menuBar:underline',
					{
						id: 'test-nested-lvl1',
						label: 'Test nested level 1',
						items: [
							'menuBar:undo',
							'menuBar:redo',
							{
								id: 'test-nested-lvl11',
								label: 'Test nested level 1.1',
								items: [
									'menuBar:undo',
									'menuBar:redo'
								]
							}
						]
					},
					{
						id: 'test-nested-lvl2',
						label: 'Test nested level 2',
						items: [
							'menuBar:undo',
							'menuBar:redo',
							{
								id: 'test-nested-lvl21',
								label: 'Test nested level 2.1',
								items: [
									'menuBar:undo',
									'menuBar:redo'
								]
							}
						]
					}
				]
			}
		];
	}

	/**
	 * Creates a {@link TODO~MenuBarMenuView} based on the given definition.
	 */
	private _createMenu( { componentFactory, menuDefinition, parentMenuView }: {
		componentFactory: ComponentFactory;
		menuDefinition: MenuBarMenuDefinition;
		parentMenuView?: MenuBarMenuView;
	} ) {
		const locale = this.locale!;
		const menuView = new MenuBarMenuView( locale );

		this.registerMenu( menuView, parentMenuView );

		menuView.buttonView.set( {
			label: menuDefinition.label
		} );

		// Defer the creation of the menu structure until it gets open. This is a performance optimization
		// that shortens the time needed to create the editor.
		menuView.once<ObservableChangeEvent<boolean>>( 'change:isOpen', () => {
			const listView = new MenuBarMenuListView( locale );
			listView.ariaLabel = menuDefinition.label;
			menuView.panelView.children.add( listView );

			listView.items.addMany( this._createMenuItems( { menuDefinition, parentMenuView: menuView, componentFactory } ) );
		} );

		return menuView;
	}

	/**
	 * Creates a {@link TODO~MenuBarMenuView} content items based on the given definition.
	 */
	private _createMenuItems( { menuDefinition, parentMenuView, componentFactory }: {
		menuDefinition: MenuBarMenuDefinition;
		componentFactory: ComponentFactory;
		parentMenuView: MenuBarMenuView;
	} ): Array<MenuBarMenuListItemView | ListSeparatorView> {
		const locale = this.locale!;

		return menuDefinition.items.map( menuDefinition => {
			if ( menuDefinition === '-' ) {
				return new ListSeparatorView();
			}

			const menuItemView = new MenuBarMenuListItemView( locale, parentMenuView );

			if ( isObject( menuDefinition ) ) {
				menuItemView.children.add( this._createMenu( {
					componentFactory,
					menuDefinition,
					parentMenuView
				} ) );
			} else {
				const componentView = this._createMenuItemContentFromFactory( {
					componentName: menuDefinition,
					componentFactory,
					parentMenuView
				} );

				if ( componentView ) {
					menuItemView.children.add( componentView );
				}
			}

			return menuItemView;
		} );
	}

	private _createMenuItemContentFromFactory( { componentName, parentMenuView, componentFactory }: {
		componentName: string;
		componentFactory: ComponentFactory;
		parentMenuView: MenuBarMenuView;
	} ): MenuBarMenuView | MenuBarMenuListItemButtonView | null {
		if ( !componentFactory.has( componentName ) ) {
			/**
			 * TODO
			 *
			 * @error menu-bar-item-unavailable
			 * @param componentName The name of the component.
			 */
			logWarning( 'menu-bar-item-unavailable', { componentName } );

			return null;
		}

		const componentView = componentFactory.create( componentName );

		if ( !( componentView instanceof MenuBarMenuView || componentView instanceof MenuBarMenuListItemButtonView ) ) {
			/**
			 * TODO
			 *
			 * @error menu-bar-component-unsupported
			 * @param view TODO
			 */
			logWarning( 'menu-bar-component-unsupported', { view: componentView } );

			return null;
		}

		if ( componentView instanceof MenuBarMenuView ) {
			this.registerMenu( componentView, parentMenuView );
		} else {
			componentView.delegate( ...EVENT_NAME_DELEGATES ).to( parentMenuView );
		}

		// Close the whole menu bar when a component is executed.
		componentView.on( 'execute', () => {
			this.isOpen = false;
		} );

		return componentView;
	}

	/**
	 * Manages the state of the {@link #isOpen} property of the menu bar. Because the state is a sum of individual
	 * top-level menus' states, it's necessary to listen to their changes and update the state accordingly.
	 *
	 * Additionally, it prevents from unnecessary changes of `isOpen` when one top-level menu opens and another closes
	 * (regardless of in which order), maintaining a stable `isOpen === true` in that situation.
	 */
	private _setupIsOpenUpdater() {
		let closeTimeout: ReturnType<typeof setTimeout>;

		// TODO: This is not the prettiest approach but at least it's simple.
		this.on( 'submenu:change:isOpen', ( evt, name, isOpen ) => {
			clearTimeout( closeTimeout );

			if ( isOpen ) {
				this.isOpen = true;
			} else {
				closeTimeout = setTimeout( () => {
					this.isOpen = Array.from( this.children ).some( menuView => menuView.isOpen );
				}, 0 );
			}
		} );
	}
}

/**
 * Localizes the user-config using pre-defined localized category labels.
 */
function localizeConfigCategories( locale: Locale, config: MenuBarConfig ): MenuBarConfig {
	const t = locale.t;
	const configClone = cloneDeep( config );
	const localizedCategoryLabels: Record<string, string> = {
		'Edit': t( 'Edit' ),
		'Format': t( 'Format' )
	};

	for ( const categoryDef of configClone ) {
		if ( categoryDef.id in localizedCategoryLabels ) {
			categoryDef.label = localizedCategoryLabels[ categoryDef.id ];
		}
	}

	return configClone;
}

/**
 * TODO
 */
export type MenuBarConfig = Array<MenuBarMenuDefinition>;

/**
 * TODO
 */
export type MenuBarMenuDefinition = {
	id: string;
	label: string;
	items: Array<string | MenuBarMenuDefinition>;
};

/**
 * TODO
 */
interface MenuBarSubMenuEvent extends BaseEvent {
	name: `submenu:${ string }` | `submenu:change:${ string }`;
}

/**
 * TODO
 */
export interface MenuBarSubMenuMouseEnterEvent extends MenuBarSubMenuEvent {
	name: 'submenu:mouseenter';
}

/**
 * TODO
 */
export interface MenuBarSubMenuArrowLeftEvent extends MenuBarSubMenuEvent {
	name: 'submenu:arrowleft';
}

/**
 * TODO
 */
export interface MenuBarSubMenuArrowRightEvent extends MenuBarSubMenuEvent {
	name: 'submenu:arrowright';
}

/**
 * TODO
 */
export interface MenuBarSubMenuChangeIsOpenEvent extends MenuBarSubMenuEvent {
	name: 'submenu:change:isOpen';
	args: [ name: string, value: boolean, oldValue: boolean ];
}
