/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
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
	 * Creates an instance of the dropdown menu list view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.role = 'menu';
		this.set( 'isVisible', true );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown-menu',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				]
			}
		} );
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
	 * Walks over the dropdown menu views using the specified walkers.
	 *
	 * @param walkers The walkers to use.
	 */
	public walk( walkers: DropdownMenuViewsTreeWalkers ): void {
		walkOverDropdownMenuTreeItems( walkers, this.tree );
	}
}
