/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistview
 */

import { global, type Locale } from '@ckeditor/ckeditor5-utils';
import type { DropdownMenuViewsRootTree } from './tree/dropdownmenutreetypings.js';

import ListView from '../../list/listview.js';
import { createTreeFromDropdownMenuView } from './tree/dropdownmenutreecreateutils.js';
import { walkOverDropdownMenuTreeItems, type DropdownMenuViewsTreeWalkers } from './tree/dropdownmenutreewalker.js';

/**
 * Represents a dropdown menu list view.
 */
export default class DropdownMenuListView extends ListView {
	/**
	 * Represents whether the dropdown menu list view is visible or not.
	 */
	declare public isVisible: boolean;

	/**
	 * Indicates whether the dropdown has been interacted with using the keyboard.
	 *
	 * It is useful for showing focus outlines while hovering over the dropdown menu when
	 * interaction with the keyboard was detected.
	 *
	 * @observable
	 */
	declare public isFocusBorderEnabled: boolean;

	/**
	 * Indicates whether the list is scrollable.
	 *
	 * @internal
	 * @readonly
	 */
	declare public _isScrollable: boolean;

	/**
	 * Creates an instance of the dropdown menu list view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.role = 'menu';
		this.set( {
			_isScrollable: false,
			isVisible: true,
			isFocusBorderEnabled: false
		} );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown-menu',
					bind.if( 'isVisible', 'ck-hidden', value => !value ),
					bind.if( 'isFocusBorderEnabled', 'ck-dropdown-menu_focus-border-enabled' ),
					bind.if( '_isScrollable', 'ck-dropdown-menu_scrollable' )
				]
			}
		} );

		// We need to listen on window resize event and update scrollable flag..
		this.listenTo( global.window, 'resize', () => this.checkIfScrollable() );
		this.items.on( 'change', () => this.checkIfScrollable() );
	}

	/**
	 * Gets the tree representation of the dropdown menu views.
	 *
	 * @returns The tree representation of the dropdown menu views.
	 */
	public get tree(): DropdownMenuViewsRootTree {
		return createTreeFromDropdownMenuView( {
			menuItems: [ ...this.items ]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();
		this.checkIfScrollable();
	}

	/**
	 * Walks over the dropdown menu views using the specified walkers.
	 *
	 * @param walkers The walkers to use.
	 */
	public walk( walkers: DropdownMenuViewsTreeWalkers ): void {
		walkOverDropdownMenuTreeItems( walkers, this.tree );
	}

	/**
	 * Updates the `_isScrollable` flag based on the current list height.
	 *
	 * @internal
	 */
	public checkIfScrollable(): void {
		const listWrapper = this.element;

		if ( listWrapper ) {
			this._isScrollable = Math.max( listWrapper.scrollHeight, listWrapper.clientHeight ) > window.innerHeight * 0.8;
		}
	}
}
