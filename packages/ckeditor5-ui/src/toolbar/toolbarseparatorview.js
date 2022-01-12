/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/toolbarseparatorview
 */

import View from '../view';

/**
 * The toolbar separator view class.
 *
 * @extends module:ui/view~View
 */
export default class ToolbarSeparatorView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
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
