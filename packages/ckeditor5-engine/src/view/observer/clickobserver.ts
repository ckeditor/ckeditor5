/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/observer/clickobserver
 */

import { DomEventObserver } from './domeventobserver.js';
import { type ViewDocumentDomEventData } from './domeventdata.js';
import type { BubblingEvent } from './bubblingemittermixin.js';

/**
 * {@link module:engine/view/document~ViewDocument#event:click Click} event observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~EditingView view controller} by a {@link module:engine/view/view~EditingView#addObserver} method.
 */
export class ClickObserver extends DomEventObserver<'click'> {
	/**
	 * @inheritDoc
	 */
	public readonly domEventType = 'click' as const;

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: MouseEvent ): void {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when one of the editables has been clicked.
 *
 * Introduced by {@link module:engine/view/observer/clickobserver~ClickObserver}.
 *
 * Note that this event is not available by default. To make it available
 * {@link module:engine/view/observer/clickobserver~ClickObserver} needs to be added
 * to {@link module:engine/view/view~EditingView} by a {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/clickobserver~ClickObserver
 * @eventName module:engine/view/document~ViewDocument#click
 * @param data Event data.
 */
export type ViewDocumentClickEvent = BubblingEvent<{
	name: 'click';
	args: [ data: ViewDocumentDomEventData<MouseEvent> ];
}>;
