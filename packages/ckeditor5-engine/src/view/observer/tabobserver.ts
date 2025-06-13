/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/observer/tabobserver
 */

import { type EditingView } from '../view.js';
import { Observer } from './observer.js';
import { BubblingEventInfo } from './bubblingeventinfo.js';
import type { ViewDocumentKeyEventData, ViewDocumentKeyDownEvent } from './keyobserver.js';
import type { BubblingEvent } from './bubblingemittermixin.js';

import { keyCodes } from '@ckeditor/ckeditor5-utils';

/**
 * Tab observer introduces the {@link module:engine/view/document~ViewDocument#event:tab `Document#tab`} event.
 *
 * Note that because {@link module:engine/view/observer/tabobserver~TabObserver} is attached by the
 * {@link module:engine/view/view~EditingView}, this event is available by default.
 */
export class TabObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	constructor( view: EditingView ) {
		super( view );

		const doc = this.document;

		doc.on<ViewDocumentKeyDownEvent>( 'keydown', ( evt, data ) => {
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

	/**
	 * @inheritDoc
	 */
	public override stopObserving(): void {}
}

/**
 * Event fired when the user presses a tab key.
 *
 * Introduced by {@link module:engine/view/observer/tabobserver~TabObserver}.
 *
 * Note that because {@link module:engine/view/observer/tabobserver~TabObserver} is attached by the
 * {@link module:engine/view/view~EditingView}, this event is available by default.
 *
 * @eventName module:engine/view/document~ViewDocument#tab
 * @param data
 */
export type ViewDocumentTabEvent = BubblingEvent<{
	name: 'tab';
	args: [ data: ViewDocumentKeyEventData ];
}>;
