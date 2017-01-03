/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/toolbarview
 */

import View from '../view';
import Template from '../template';

/**
 * The toolbar view class.
 *
 * @extends module:ui/view~View
 */
export default class ToolbarView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		this.items = this.createCollection();

		this.template = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck-toolbar'
				]
			},

			children: this.items
		} );
	}
}
