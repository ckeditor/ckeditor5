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
 * TODO
 */
export default class MenuBarMenuListView extends ListView {
	/**
	 * TODO
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.role = 'menu';
	}
}
