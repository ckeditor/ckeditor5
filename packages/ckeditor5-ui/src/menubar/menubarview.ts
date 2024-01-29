/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarview
 */

import { type Locale } from '@ckeditor/ckeditor5-utils';
import { type FocusableView } from '../focuscycler.js';
import View from '../view.js';
import { cloneDeep, isObject } from 'lodash-es';
import ListSeparatorView from '../list/listseparatorview.js';
import ListView from '../list/listview.js';
import DropdownPanelView from '../dropdown/dropdownpanelview.js';
import type ViewCollection from '../viewcollection.js';
import type ComponentFactory from '../componentfactory.js';

import MenuBarButtonView from './menubarbuttonview.js';
import MenuBarMenuView from './menubarmenuview.js';
import MenuBarMenuItemView from './menubarmenuitemview.js';
import { MenuBarBehaviors, MenuBarMenuBehaviors } from './utils.js';

import '../../theme/components/menubar/menubar.css';

/**
 * TODO
 */
export default class MenuBarView extends View implements FocusableView {
	public children: ViewCollection<MenuBarMenuView>;
	declare public isOpen: boolean;

	constructor( locale: Locale ) {
		super( locale );

		this.children = this.createCollection();

		this.set( 'isOpen', false );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-menu-bar'
				]
			},
			children: this.children
		} );

		this.on( 'cycleForward', ( evt, { currentMenuView } ) => this._cycleTopLevelMenus( currentMenuView, 1 ) );
		this.on( 'cycleBackward', ( evt, { currentMenuView } ) => this._cycleTopLevelMenus( currentMenuView, -1 ) );
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

		this._setupIsOpenUpdater();
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
					{
						id: 'test-more',
						label: 'Test more',
						items: [
							'menuBar:undo',
							'menuBar:redo',
							{
								id: 'test-more-2',
								label: 'Test more 2',
								items: [
									'menuBar:undo',
									'menuBar:redo'
								]
							}
						]
					}
				]
			},
			{
				id: 'format',
				label: 'Format',
				items: [
					{
						id: 'table',
						label: 'Table',
						items: [
							'menuBar:insertTable'
						]
					},
					'-',
					'menuBar:bold',
					'menuBar:italic',
					'menuBar:underline'
				]
			},
			{
				id: 'test',
				label: 'Test',
				items: [
					'menuBar:bold',
					'menuBar:italic',
					'menuBar:underline'
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
		const listView = new ListView( locale );
		const menuButtonView = new MenuBarButtonView( locale, !parentMenuView );
		const dropdownPanelView = new DropdownPanelView( locale );
		const menuView = new MenuBarMenuView( locale, menuButtonView, dropdownPanelView, parentMenuView );

		dropdownPanelView.children.add( listView );

		listView.items.addMany( this._createMenuItems( { menuDefinition, menuView, componentFactory } ) );

		menuButtonView.set( {
			withText: true,
			label: menuDefinition.label
		} );

		menuButtonView.bind( 'isOn' ).to( menuView, 'isOpen' );

		menuButtonView.on( 'mouseenter', () => {
			this.fire( 'mouseenter:submenu', { source: menuView } );
		} );

		if ( parentMenuView ) {
			MenuBarMenuBehaviors.oneWayMenuButtonClickOverride( menuView );
			MenuBarMenuBehaviors.openOnButtonClick( menuView );
			MenuBarMenuBehaviors.openOnArrowRightKey( this, menuView );
			MenuBarMenuBehaviors.closeOnArrowLeftKey( this, menuView );
			MenuBarMenuBehaviors.closeOnParentClose( menuView );
		} else {
			MenuBarMenuBehaviors.focusPanelOnArrowDownKey( menuView );
			MenuBarMenuBehaviors.openOnArrowDownKey( menuView );
			MenuBarMenuBehaviors.openOnButtonFocus( this, menuView );
			MenuBarMenuBehaviors.toggleOnButtonClick( menuView );
			MenuBarMenuBehaviors.navigateToNextOnArrowRightKey( this, menuView );
			MenuBarMenuBehaviors.navigateToPreviousOnArrowLeftKey( this, menuView );
		}

		MenuBarMenuBehaviors.focusButtonOnHover( this, menuButtonView );
		MenuBarMenuBehaviors.openOrCloseOnHover( this, menuView );
		MenuBarMenuBehaviors.closeOnEscKey( menuView );
		MenuBarMenuBehaviors.closeOnMenuBarClose( this, menuView );
		MenuBarMenuBehaviors.closeOnExternalItemHover( this, menuView );

		return menuView;
	}

	/**
	 * TODO
	 */
	private _createMenuItems( { menuDefinition, menuView, componentFactory }: {
		menuDefinition: MenuBarMenuDefinition;
		componentFactory: ComponentFactory;
		menuView: MenuBarMenuView;
	} ) {
		const locale = this.locale!;

		return menuDefinition.items.map( menuDefinition => {
			if ( menuDefinition === '-' ) {
				return new ListSeparatorView();
			}

			const menuItemView = new MenuBarMenuItemView( locale, menuView );

			if ( isObject( menuDefinition ) ) {
				const subMenuView = this._createMenu( {
					componentFactory,
					menuDefinition,
					parentMenuView: menuView
				} );

				menuItemView.children.add( subMenuView );
			} else {
				const componentView = componentFactory.create( menuDefinition );

				// TODO: I don't like this bit. It's a bit hacky.
				if ( 'focus' in componentView ) {
					menuItemView.children.add( componentView as FocusableView );
				} else {
					throw new Error( 'TODO' );
				}

				menuItemView.on( 'mouseenter', () => {
					this.fire( 'mouseenter:item', { source: menuItemView } );
				} );

				// Close the whole menu bar when a component is executed.
				componentView.on( 'execute', () => {
					this.isOpen = false;
				} );
			}

			return menuItemView;
		} );
	}

	/**
	 * TODO
	 */
	private _setupIsOpenUpdater() {
		let closeTimeout: ReturnType<typeof setTimeout>;

		for ( const topLevelCategoryMenuView of this.children ) {
			topLevelCategoryMenuView.on( 'change:isOpen', ( evt, name, isOpen ) => {
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
	 * TODO
	 */
	private _cycleTopLevelMenus( currentMenuView: MenuBarMenuView, step: 1 | -1 ): void {
		const currentIndex = this.children.getIndex( currentMenuView );
		const isCurrentMenuViewOpen = currentMenuView.isOpen;
		const menusCount = this.children.length;
		const menuViewToOpen = this.children.get( ( currentIndex + menusCount + step ) % menusCount )!;

		currentMenuView.isOpen = false;

		if ( isCurrentMenuViewOpen ) {
			menuViewToOpen.isOpen = true;
		}

		menuViewToOpen.buttonView.focus();
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
