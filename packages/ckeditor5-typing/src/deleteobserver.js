/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/deleteobserver
 */

import Observer from '@ckeditor/ckeditor5-engine/src/view/observer/observer';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import env from '@ckeditor/ckeditor5-utils/src/env';

/**
 * Delete observer introduces the {@link module:engine/view/document~Document#event:delete} event.
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class DeleteObserver extends Observer {
	constructor( view ) {
		super( view );

		const document = view.document;
		let sequence = 0;

		document.on( 'keyup', ( evt, data ) => {
			if ( data.keyCode == keyCodes.delete || data.keyCode == keyCodes.backspace ) {
				sequence = 0;
			}
		} );

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

			const hasWordModifier = env.isMac ? data.altKey : data.ctrlKey;
			deleteData.unit = hasWordModifier ? 'word' : deleteData.unit;
			deleteData.sequence = ++sequence;

			// Save the event object to check later if it was stopped or not.
			let event;
			document.once( 'delete', evt => ( event = evt ), { priority: Number.POSITIVE_INFINITY } );

			const domEvtData = new DomEventData( document, data.domEvent, deleteData );
			document.fire( 'delete', domEvtData );

			// Stop `keydown` event if `delete` event was stopped.
			// https://github.com/ckeditor/ckeditor5/issues/753
			if ( event && event.stop.called ) {
				evt.stop();
			}
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
 * @param {Number} data.sequence A number describing which subsequent delete event it is without the key being released.
 * If it's 2 or more it means that the key was pressed and hold.
 */
