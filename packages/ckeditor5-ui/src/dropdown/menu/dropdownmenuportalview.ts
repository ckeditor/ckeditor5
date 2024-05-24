/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenupanelportalview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type ViewCollection from '../../viewcollection.js';

import View from '../../view.js';

export default class DropdownMenuPortalView extends View {
	/**
	 * A collection of child views in the form.
	 */
	public readonly children: ViewCollection;

	constructor( locale: Locale ) {
		super( locale );

		this.children = this.createCollection();
		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-dropdown-menu__menu__portal',
					'ck-ai-assistant-ui_theme' // fixme
				],
				tabindex: '-1'
			},
			children: this.children
		} );
	}
}
