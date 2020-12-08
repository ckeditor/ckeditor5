/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/toolbarlinebreakview
 */

import View from '../view';

/**
 * The toolbar line break view class.
 *
 * @extends module:ui/view~View
 */
export default class ToolbarLineBreakView extends View {
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
					'ck-toolbar__line-break'
				]
			}
		} );
	}
}
