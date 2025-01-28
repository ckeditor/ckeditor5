/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
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
	public readonly id: string;

	constructor( locale: Locale, id: string, label: string ) {
		super( locale );

		this.id = id;

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
					'ck-dropdown-menu-list__nested-menu__item__button'
				]
			}
		} );
	}
}
