/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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

			fireViewDeleteEvent( evt, data.domEvent, deleteData );
		} );

		// `beforeinput` is handled only for Android devices. Desktop Chrome and iOS are skipped because they are working fine now.
		if ( env.isAndroid ) {
			document.on( 'beforeinput', ( evt, data ) => {
				// If event type is other than `deleteContentBackward` then this is not deleting.
				if ( data.domEvent.inputType != 'deleteContentBackward' ) {
					return;
				}

				const deleteData = {
					unit: 'codepoint',
					direction: 'backward',
					sequence: 1
				};

				// Android IMEs may change the DOM selection on `beforeinput` event so that the selection contains all the text
				// that the IME wants to remove. We will pass this information to `delete` event so proper part of the content is removed.
				//
				// Sometimes it is only expanding by a one character (in case of collapsed selection). In this case we don't need to
				// set a different selection to remove, it will work just fine.
				const domSelection = data.domTarget.ownerDocument.defaultView.getSelection();

				if ( domSelection.anchorNode == domSelection.focusNode && domSelection.anchorOffset + 1 != domSelection.focusOffset ) {
					deleteData.selectionToRemove = view.domConverter.domSelectionToView( domSelection );
				}

				fireViewDeleteEvent( evt, data.domEvent, deleteData );
			} );
		}

		function fireViewDeleteEvent( originalEvent, domEvent, deleteData ) {
			// Save the event object to check later if it was stopped or not.
			let event;
			document.once( 'delete', evt => ( event = evt ), { priority: Number.POSITIVE_INFINITY } );

			document.fire( 'delete', new DomEventData( document, domEvent, deleteData ) );

			// Stop the original event if `delete` event was stopped.
			// https://github.com/ckeditor/ckeditor5/issues/753
			if ( event && event.stop.called ) {
				originalEvent.stop();
			}
		}
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
 * @param {module:engine/view/selection~Selection} [data.selectionToRemove] View selection which content should be removed. If not set,
 * current selection should be used.
 */
