/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Observer from './observer.js';
import ViewSelection from '../selection.js';
import { keyCodes } from '../../../utils/keyboard.js';

/**
 * Fake selection observer class. If view selection is fake it is placed in dummy DOM container. This observer listens
 * on {@link engine.view.Document#keydown keydown} events and handles moving fake view selection to the correct place
 * if arrow keys are pressed.
 * Fires {@link engine.view.Document#selectionChage selectionChage event} simulating natural behaviour of
 * {@link engine.view.observer.SelectionObserver SelectionObserver}.
 *
 * @memberOf engine.view.observer
 * @extends engine.view.observer.Observer
 * @fires engine.view.Document#selectionChage
 */
export default class FakeSelectionObserver extends Observer {
	constructor( document ) {
		super( document );

		document.on( 'keydown', ( eventInfo, data ) => {
			const selection = document.selection;

			if ( selection.isFake && _isArrowKeyCode( data.keyCode ) ) {
				// Prevents default keydown handling - no selection change will occur.
				data.preventDefault();

				const newSelection = ViewSelection.createFromSelection( selection );
				newSelection.setFake( false );

				// Left or up arrow pressed - move selection to start.
				if ( data.keyCode == keyCodes.arrowleft || data.keyCode == keyCodes.arrowup ) {
					newSelection.collapseToStart();
				}

				// Right or down arro pressed - move selection to end.
				if ( data.keyCode == keyCodes.arrowright || data.keyCode == keyCodes.arrowdown ) {
					newSelection.collapseToEnd();
				}

				document.fire( 'selectionChange', {
					oldSelection: selection,
					newSelection: newSelection,
					domSelection: null
				} );
			}
		}, { priority: 'lowest' } );
	}

	/**
	 * @inheritDoc
	 */
	observe() {}
}

// Checks if one of the arrow keys is pressed.
//
// @private
// @param {Number} keyCode
// @returns {Boolean}
function _isArrowKeyCode( keyCode ) {
	return keyCode == keyCodes.arrowright ||
		keyCode == keyCodes.arrowleft ||
		keyCode == keyCodes.arrowup ||
		keyCode == keyCodes.arrowdown;
}
