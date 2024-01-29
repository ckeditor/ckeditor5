/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import DropdownButtonView from '../dropdown/button/dropdownbuttonview.js';

export default class MenuBarButtonView extends DropdownButtonView {
	constructor( locale: Locale, isTopLevelButton: boolean ) {
		super( locale );

		const bind = this.bindTemplate;

		this.class = 'ck-menu-bar__menu__button';

		if ( isTopLevelButton ) {
			this.class += ' ck-menu-bar__menu__button_top-level';
		}

		this.extendTemplate( {
			on: {
				'mouseenter': bind.to( 'mouseenter' )
			}
		} );
	}
}
