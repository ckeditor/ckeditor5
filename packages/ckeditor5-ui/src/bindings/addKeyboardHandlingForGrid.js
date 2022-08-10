/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/bindings/addkeyboardhandlingforgrid
 */

/**
 * A helper that adds keyboard navigation (arrow up/down/left/right) for grids.
 *
 * @param {module:utils/keystrokehandler~KeystrokeHandler} keystrokes Keystroke handler to register navigation with arrow keys.
 * @param {module:utils/focustracker~FocusTracker} focusTracker A focus tracker for grid elements.
 * @param {module:ui/viewcollection~ViewCollection} gridElementsCollection A collection of grid items.
 * @param {Number} numberOfColumns Number of columns in the grid.
 */
export default function addKeyboardHandlingForGrid( keystrokes, focusTracker, gridElementsCollection, numberOfColumns ) {
	keystrokes.set( 'arrowright', getGridItemFocuser( ( focusedElementIndex, gridElements ) => {
		if ( focusedElementIndex === gridElements.length - 1 ) {
			return 0;
		} else {
			return focusedElementIndex + 1;
		}
	} ) );

	keystrokes.set( 'arrowleft', getGridItemFocuser( ( focusedElementIndex, gridElements ) => {
		if ( focusedElementIndex === 0 ) {
			return gridElements.length - 1;
		} else {
			return focusedElementIndex - 1;
		}
	} ) );

	keystrokes.set( 'arrowup', getGridItemFocuser( ( focusedElementIndex, gridElements ) => {
		let nextIndex = focusedElementIndex - numberOfColumns;

		if ( nextIndex < 0 ) {
			nextIndex = focusedElementIndex + numberOfColumns * Math.floor( gridElements.length / numberOfColumns );
			if ( nextIndex > gridElements.length - 1 ) {
				nextIndex -= numberOfColumns;
			}
		}

		return nextIndex;
	} ) );

	keystrokes.set( 'arrowdown', getGridItemFocuser( ( focusedElementIndex, gridElements ) => {
		let nextIndex = focusedElementIndex + numberOfColumns;

		if ( nextIndex > gridElements.length - 1 ) {
			nextIndex = focusedElementIndex % numberOfColumns;
		}

		return nextIndex;
	} ) );

	function getGridItemFocuser( getIndexToFocus ) {
		return evt => {
			const gridElements = [ ...gridElementsCollection ];
			const focusedElementIndex = gridElements.findIndex( elem => elem.element === focusTracker.focusedElement );
			const nextIndexToFocus = getIndexToFocus( focusedElementIndex, gridElements );

			gridElements[ nextIndexToFocus ].focus();

			evt.stopPropagation();
			evt.preventDefault();
		};
	}
}
