/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/deleteobserver
 */

import Observer from '../engine/view/observer/observer.js';
import DomEventData from '../engine/view/observer/domeventdata.js';
import { keyCodes } from '../utils/keyboard.js';

/**
 * Delete observer introduces the {@link module:engine/view/document~Document#event:delete} event.
 *
 * @extends engine.view.observer.Observer
 */
export default class DeleteObserver extends Observer {
	constructor( document ) {
		super( document );

		document.on( 'keydown', ( evt, data ) => {
			const deleteData = {};

			if ( data.keyCode == keyCodes.delete ) {
				deleteData.direction = 'forward';
				deleteData.unit = 'character';
			} else if ( data.keyCode == keyCodes.backspace ) {
				deleteData.direction = 'backward';
				deleteData.unit = 'codePoint';
			} else {
				return;
			}

			deleteData.unit = data.altKey ? 'word' : deleteData.unit;

			document.fire( 'delete', new DomEventData( document, data.domEvent, deleteData ) );
		} );
	}

	/**
	 * @inheritDoc
	 */
	observe() {}
}

/**
 * Event fired when the user tries to delete content (e.g. presses <kbd>Delete</kbd> or <kbd>Backspace</kbd>).
 *
 * Note: This event is fired by the {@link module:typing/deleteobserver~DeleteObserver observer}
 * (usually registered by the {@link module:typing/delete~Delete delete feature}).
 *
 * @event module:engine/view/document~Document#event:delete
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 * @param {'forward'|'delete'} data.direction The direction in which the deletion should happen.
 * @param {'character'|'word'} data.unit The "amount" of content that should be deleted.
 */
