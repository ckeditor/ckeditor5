/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { icons } from '@ckeditor/ckeditor5-core';
import type { Locale } from '@ckeditor/ckeditor5-utils';
import MenuBarMenuItemButtonView from './menubarmenuitembuttonview.js';

export default class MenuBarMenuItemCheckButtonView extends MenuBarMenuItemButtonView {
	constructor( locale: Locale ) {
		super( locale );

		this.set( {
			tooltip: false,
			withKeystroke: true,
			withText: true
		} );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-menu-bar__menu__item__checkbutton'
				]
			}
		} );

		this.bind( 'icon' ).to( this, 'isOn', isOn => isOn ? icons.check : '<svg></svg>' );
	}
}
