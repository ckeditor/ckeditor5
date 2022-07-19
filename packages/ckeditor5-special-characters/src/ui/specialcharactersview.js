/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharactersview
 */

import { View } from 'ckeditor5/src/ui';
 
 /**
  * 
  *
  * @extends module:ui/view~View
  */
export default class SpecialCharactersView extends View {
	/**
	 * 
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 */
	constructor( locale, navigationView, gridView, infoView ) {
		super( locale );

		this.navigationView = navigationView;
		this.gridView = gridView;
		this.infoView = infoView;

		this.setTemplate( {
			tag: 'div',
			children: [
				//this.navigationView,
				this.gridView,
				this.infoView
			]
		} );
	}

	focus () {
		this.gridView.focus();
	}
}