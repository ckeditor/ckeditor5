/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/ui/mentionsview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ListView from '@ckeditor/ckeditor5-ui/src/list/listview';

/**
 * The mention ui view.
 *
 * @extends module:ui/view~View
 */
export default class MentionsView extends View {
	constructor( locale ) {
		super( locale );

		this.listView = new ListView( locale );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-mention'
				],

				tabindex: '-1'
			},

			children: [
				this.listView
			]
		} );
	}
}
