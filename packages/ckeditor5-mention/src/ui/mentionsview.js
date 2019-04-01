/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/ui/mentionsview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ListView from '@ckeditor/ckeditor5-ui/src/list/listview';

import '../../theme/mentionui.css';

/**
 * The mention ui view.
 *
 * @extends module:ui/view~View
 */
export default class MentionsView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		this.listView = new ListView( locale );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-mention-view'
				],

				tabindex: '-1'
			},

			children: [
				this.listView
			]
		} );
	}

	/**
	 * {@link #select Selects} the first item.
	 */
	selectFirst() {
		this.select( 0 );
	}

	/**
	 * Selects next item to the currently {@link #select selected}.
	 *
	 * If last item is already selected it will select first item.
	 */
	selectNext() {
		const item = this.selected;

		const index = this.listView.items.getIndex( item );

		this.select( index + 1 );
	}

	/**
	 * Selects previous item to the currently {@link #select selected}.
	 *
	 * If the first item is already selected, it will select the last item.
	 */
	selectPrevious() {
		const item = this.selected;

		const index = this.listView.items.getIndex( item );

		this.select( index - 1 );
	}

	/**
	 * Marks item at a given index as selected.
	 *
	 * Handles selection cycling when passed index is out of bounds:
	 * - if index is lover then 0 it will select last item
	 * - if index is higher then last item index it will select the first item.
	 *
	 * @param {Number} index Index of item to mark as selected.
	 */
	select( index ) {
		let indexToGet = 0;

		if ( index > 0 && index < this.listView.items.length ) {
			indexToGet = index;
		} else if ( index < 0 ) {
			indexToGet = this.listView.items.length - 1;
		}

		const item = this.listView.items.get( indexToGet );
		item.highlight();

		// Scroll the mentions view to the selected element.
		if ( !this._isItemVisibleInScrolledArea( item ) ) {
			this.element.scrollTop = item.element.offsetTop;
		}

		if ( this.selected ) {
			this.selected.removeHighlight();
		}

		this.selected = item;
	}

	/**
	 * Triggers "execute" event on selected item.
	 */
	executeSelected() {
		this.selected.fire( 'execute' );
	}

	// Checks if item is visible in scrolled area.
	//
	// The item is considered visible when:
	// - its top line is inside scrolled rect
	// - its bottom line is inside scrolled rect (whole item must be visible)
	_isItemVisibleInScrolledArea( item ) {
		const isBottomLineVisible = item.element.offsetTop + item.element.clientHeight <= this.element.clientHeight;
		const isTopLineVisible = item.element.offsetTop >= this.element.scrollTop;

		return isBottomLineVisible && isTopLineVisible;
	}
}
