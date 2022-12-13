/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/clickobserver
 */

import DomEventObserver from './domeventobserver';
import type DomEventData from './domeventdata';
import type View from '../view';

/**
 * {@link module:engine/view/document~Document#event:click Click} event observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~View view controller}
 * by a {@link module:engine/view/view~View#addObserver} method.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class ClickObserver extends DomEventObserver<'click'> {
	constructor( view: View ) {
		super( view );

		this.domEventType = 'click';
	}

	public onDomEvent( domEvent: MouseEvent ): void {
		this.fire( domEvent.type, domEvent );
	}
}

export type ViewDocumentClickEvent = {
	name: 'click';
	args: [ data: DomEventData<MouseEvent> ];
};

/**
 * Fired when one of the editables has been clicked.
 *
 * Introduced by {@link module:engine/view/observer/clickobserver~ClickObserver}.
 *
 * Note that this event is not available by default. To make it available
 * {@link module:engine/view/observer/clickobserver~ClickObserver} needs to be added
 * to {@link module:engine/view/view~View} by a {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/clickobserver~ClickObserver
 * @event module:engine/view/document~Document#event:click
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
