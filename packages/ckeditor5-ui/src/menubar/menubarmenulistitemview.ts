/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ListItemView from '../list/listitemview.js';
import type MenuBarMenuView from './menubarmenuview.js';
import { EVENT_NAME_DELEGATES } from './utils.js';

export default class MenuBarMenuListItemView extends ListItemView {
	public parentMenuView?: MenuBarMenuView;

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

		this.parentMenuView = parentMenuView;

		this.delegate( ...EVENT_NAME_DELEGATES ).to( parentMenuView );
	}
}
