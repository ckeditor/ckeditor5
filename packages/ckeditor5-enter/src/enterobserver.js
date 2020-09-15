/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/enterobserver
 */

import Observer from '@ckeditor/ckeditor5-engine/src/view/observer/observer';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import env from '@ckeditor/ckeditor5-utils/src/env';

/**
 * Enter observer introduces the {@link module:engine/view/document~Document#event:enter} event.
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class EnterObserver extends Observer {
	constructor( view ) {
		super( view );

		// Use the beforeinput DOM event to handle enter when supported by the browser.
		// Fall back to the keydown event if beforeinput is not supported by the browser.
		if ( env.features.isInputEventsLevel1Supported ) {
			this._enableBeforeInputBasedObserver();
		} else {
			this._enableKeyEventsBasedObserver();
		}
	}

	/**
	 * TODO
	 */
	_enableBeforeInputBasedObserver() {
		const viewDocument = this.view.document;

		viewDocument.on( 'beforeinput', ( evt, data ) => {
			if ( !this.isEnabled ) {
				return;
			}

			const domEvent = data.domEvent;
			const { inputType } = domEvent;

			if ( inputType === 'insertParagraph' ) {
				this._fireEnterEvent( domEvent, evt.stop );
				data.preventDefault();
			} else if ( inputType === 'insertLineBreak' ) {
				this._fireEnterEvent( domEvent, evt.stop, true );
				data.preventDefault();
			}
		} );
	}

	/**
	 * TODO
	 */
	_enableKeyEventsBasedObserver() {
		const viewDocument = this.view.document;

		viewDocument.on( 'keydown', ( evt, data ) => {
			if ( !this.isEnabled ) {
				return;
			}

			const { domEvent, shiftKey, keyCode } = data;

			if ( keyCode === keyCodes.enter ) {
				this._fireEnterEvent( domEvent, evt.stop, shiftKey );
			}
		} );
	}

	/**
	 * TODO
	 */
	_fireEnterEvent( domEvent, stop, isSoft ) {
		const viewDocument = this.view.document;

		// Save the event object to check later if it was stopped or not.
		let event;

		viewDocument.once( 'enter', evt => ( event = evt ), { priority: Number.POSITIVE_INFINITY } );
		viewDocument.fire( 'enter', new DomEventData( viewDocument, domEvent, { isSoft } ) );

		// Stop `keydown` event if `enter` event was stopped.
		// https://github.com/ckeditor/ckeditor5/issues/753
		if ( event && event.stop.called ) {
			stop();
		}
	}

	/**
	 * @inheritDoc
	 */
	observe() {}
}

/**
 * Event fired when the user presses the <kbd>Enter</kbd> key.
 *
 * Note: This event is fired by the {@link module:enter/enterobserver~EnterObserver observer}
 * (usually registered by the {@link module:enter/enter~Enter Enter feature} and
 * {@link module:enter/shiftenter~ShiftEnter ShiftEnter feature}).
 *
 * @event module:engine/view/document~Document#event:enter
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 * @param {Boolean} data.isSoft Whether it's a soft enter (<kbd>Shift</kbd>+<kbd>Enter</kbd>) or hard enter (<kbd>Enter</kbd>).
 */
