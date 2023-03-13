/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/arrowkeysobserver
 */

import Observer from './observer';
import BubblingEventInfo from './bubblingeventinfo';
import type View from '../view';
import type { KeyEventData, ViewDocumentKeyDownEvent } from './keyobserver';
import type { BubblingEvent } from './bubblingemittermixin';

import { isArrowKeyCode } from '@ckeditor/ckeditor5-utils';

/**
 * Arrow keys observer introduces the {@link module:engine/view/document~Document#event:arrowKey `Document#arrowKey`} event.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 */
export default class ArrowKeysObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	constructor( view: View ) {
		super( view );

		this.document.on<ViewDocumentKeyDownEvent>( 'keydown', ( event, data ) => {
			if ( this.isEnabled && isArrowKeyCode( data.keyCode ) ) {
				const eventInfo = new BubblingEventInfo( this.document, 'arrowKey', this.document.selection.getFirstRange()! );

				this.document.fire<ViewDocumentArrowKeyEvent>( eventInfo, data );

				if ( eventInfo.stop.called ) {
					event.stop();
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override observe(): void {}
}

/**
 * Event fired when the user presses an arrow keys.
 *
 * Introduced by {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver}.
 *
 * Note that because {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @eventName module:engine/view/document~Document#arrowKey
 * @param data
 */

export type ViewDocumentArrowKeyEvent = BubblingEvent<{
	name: 'arrowKey';
	args: [ data: KeyEventData ];
}>;
