/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistitembuttonview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';

import ButtonView from '../../button/buttonview.js';

import '../../../theme/components/dropdown/menu/dropdownmenulistitembutton.css';

/**
 * Represents a view for a button in a dropdown menu list item.
 */
export default class DropdownMenuListItemButtonView extends ButtonView {
	/**
	 * Determines whether space should be allocated for an icon if it is missing.
	 */
	declare public allocateSpaceForIconIfMissing: boolean;

	constructor( locale: Locale, label?: string ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( {
			withText: true,
			withKeystroke: true,
			tooltip: false,
			role: 'menuitem',
			allocateSpaceForIconIfMissing: false,
			label
		} );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown-menu__menu__item__button',
					bind.if( 'allocateSpaceForIconIfMissing', 'ck-allocate-space-for-icon-if-missing' )
				]
			}
		} );
	}
}
