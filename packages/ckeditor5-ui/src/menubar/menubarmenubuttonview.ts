/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import DropdownButtonView from '../dropdown/button/dropdownbuttonview.js';

export default class MenuBarMenuButtonView extends DropdownButtonView {
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( {
			withText: true
		} );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-menu-bar__menu__button'
				]
			},
			on: {
				'mouseenter': bind.to( 'mouseenter' )
			}
		} );
	}
}
