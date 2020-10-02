/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/enterobserver
 */

import Observer from '@ckeditor/ckeditor5-engine/src/view/observer/observer';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
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
	 * Enables the enter observer that translates the `beforeinput` events fired by the browser (with different input types)
	 * to the view document {@link module:engine/view/document~Document#event:enter `enter`} events.
	 *
	 * @protected
	 */
	_enableBeforeInputBasedObserver() {
		const viewDocument = this.document;

		viewDocument.on( 'beforeinput', ( evt, data ) => {
			if ( !this.isEnabled ) {
				return;
			}

			const domEvent = data.domEvent;
			const { inputType } = domEvent;
			const isSoftEnter = inputType === 'insertLineBreak';

			if ( !( inputType === 'insertParagraph' || inputType === 'insertLineBreak' ) ) {
				return;
			}

			this._fireEnterEvent( domEvent, evt.stop, isSoftEnter );
			data.preventDefault();
		} );
	}

	/**
	 * Enables the legacy enter observer that translates `keydown` events fired by the browser
	 * to the view document {@link module:engine/view/document~Document#event:enter `enter`} events.
	 *
	 * @protected
	 */
	_enableKeyEventsBasedObserver() {
		const viewDocument = this.document;

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
	 * A helper method which fires the {@link module:engine/view/document~Document#event:enter `enter`} event
	 * on the view document and unifies the event stopping logic.
	 *
	 * @protected
	 * @member {module:engine/view/observer/observer~Observer.DomEvent#domEvent} domEvent DOM event the `enter` event is fired for.
	 * @member {Function} stop The stop function that stops propagation of the DOM event when `enter` event was stopped.
	 * @member {Boolean} isSoft A flag indicating this is a "soft" enter (a.k.a shift enter).
	 */
	_fireEnterEvent( domEvent, stop, isSoft ) {
		const viewDocument = this.document;

		const eventInfo = new EventInfo( viewDocument, 'enter' );
		const data = new DomEventData( viewDocument, domEvent, { isSoft } );

		viewDocument.fire( eventInfo, data );

		// Stop `keydown` or `beforeinput` event if `enter` event was stopped.
		// https://github.com/ckeditor/ckeditor5/issues/753
		if ( eventInfo.stop.called ) {
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
