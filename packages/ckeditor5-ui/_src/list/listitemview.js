/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Controls whether the item view is visible. Visible by default, list items are hidden
		 * using a CSS class.
		 *
		 * @observable
		 * @default true
		 * @member {Boolean} #isVisible
		 */
		this.set( 'isVisible', true );

		/**
		 * Collection of the child views inside of the list item {@link #element}.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'li',

			attributes: {
				class: [
					'ck',
					'ck-list__item',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				]
			},

			children: this.children
		} );
	}

	/**
	 * Focuses the list item.
	 */
	focus() {
		this.children.first.focus();
	}
}
