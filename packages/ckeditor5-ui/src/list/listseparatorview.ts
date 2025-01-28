/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/list/listseparatorview
 */

import View from '../view.js';

import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The list separator view class.
 */
export default class ListSeparatorView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.setTemplate( {
			tag: 'li',
			attributes: {
				class: [
					'ck',
					'ck-list__separator'
				]
			}
		} );
	}
}
