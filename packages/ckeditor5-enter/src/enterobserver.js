/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/enterobserver
 */

import Observer from '@ckeditor/ckeditor5-engine/src/view/observer/observer';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import BubblingEventInfo from '@ckeditor/ckeditor5-engine/src/view/observer/bubblingeventinfo';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * Enter observer introduces the {@link module:engine/view/document~Document#event:enter} event.
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class EnterObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	constructor( view ) {
		super( view );

		const doc = this.document;

		doc.on( 'keydown', ( evt, data ) => {
			if ( this.isEnabled && data.keyCode == keyCodes.enter ) {
				const event = new BubblingEventInfo( doc, 'enter', doc.selection.getFirstRange() );

				doc.fire( event, new DomEventData( doc, data.domEvent, {
					isSoft: data.shiftKey
				} ) );

				// Stop `keydown` event if `enter` event was stopped.
				// https://github.com/ckeditor/ckeditor5/issues/753
				if ( event.stop.called ) {
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
