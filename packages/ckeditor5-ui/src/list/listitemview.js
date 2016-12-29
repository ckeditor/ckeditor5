/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/list/listitemview
 */

import View from '../view';
import Template from '../template';

/**
 * The list item view class.
 *
 * @extends module:ui/view~View
 */
export default class ListItemView extends View {
	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		const bind = this.bindTemplate;

		this.template = new Template( {
			tag: 'li',

			attributes: {
				class: [
					'ck-list__item'
				],
				style: bind.to( 'style' )
			},

			children: [
				{
					text: bind.to( 'label' )
				}
			],

			on: {
				click: bind.to( 'execute' )
			}
		} );

		/**
		 * The label of the list item.
		 *
		 * @observable
		 * @member {String} #label
		 */

		/**
		 * (Optional) The DOM style attribute of the list item.
		 *
		 * @observable
		 * @member {String} #style
		 */

		/**
		 * Fired when the list item has been clicked.
		 *
		 * @event #execute
		 */
	}
}
