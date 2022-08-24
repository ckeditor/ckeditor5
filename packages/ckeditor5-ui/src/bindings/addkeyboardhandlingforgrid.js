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
 * @param {Number|Function} options.numberOfColumns Number of columns in the grid. Can be specified as a function that returns
 * the number (e.g. for responsive grids).
 */
export default function addKeyboardHandlingForGrid( { keystrokeHandler, focusTracker, gridItems, numberOfColumns } ) {
	const getNumberOfColumns = typeof numberOfColumns === 'number' ? () => numberOfColumns : numberOfColumns;

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
		let nextIndex = focusedElementIndex - getNumberOfColumns();

		if ( nextIndex < 0 ) {
			nextIndex = focusedElementIndex + getNumberOfColumns() * Math.floor( gridItems.length / getNumberOfColumns() );

			if ( nextIndex > gridItems.length - 1 ) {
				nextIndex -= getNumberOfColumns();
			}
		}

		return nextIndex;
	} ) );

	keystrokeHandler.set( 'arrowdown', getGridItemFocuser( ( focusedElementIndex, gridItems ) => {
		let nextIndex = focusedElementIndex + getNumberOfColumns();

		if ( nextIndex > gridItems.length - 1 ) {
			nextIndex = focusedElementIndex % getNumberOfColumns();
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
