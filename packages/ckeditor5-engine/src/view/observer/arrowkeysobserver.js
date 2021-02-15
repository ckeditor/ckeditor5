/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/arrowkeysobserver
 */

import Observer from './observer';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import { isArrowKeyCode } from '@ckeditor/ckeditor5-utils';

/**
 * Arrow keys observer introduces the {@link module:engine/view/document~Document#event:arrowKey} event.
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class ArrowKeysObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	constructor( view ) {
		super( view );

		this.document.on( 'keydown', ( event, data ) => {
			if ( this.isEnabled && isArrowKeyCode( data.keyCode ) ) {
				const eventInfo = new EventInfo( this.document, 'arrowKey' );

				this.document.fire( eventInfo, data );

				if ( eventInfo.stop.called ) {
					event.stop();
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
 * Event fired when the user presses an arrow keys.
 *
 * Introduced by {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver}.
 *
 * Note that because {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @event module:engine/view/document~Document#event:arrowKey
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 */
