/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Observer from '../engine/view/observer/observer.js';
import DomEventData from '../engine/view/observer/domeventdata.js';
import { keyCodes } from '../utils/keyboard.js';

/**
 * Delete observer introduces the {@link engine.view.Document#delete} event.
 *
 * @memberOf typing
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
 * Note: This event is fired by the {@link typing.DeleteObserver observer}
 * (usually registered by the {@link typing.Delete delete feature}).
 *
 * @event engine.view.Document#delete
 * @param {engine.view.observer.DomEventData} data
 * @param {'forward'|'delete'} data.direction The direction in which the deletion should happen.
 * @param {'character'|'word'} data.unit The "amount" of content that should be deleted.
 */
