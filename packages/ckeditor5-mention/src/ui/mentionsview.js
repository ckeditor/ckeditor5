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

	selectFirst() {
		this.select( 0 );
	}

	selectNext() {
		const item = this.selected;

		const index = this.listView.items.getIndex( item );

		this.select( index + 1 );
	}

	selectPrevious() {
		const item = this.selected;

		const index = this.listView.items.getIndex( item );

		this.select( index - 1 );
	}

	select( index ) {
		let indexToGet = 0;

		if ( index > 0 && index < this.listView.items.length ) {
			indexToGet = index;
		} else if ( index < 0 ) {
			indexToGet = this.listView.items.length - 1;
		}

		const item = this.listView.items.get( indexToGet );
		item.highlight();

		if ( this.selected ) {
			this.selected.removeHighlight();
		}

		this.selected = item;
	}

	executeSelected() {
		this.selected.fire( 'execute' );
	}
}
