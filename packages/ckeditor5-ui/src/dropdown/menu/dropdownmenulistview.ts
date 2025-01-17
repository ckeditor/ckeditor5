/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ListView from '../../list/listview.js';

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
					'ck-dropdown-menu-list',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				]
			}
		} );
	}
}
