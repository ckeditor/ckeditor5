/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarview
 */

import { logWarning, type Locale } from '@ckeditor/ckeditor5-utils';
import { type FocusableView } from '../focuscycler.js';
import View from '../view.js';
import { cloneDeep, isObject } from 'lodash-es';
import ListSeparatorView from '../list/listseparatorview.js';
import type ViewCollection from '../viewcollection.js';
import type ComponentFactory from '../componentfactory.js';

import MenuBarMenuView from './menubarmenuview.js';
import MenuBarMenuListView from './menubarmenulistview.js';
import MenuBarMenuListItemView from './menubarmenulistitemview.js';
import MenuBarMenuItemButtonView from './menubarmenuitembuttonview.js';
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
		this.children.delegate( 'change:isOpen' ).to( this );

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

	public override render(): void {
		super.render();

		MenuBarBehaviors.toggleMenusAndFocusItemsOnHover( this );
		MenuBarBehaviors.closeMenusOnClose( this );
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
	 * TODO
	 */
	private _createMenu( { componentFactory, menuDefinition, parentMenuView }: {
		componentFactory: ComponentFactory;
		menuDefinition: MenuBarMenuDefinition;
		parentMenuView?: MenuBarMenuView;
	} ) {
		const locale = this.locale!;
		const listView = new MenuBarMenuListView( locale );
		const menuView = new MenuBarMenuView( locale, parentMenuView );

		listView.ariaLabel = menuDefinition.label;

		menuView.buttonView.set( {
			label: menuDefinition.label
		} );

		menuView.menuView.children.add( listView );
		menuView.delegate( ...EVENT_NAME_DELEGATES ).to( parentMenuView || this );

		listView.items.addMany( this._createMenuItems( { menuDefinition, parentMenuView: menuView, componentFactory } ) );

		this.menus.push( menuView );

		return menuView;
	}

	/**
	 * TODO
	 */
	private _createMenuItems( { menuDefinition, parentMenuView, componentFactory }: {
		menuDefinition: MenuBarMenuDefinition;
		componentFactory: ComponentFactory;
		parentMenuView: MenuBarMenuView;
	} ) {
		const locale = this.locale!;

		return menuDefinition.items.map( menuDefinition => {
			if ( menuDefinition === '-' ) {
				return new ListSeparatorView();
			}

			const menuItemView = new MenuBarMenuListItemView( locale, parentMenuView );

			if ( isObject( menuDefinition ) ) {
				menuItemView.children.add( this._createMenu( { componentFactory, menuDefinition, parentMenuView } ) );
			} else if ( componentFactory.has( menuDefinition ) ) {
				const componentView = componentFactory.create( menuDefinition );

				if ( !( componentView instanceof MenuBarMenuView || componentView instanceof MenuBarMenuItemButtonView ) ) {
					/**
					 * TODO
					 *
					 * @error menu-bar-component-unsupported
					 * @param view TODO
					 */
					logWarning( 'menu-bar-component-unsupported', { view: componentView } );
				} else {
					if ( componentView instanceof MenuBarMenuView ) {
						componentView.parentMenuView = parentMenuView;
						this.menus.push( componentView );
					}

					componentView.delegate( ...EVENT_NAME_DELEGATES ).to( menuItemView );

					// Close the whole menu bar when a component is executed.
					componentView.on( 'execute', () => {
						this.isOpen = false;
					} );

					menuItemView.children.add( componentView );
				}
			} else {
				/**
				 * TODO
				 *
				 * @error menu-bar-item-unavailable
				 * @param item The name of the component.
				 */
				logWarning( 'menu-bar-item-unavailable', { menuDefinition } );
			}

			return menuItemView;
		} );
	}

	/**
	 * TODO
	 */
	private _setupIsOpenUpdater() {
		let closeTimeout: ReturnType<typeof setTimeout>;

		// TODO: This is not the prettiest approach but at least it's simple.
		this.on( 'change:isOpen', ( evt, name, isOpen ) => {
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

export type MenuBarConfig = Array<MenuBarMenuDefinition>;

export type MenuBarMenuDefinition = {
	id: string;
	label: string;
	items: Array<string | MenuBarMenuDefinition>;
};

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
