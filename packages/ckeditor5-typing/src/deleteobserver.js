/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Observer from '../engine/view/observer/observer.js';
import DomEventData from '../engine/view/observer/domeventdata.js';
import { keyCodes } from '../utils/keyboard.js';

/**
 * Delete observer introduces the {@link engine.view.Document#delete} event.
 *
 * @memberOf delete
 * @extends engine.view.observer.Observer
 */
export default class DeleteObserver extends Observer {
	constructor( document ) {
		super( document );

		document.on( 'keydown', ( evt, data ) => {
			const deleteData = {};

			if ( data.keyCode == keyCodes.delete ) {
				deleteData.direction = 'FORWARD';
			} else if ( data.keyCode == keyCodes.backspace ) {
				deleteData.direction = 'BACKWARD';
			} else {
				return;
			}

			deleteData.unit = data.altKey ? 'WORD' : 'CHARACTER';

			document.fire( 'delete', new DomEventData( document, data.domEvent, deleteData ) );
		} );
	}

	/**
	 * @inheritDoc
	 */
	observe() {}
}

/**
 * Event fired when the user tries to delete contents (e.g. presses <kbd>Delete</kbd> or <kbd>Backspace</kbd>).
 *
 * Note: This event is fired by the {@link delete.DeleteObserver observer}
 * (usually registered by the {@link delete.Delete delete feature}).
 *
 * @event engine.view.Document#delete
 * @param {engine.view.observer.DomEventData} data
 * @param {'FORWARD'|'DELETE'} data.direction The direction in which the deletion should happen.
 * @param {'CHARACTER'|'WORD'} data.unit The "amount" of content that should be deleted.
 */
