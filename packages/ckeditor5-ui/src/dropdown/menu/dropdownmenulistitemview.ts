/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistitemview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type DropdownMenuNestedMenuView from './dropdownmenunestedmenuview.js';

import ListItemView from '../../list/listitemview.js';
import DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';

import '../../../theme/components/dropdown/menu/dropdownmenulistitem.css';

/**
 * Represents a view for a single item in a dropdown menu list.
 */
export default class DropdownMenuListItemView extends ListItemView {
	/**
	 * The view representing either a flat item or a nested menu in a dropdown menu list item.
	 */
	public readonly childView: DropdownMenuNestedMenuView | DropdownMenuListItemButtonView;

	constructor(
		locale: Locale,
		parentMenuView: DropdownMenuNestedMenuView | null,
		childView: DropdownMenuNestedMenuView | DropdownMenuListItemButtonView
	) {
		super( locale );

		const bind = this.bindTemplate;

		this.childView = childView;
		this.children.add( childView );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown-menu-list__nested-menu__item'
				]
			},
			on: {
				'mouseenter': bind.to( 'mouseenter' )
			}
		} );

		if ( parentMenuView ) {
			this.delegate( 'mouseenter' ).to( parentMenuView );

			if ( childView instanceof DropdownMenuListItemButtonView ) {
				childView.delegate( 'execute' ).to( parentMenuView );
			}
		}
	}
}
