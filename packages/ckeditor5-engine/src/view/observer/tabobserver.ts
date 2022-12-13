/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/tabobserver
 */

import type View from '../view';
import Observer from './observer';
import BubblingEventInfo from './bubblingeventinfo';
import type { ViewDocumentKeyEvent } from './keyobserver';
import type { BubblingEvent } from './bubblingemittermixin';

import { keyCodes } from '@ckeditor/ckeditor5-utils';

/**
 * Tab observer introduces the {@link module:engine/view/document~Document#event:tab `Document#tab`} event.
 *
 * Note that because {@link module:engine/view/observer/tabobserver~TabObserver} is attached by the
 * {@link module:engine/view/view~View}, this event is available by default.
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class TabObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	constructor( view: View ) {
		super( view );

		const doc = this.document;

		doc.on<ViewDocumentKeyEvent>( 'keydown', ( evt, data ) => {
			if (
				!this.isEnabled ||
				data.keyCode != keyCodes.tab ||
				data.ctrlKey
			) {
				return;
			}

			const event = new BubblingEventInfo( doc, 'tab', doc.selection.getFirstRange()! );

			doc.fire<ViewDocumentTabEvent>( event, data );

			if ( event.stop.called ) {
				evt.stop();
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override observe(): void {}
}

export type ViewDocumentTabEvent = BubblingEvent<{
	name: 'tab';
	args: ViewDocumentKeyEvent[ 'args' ];
}>;

/**
 * Event fired when the user presses a tab key.
 *
 * Introduced by {@link module:engine/view/observer/tabobserver~TabObserver}.
 *
 * Note that because {@link module:engine/view/observer/tabobserver~TabObserver} is attached by the
 * {@link module:engine/view/view~View}, this event is available by default.
 *
 * @event module:engine/view/document~Document#event:tab
 *
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 */
