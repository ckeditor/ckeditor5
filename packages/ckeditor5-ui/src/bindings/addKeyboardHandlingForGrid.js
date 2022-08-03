/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/bindings/addKeyboardHandlingForGrid
 */

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

export default function addKeyboardHandlingForGrid( keystrokes, gridElementsCollection, numberOfColumns, isTable ) {
	const focusTracker = new FocusTracker();

	for ( const item of gridElementsCollection ) {
		focusTracker.add( item.element );
	}

	gridElementsCollection.on( 'change', ( eventInfo, { added, removed } ) => {
		if ( added.length > 0 ) {
			for ( const item of added ) {
				focusTracker.add( item.element );
			}
		}
		if ( removed.length > 0 ) {
			for ( const item of removed ) {
				focusTracker.remove( item.element );
			}
		}
	} );

	keystrokes.set( 'arrowright', evt => {
		const gridElements = [ ...gridElementsCollection ];
		const focusedElementIndex = getFocusedElement( gridElements, focusTracker );

		let nextIndex;

		if ( focusedElementIndex === gridElements.length - 1 ) {
			nextIndex = 0;
		} else {
			nextIndex = focusedElementIndex + 1;
		}

		gridElements[ nextIndex ].focus();

		if ( isTable ) {
			// gridElements[ nextIndex ].selectTile( view );
		}

		evt.stopPropagation();
		evt.preventDefault();
	} );

	keystrokes.set( 'arrowleft', evt => {
		const gridElements = [ ...gridElementsCollection ];
		const focusedElementIndex = getFocusedElement( gridElements, focusTracker );
		let nextIndex;

		if ( focusedElementIndex === 0 ) {
			nextIndex = gridElements.length - 1;
		} else {
			nextIndex = focusedElementIndex - 1;
		}

		gridElements[ nextIndex ].focus();

		if ( isTable ) {
			// gridElements[ nextIndex ].selectTile( view );
		}

		evt.stopPropagation();
		evt.preventDefault();
	} );

	keystrokes.set( 'arrowup', evt => {
		const gridElements = [ ...gridElementsCollection ];
		const focusedElementIndex = getFocusedElement( gridElements, focusTracker );
		let nextIndex = focusedElementIndex - numberOfColumns;

		if ( nextIndex < 0 ) {
			nextIndex = focusedElementIndex + numberOfColumns * Math.floor( gridElements.length / numberOfColumns );
			if ( nextIndex > gridElements.length - 1 ) {
				nextIndex -= numberOfColumns;
			}
		}

		gridElements[ nextIndex ].focus();

		if ( isTable ) {
			// gridElements[ nextIndex ].selectTile( view );
		}

		evt.stopPropagation();
		evt.preventDefault();
	} );

	keystrokes.set( 'arrowdown', evt => {
		const gridElements = [ ...gridElementsCollection ];
		const focusedElementIndex = getFocusedElement( gridElements, focusTracker );
		let nextIndex = focusedElementIndex + numberOfColumns;

		if ( nextIndex > gridElements.length - 1 ) {
			nextIndex = focusedElementIndex % numberOfColumns;
		}

		gridElements[ nextIndex ].focus();

		if ( isTable ) {
			// gridElements[ nextIndex ].selectTile( view );
		}

		evt.stopPropagation();
		evt.preventDefault();
	} );

	function getFocusedElement( gridElements ) {
		return gridElements.findIndex( elem => elem.element === focusTracker.focusedElement );
	}
}
