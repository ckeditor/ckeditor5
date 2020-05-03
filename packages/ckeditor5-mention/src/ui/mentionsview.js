/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/ui/mentionsview
 */

import ListView from '@ckeditor/ckeditor5-ui/src/list/listview';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

import '../../theme/mentionui.css';

/**
 * The mention ui view.
 *
 * @extends module:ui/list/listview~ListView
 */
export default class MentionsView extends ListView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-mentions'
				],

				tabindex: '-1'
			}
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
	 * If the last item is already selected, it will select the first item.
	 */
	selectNext() {
		const item = this.selected;
		const index = this.items.getIndex( item );

		this.select( index + 1 );
	}

	/**
	 * Selects previous item to the currently {@link #select selected}.
	 *
	 * If the first item is already selected, it will select the last item.
	 */
	selectPrevious() {
		const item = this.selected;
		const index = this.items.getIndex( item );

		this.select( index - 1 );
	}

	/**
	 * Marks item at a given index as selected.
	 *
	 * Handles selection cycling when passed index is out of bounds:
	 * - if the index is lower than 0, it will select the last item,
	 * - if the index is higher than the last item index, it will select the first item.
	 *
	 * @param {Number} index Index of an item to be marked as selected.
	 */
	select( index ) {
		let indexToGet = 0;

		if ( index > 0 && index < this.items.length ) {
			indexToGet = index;
		} else if ( index < 0 ) {
			indexToGet = this.items.length - 1;
		}

		const item = this.items.get( indexToGet );

		// Return early if item is already selected.
		if ( this.selected === item ) {
			return;
		}

		// Remove highlight of previously selected item.
		if ( this.selected ) {
			this.selected.removeHighlight();
		}

		item.highlight();
		this.selected = item;

		// Scroll the mentions view to the selected element.
		if ( !this._isItemVisibleInScrolledArea( item ) ) {
			this.element.scrollTop = item.element.offsetTop;
		}
	}

	/**
	 * Triggers the `execute` event on the {@link #select selected} item.
	 */
	executeSelected() {
		this.selected.fire( 'execute' );
	}

	// Checks if an item is visible in the scrollable area.
	//
	// The item is considered visible when:
	// - its top boundary is inside the scrollable rect
	// - its bottom boundary is inside the scrollable rect (the whole item must be visible)
	_isItemVisibleInScrolledArea( item ) {
		return new Rect( this.element ).contains( new Rect( item.element ) );
	}
}
