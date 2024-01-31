/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ButtonView from '../button/buttonview.js';

export default class MenuBarMenuItemButtonView extends ButtonView {
	constructor( locale: Locale ) {
		super( locale );

		this.set( {
			withText: true,
			withKeystroke: true,
			tooltip: false
		} );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-menu-bar__menu__item__button'
				]
			}
		} );
	}
}
