/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistitembuttonview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';

import ListItemButtonView from '../../button/listitembuttonview.js';

import '../../../theme/components/dropdown/menu/dropdownmenulistitembutton.css';

/**
 * Represents a view for a button in a dropdown menu list item.
 */
export default class DropdownMenuListItemButtonView extends ListItemButtonView {
	constructor( locale: Locale, label?: string ) {
		super( locale );

		this.set( {
			withText: true,
			withKeystroke: true,
			tooltip: false,
			role: 'menuitem',
			label
		} );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown-menu__menu__item__button'
				]
			}
		} );
	}
}
