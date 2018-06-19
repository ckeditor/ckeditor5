/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/list/listitemview
 */

import View from '../view';

/**
 * The list item view class.
 *
 * @extends module:ui/view~View
 */
export default class ListItemView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, childView ) {
		super();

		/**
		 * The child view of the list item.
		 *
		 * @member {module:ui/view~View} #childView
		 */
		this.childView = childView;

		this.setTemplate( {
			tag: 'li',

			attributes: {
				class: [
					'ck',
					'ck-list__item'
				]
			},

			children: [
				childView
			]
		} );
	}

	/**
	 * Focuses the list item.
	 */
	focus() {
		this.childView.focus();
	}
}
