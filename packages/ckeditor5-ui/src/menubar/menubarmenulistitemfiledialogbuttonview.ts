/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarmenulistitemfiledialogbuttonview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import { FileDialogListItemButtonView } from '../button/filedialogbuttonview.js';

import '../../theme/components/menubar/menubarmenulistitembutton.css';

/**
 * A menu bar list file dialog button view. Buttons like this one execute user actions.
 *
 * This component provides a button that opens the native file selection dialog.
 */
export default class MenuBarMenuListItemFileDialogButtonView extends FileDialogListItemButtonView {
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
