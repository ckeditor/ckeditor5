/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistitemview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { DropdownMenuFocusableFlatItemView } from './typings.js';
import type DropdownMenuView from './dropdownmenuview.js';

import ListItemView from '../../list/listitemview.js';
import { isDropdownMenuFocusableFlatItemView } from './guards.js';

import '../../../theme/components/dropdown/menu/dropdownmenulistitem.css';

/**
 * Represents a view for a single item in a dropdown menu list.
 */
export default class DropdownMenuListItemView extends ListItemView {
	/**
	 * The view representing either a flat item or a nested menu in a dropdown menu list item.
	 */
	public readonly flatItemOrNestedMenuView: DropdownMenuView | DropdownMenuFocusableFlatItemView;

	constructor(
		locale: Locale,
		parentMenuView: DropdownMenuView | null,
		flatItemOrNestedMenuView: DropdownMenuView | DropdownMenuFocusableFlatItemView
	) {
		super( locale );

		const bind = this.bindTemplate;

		this.flatItemOrNestedMenuView = flatItemOrNestedMenuView;
		this.children.add( flatItemOrNestedMenuView );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown-menu__menu__item'
				]
			},
			on: {
				'mouseenter': bind.to( 'mouseenter' )
			}
		} );

		if ( parentMenuView ) {
			this.delegate( 'mouseenter' ).to( parentMenuView );

			if ( isDropdownMenuFocusableFlatItemView( flatItemOrNestedMenuView ) ) {
				flatItemOrNestedMenuView.delegate( 'execute' ).to( parentMenuView, 'item:execute' );
			}
		}
	}
}
