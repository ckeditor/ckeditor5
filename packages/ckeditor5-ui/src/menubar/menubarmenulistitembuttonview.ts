/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarmenulistitembuttonview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ListItemButtonView from '../button/listitembuttonview.js';

import '../../theme/components/menubar/menubarmenulistitembutton.css';

/**
 * A menu bar list button view. Buttons like this one execute user actions.
 */
export default class MenuBarMenuListItemButtonView extends ListItemButtonView {
	/**
	 * Creates an instance of the menu bar list button view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.set( {
			withText: true,
			withKeystroke: true,
			tooltip: false,
			role: 'menuitem'
		} );

		this.extendTemplate( {
			attributes: {
				class: [ 'ck-menu-bar__menu__item__button' ]
			}
		} );
	}
}
