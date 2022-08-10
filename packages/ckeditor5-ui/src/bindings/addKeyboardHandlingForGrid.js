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
	keystrokes.set( 'arrowright', evt => {
		const gridElements = [ ...gridElementsCollection ];
		const focusedElementIndex = getFocusedElementIndex( gridElements, focusTracker );

		let nextIndex;

		if ( focusedElementIndex === gridElements.length - 1 ) {
			nextIndex = 0;
		} else {
			nextIndex = focusedElementIndex + 1;
		}

		gridElements[ nextIndex ].focus();

		evt.stopPropagation();
		evt.preventDefault();
	} );

	keystrokes.set( 'arrowleft', evt => {
		const gridElements = [ ...gridElementsCollection ];
		const focusedElementIndex = getFocusedElementIndex( gridElements, focusTracker );
		let nextIndex;

		if ( focusedElementIndex === 0 ) {
			nextIndex = gridElements.length - 1;
		} else {
			nextIndex = focusedElementIndex - 1;
		}

		gridElements[ nextIndex ].focus();

		evt.stopPropagation();
		evt.preventDefault();
	} );

	keystrokes.set( 'arrowup', evt => {
		const gridElements = [ ...gridElementsCollection ];
		const focusedElementIndex = getFocusedElementIndex( gridElements, focusTracker );
		let nextIndex = focusedElementIndex - numberOfColumns;

		if ( nextIndex < 0 ) {
			nextIndex = focusedElementIndex + numberOfColumns * Math.floor( gridElements.length / numberOfColumns );
			if ( nextIndex > gridElements.length - 1 ) {
				nextIndex -= numberOfColumns;
			}
		}

		gridElements[ nextIndex ].focus();

		evt.stopPropagation();
		evt.preventDefault();
	} );

	keystrokes.set( 'arrowdown', evt => {
		const gridElements = [ ...gridElementsCollection ];
		const focusedElementIndex = getFocusedElementIndex( gridElements, focusTracker );
		let nextIndex = focusedElementIndex + numberOfColumns;

		if ( nextIndex > gridElements.length - 1 ) {
			nextIndex = focusedElementIndex % numberOfColumns;
		}

		gridElements[ nextIndex ].focus();

		evt.stopPropagation();
		evt.preventDefault();
	} );

	function getFocusedElementIndex( gridElements ) {
		return gridElements.findIndex( elem => elem.element === focusTracker.focusedElement );
	}
}
