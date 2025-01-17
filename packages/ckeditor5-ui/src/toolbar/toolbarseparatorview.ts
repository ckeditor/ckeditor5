/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/toolbar/toolbarseparatorview
 */

import View from '../view.js';

import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The toolbar separator view class.
 */
export default class ToolbarSeparatorView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck',
					'ck-toolbar__separator'
				]
			}
		} );
	}
}
