/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module enter/softbreakobserver
 */

import Observer from '@ckeditor/ckeditor5-engine/src/view/observer/observer';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * SoftBreak observer introduces the {@link module:engine/view/document~Document#event:softbreak} event.
 *
 * @extends module:engine/view/observer~Observer
 */
export default class SoftBreakObserver extends Observer {
	constructor( view ) {
		super( view );

		const document = this.document;

		document.on( 'keydown', ( evt, data ) => {
			if ( this.isEnabled && data.keyCode == keyCodes.enter && data.shiftKey ) {
				// Save the event object to check later if it was stopped or not.
				let event;
				document.once( 'softbreak', evt => ( event = evt ), { priority: 'highest' } );

				document.fire( 'softbreak', new DomEventData( document, data.domEvent ) );

				// Stop `keydown` event if `enter` event was stopped.
				// https://github.com/ckeditor/ckeditor5/issues/753
				if ( event && event.stop.called ) {
					evt.stop();
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	observe() {}
}

/**
 * Event fired when the user presses the <kbd>Shift+Enter</kbd> key.
 *
 * Note: This event is fired by the {@link module:enter/softbreakobserver~SoftBreakObserver observer}
 * (usually registered by the {@link module:enter/softbreak~SoftBreak SoftBreak feature}).
 *
 * @event module:engine/view/document~Document#event:softbreak
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 */
