/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/bindings/addkeyboardhandlingforgrid
 */

import type { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import type { FocusableView } from '../focuscycler';
import type ViewCollection from '../viewcollection';

/**
 * A helper that adds a keyboard navigation support (arrow up/down/left/right) for grids.
 *
 * @param options Configuration options.
 * @param options.keystrokeHandler Keystroke handler to register navigation with arrow keys.
 * @param options.focusTracker A focus tracker for grid elements.
 * @param options.gridItems A collection of grid items.
 * @param options.numberOfColumns Number of columns in the grid. Can be specified as a function that returns
 * the number (e.g. for responsive grids).
 * @param options.uiLanguageDirection String of ui language direction.
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
			getLeftElementIndex( focusedElementIndex, gridItems.length ) :
			getRightElementIndex( focusedElementIndex, gridItems.length );
	} ) );

	keystrokeHandler.set( 'arrowleft', getGridItemFocuser( ( focusedElementIndex, gridItems ) => {
		return uiLanguageDirection === 'rtl' ?
			getRightElementIndex( focusedElementIndex, gridItems.length ) :
			getLeftElementIndex( focusedElementIndex, gridItems.length );
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

	/**
	 * Function returning the next index.
	 *
	 * ```
	 * before: [ ][x][ ]	after: [ ][ ][x]
	 * index = 1            index = 2
	 * ```
	 *
	 * If current index is last, function returns first index.
	 *
	 * ```
	 * before: [ ][ ][x]	after: [x][ ][ ]
	 * index = 2            index = 0
	 * ```
	 *
	 * @param elementIndex Number of current index.
	 * @param collectionLength A count of collection items.
	 */
	function getRightElementIndex( elementIndex: number, collectionLength: number ) {
		if ( elementIndex === collectionLength - 1 ) {
			return 0;
		} else {
			return elementIndex + 1;
		}
	}

	/**
	 * Function returning the previous index.
	 *
	 * ```
	 * before: [ ][x][ ]	after: [x][ ][ ]
	 * index = 1            index = 0
	 * ```
	 *
	 * If current index is first, function returns last index.
	 *
	 * ```
	 * before: [x][ ][ ]	after: [ ][ ][x]
	 * index = 0            index = 2
	 * ```
	 *
	 * @param elementIndex Number of current index.
	 * @param collectionLength A count of collection items.
	 */
	function getLeftElementIndex( elementIndex: number, collectionLength: number ) {
		if ( elementIndex === 0 ) {
			return collectionLength - 1;
		} else {
			return elementIndex - 1;
		}
	}
}
