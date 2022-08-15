/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/bindings/addkeyboardhandlingforgrid
 */

/**
 * A helper that adds a keyboard navigation support (arrow up/down/left/right) for grids.
 *
 * @param {Object} options Configuration options.
 * @param {module:utils/keystrokehandler~KeystrokeHandler} options.keystrokeHandler Keystroke handler to register navigation with arrow
 * keys.
 * @param {module:utils/focustracker~FocusTracker} options.focusTracker A focus tracker for grid elements.
 * @param {module:ui/viewcollection~ViewCollection} options.gridItems A collection of grid items.
 * @param {Number} options.numberOfColumns Number of columns in the grid.
 */
export default function addKeyboardHandlingForGrid( { keystrokeHandler, focusTracker, gridItems, numberOfColumns } ) {
	keystrokeHandler.set( 'arrowright', getGridItemFocuser( ( focusedElementIndex, gridItems ) => {
		if ( focusedElementIndex === gridItems.length - 1 ) {
			return 0;
		} else {
			return focusedElementIndex + 1;
		}
	} ) );

	keystrokeHandler.set( 'arrowleft', getGridItemFocuser( ( focusedElementIndex, gridItems ) => {
		if ( focusedElementIndex === 0 ) {
			return gridItems.length - 1;
		} else {
			return focusedElementIndex - 1;
		}
	} ) );

	keystrokeHandler.set( 'arrowup', getGridItemFocuser( ( focusedElementIndex, gridItems ) => {
		let nextIndex = focusedElementIndex - numberOfColumns;

		if ( nextIndex < 0 ) {
			nextIndex = focusedElementIndex + numberOfColumns * Math.floor( gridItems.length / numberOfColumns );

			if ( nextIndex > gridItems.length - 1 ) {
				nextIndex -= numberOfColumns;
			}
		}

		return nextIndex;
	} ) );

	keystrokeHandler.set( 'arrowdown', getGridItemFocuser( ( focusedElementIndex, gridItems ) => {
		let nextIndex = focusedElementIndex + numberOfColumns;

		if ( nextIndex > gridItems.length - 1 ) {
			nextIndex = focusedElementIndex % numberOfColumns;
		}

		return nextIndex;
	} ) );

	function getGridItemFocuser( getIndexToFocus ) {
		return evt => {
			const focusedElement = gridItems.find( item => item.element === focusTracker.focusedElement );
			const focusedElementIndex = gridItems.getIndex( focusedElement );
			const nextIndexToFocus = getIndexToFocus( focusedElementIndex, gridItems );

			gridItems.get( nextIndexToFocus ).focus();

			evt.stopPropagation();
			evt.preventDefault();
		};
	}
}
