/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/menubar/menubarmenulistitemview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ListItemView from '../list/listitemview.js';
import type MenuBarMenuView from './menubarmenuview.js';

import '../../theme/components/menubar/menubarmenulistitem.css';

/**
 * A menu bar list item view, a child of {@link module:ui/menubar/menubarmenulistview~MenuBarMenuListView}.
 *
 * Populate this item with a {@link module:ui/menubar/menubarmenulistitembuttonview~MenuBarMenuListItemButtonView} instance
 * or a {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} instance to create a sub-menu.
 */
export default class MenuBarMenuListItemView extends ListItemView {
	/**
	 * Creates an instance of the list item view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale, parentMenuView: MenuBarMenuView ) {
		super( locale );

		const bind = this.bindTemplate;

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-menu-bar__menu__item'
				]
			},
			on: {
				'mouseenter': bind.to( 'mouseenter' )
			}
		} );

		this.delegate( 'mouseenter' ).to( parentMenuView );
	}
}
