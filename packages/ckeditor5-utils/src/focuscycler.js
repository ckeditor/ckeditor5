/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/focuscycler
 */

/**
 * Helps cycling over focusable views in a {@link module:ui/viewcollection~ViewCollection}
 * when the focus is tracked by {@link module:utils/focustracker~FocusTracker} instance.
 */
export default class FocusCycler {
	/**
	 * Creates an instance of the focus cycler.
	 *
	 * @param {module:ui/viewcollection~ViewCollection} viewCollection
	 * @param {module:utils/focustracker~FocusTracker} focusTracker
	 */
	constructor( viewCollection, focusTracker ) {
		/**
		 * A view collection the cycler operates on.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.viewCollection = viewCollection;

		/**
		 * A focus tracker instance that cycler uses to determine focus
		 * state in {@link #viewCollection}.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = focusTracker;
	}

	/**
	 * Returns the first focusable view in the collection. `null` if there's none.
	 *
	 * @member {module:ui/view~View|null} #first
	 */
	get first() {
		return this.viewCollection.find( isFocusable ) || null;
	}

	/**
	 * Returns the next focusable view in the collection based on {@link #current}.
	 * `null` if there's none.
	 *
	 * @member {module:ui/view~View|null} #next
	 */
	get next() {
		return this._getFocusableItem( 1 );
	}

	/**
	 * Returns the previous focusable view in the collection based on {@link #current}.
	 * `null` if there's none.
	 *
	 * @member {module:ui/view~View|null} #next
	 */
	get previous() {
		return this._getFocusableItem( -1 );
	}

	/**
	 * An index of the view in the {@link #viewCollection} which is focused according
	 * to {@link #focusTracker}. `null` when there's no such view.
	 *
	 * @member {Number|null} #current
	 */
	get current() {
		let index = null;

		// There's no focused view in the viewCollection.
		if ( this.focusTracker.focusedElement === null ) {
			return null;
		}

		this.viewCollection.find( ( view, viewIndex ) => {
			const focused = view.element === this.focusTracker.focusedElement;

			if ( focused ) {
				index = viewIndex;
			}

			return focused;
		} );

		return index;
	}

	/**
	 * Returns the next/previous focusable view in {@link #viewCollection} with respect
	 * to {@link #current}.
	 *
	 * @protected
	 * @param {Number} step Either `1` for checking forward of {@link #current} or
	 * `-1` for checking backwards.
	 * @returns {module:ui/view~View|null}
	 */
	_getFocusableItem( step ) {
		// Cache for speed.
		const current = this.current;
		const collectionLength = this.viewCollection.length;

		if ( !collectionLength || current === null ) {
			return null;
		}

		// Cycle in both directions.
		let index = ( current + collectionLength + step ) % collectionLength;

		do {
			let view = this.viewCollection.get( index );

			// TODO: Check if view is visible.
			if ( isFocusable( view ) ) {
				return view;
			}

			// Cycle in both directions.
			index = ( index + collectionLength + step ) % collectionLength;
		} while ( index !== current );

		return null;
	}
}

// Checks whether an view is focusable.
//
// @private
// @param {module:ui/view~View} view A view to be checked.
// @returns {Boolean}
function isFocusable( view ) {
	return view.focus;
}
