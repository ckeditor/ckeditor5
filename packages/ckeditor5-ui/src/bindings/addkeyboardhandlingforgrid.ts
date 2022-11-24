/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import type { FocusableView } from '../focuscycler';
import type ViewCollection from '../viewcollection';

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
 * @param {String|Undefined} options.uiLanguageDirection String of ui language direction.
 */
export default function addKeyboardHandlingForGrid(
	{ keystrokeHandler, focusTracker, gridItems, numberOfColumns, uiLanguageDirection }: {
		keystrokeHandler: KeystrokeHandler;
		focusTracker: FocusTracker;
		gridItems: ViewCollection;
		numberOfColumns: number | ( () => number );
		uiLanguageDirection?: string;
	}
): void {
	const getNumberOfColumns = typeof numberOfColumns === 'number' ? () => numberOfColumns : numberOfColumns;

	keystrokeHandler.set( 'arrowright', getGridItemFocuser( ( focusedElementIndex, gridItems ) => {
		return uiLanguageDirection === 'rtl' ?
			getLeftElementIndex( focusedElementIndex, gridItems ) :
			getRightElementIndex( focusedElementIndex, gridItems );
	} ) );

	keystrokeHandler.set( 'arrowleft', getGridItemFocuser( ( focusedElementIndex, gridItems ) => {
		return uiLanguageDirection === 'rtl' ?
			getRightElementIndex( focusedElementIndex, gridItems ) :
			getLeftElementIndex( focusedElementIndex, gridItems );
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

	function getGridItemFocuser( getIndexToFocus: ( focusedElementIndex: number, gridItems: ViewCollection ) => number ) {
		return ( evt: KeyboardEvent ) => {
			const focusedElement = gridItems.find( item => item.element === focusTracker.focusedElement );
			const focusedElementIndex = gridItems.getIndex( focusedElement! );
			const nextIndexToFocus = getIndexToFocus( focusedElementIndex, gridItems );

			( gridItems.get( nextIndexToFocus ) as FocusableView ).focus();

			evt.stopPropagation();
			evt.preventDefault();
		};
	}

	// Function returning a right index relatively current index.
	//
	// before: [ ][x][ ]	after: [ ][ ][x]
	//         [ ][ ][ ]	       [ ][ ][ ]
	//         [ ]      	       [ ]
	// index = 1            index = 2
	//
	// If current index is at the right conner, function return first index of next row.
	//
	// before: [ ][ ][x]	after: [ ][ ][ ]
	//         [ ][ ][ ]	       [x][ ][ ]
	//         [ ]      	       [ ]
	// index = 2            index = 3
	//
	// @param {number} [elementIndex] Number of current index.
	// @param {module:ui/viewcollection~ViewCollection} [gridItems] A collection of grid items.
	function getRightElementIndex( elementIndex: number, gridItems: ViewCollection ) {
		if ( elementIndex === gridItems.length - 1 ) {
			return 0;
		} else {
			return elementIndex + 1;
		}
	}

	// Function returning a left index relatively current index.
	//
	// before: [ ][x][ ]	after: [ ][ ][ ]
	//         [ ][ ][ ]	       [x][ ][ ]
	//         [ ]      	       [ ]
	// index = 1            index = 2
	//
	// If current index is at the left conner, function return last index of previous row.
	//
	// before: [ ][ ][ ]	after: [ ][ ][x]
	//         [x][ ][ ]	       [ ][ ][ ]
	//         [ ]      	       [ ]
	// index = 2            index = 0
	//
	// @param {number} [elementIndex] Number of current index.
	// @param {module:ui/viewcollection~ViewCollection} [gridItems] A collection of grid items.
	function getLeftElementIndex( elementIndex: number, gridItems: ViewCollection ) {
		if ( elementIndex === 0 ) {
			return gridItems.length - 1;
		} else {
			return elementIndex - 1;
		}
	}
}
