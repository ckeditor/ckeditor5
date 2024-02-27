/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarmenulistitemview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ListItemView from '../list/listitemview.js';
import type MenuBarMenuView from './menubarmenuview.js';

/**
 * TODO
 */
export default class MenuBarMenuListItemView extends ListItemView {
	/**
	 * TODO
	 */
	public parentMenuView?: MenuBarMenuView;

	/**
	 * TODO
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
