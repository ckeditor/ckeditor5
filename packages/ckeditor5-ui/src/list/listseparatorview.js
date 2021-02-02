/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/list/listseparatorview
 */

import View from '../view';

/**
 * The list separator view class.
 *
 * @extends module:ui/view~View
 */
export default class ListSeparatorView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
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
