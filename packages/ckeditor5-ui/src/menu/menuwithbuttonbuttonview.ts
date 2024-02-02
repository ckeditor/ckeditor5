/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menu/menubuttonview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ButtonView from '../button/buttonview.js';

export default class MenuWithButtonButtonView extends ButtonView {
	declare public tooltipDisabled: boolean;

	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'tooltipDisabled', false );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown__button'
				],
				'data-cke-tooltip-disabled': bind.to( 'tooltipDisabled' )
			}
		} );
	}
}
