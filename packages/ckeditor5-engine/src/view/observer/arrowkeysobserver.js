/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/arrowkeysobserver
 */

import Observer from './observer';
import BubblingEventInfo from './bubblingeventinfo';

import { isArrowKeyCode } from '@ckeditor/ckeditor5-utils';

/**
 * Arrow keys observer introduces the {@link module:engine/view/document~Document#event:arrowKey `Document#arrowKey`} event.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
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
				const eventInfo = new BubblingEventInfo( this.document, 'arrowKey', this.document.selection.getFirstRange() );

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
