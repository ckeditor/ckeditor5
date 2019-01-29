/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
