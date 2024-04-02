/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarmenulistview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ListView from '../list/listview.js';

/**
 * A list of menu bar items, a child of {@link module:ui/menubar/menubarmenuview~MenuBarMenuView#panelView}.
 *
 * Use this class to create a list of items (options, buttons) to be displayed in a menu bar.
 *
 * To populate this list, use {@link module:ui/menubar/menubarmenulistitemview~MenuBarMenuListItemView} instances.
 */
export default class MenuBarMenuListView extends ListView {
	/**
	 * Creates an instance of the list view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.role = 'menu';
	}
}
