/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/observer/mouseobserver
 */

import { DomEventObserver } from './domeventobserver.js';
import { type ViewDocumentDomEventData } from './domeventdata.js';

/**
 * Mouse events observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~EditingView} by {@link module:engine/view/view~EditingView#addObserver} method.
 */
export class MouseObserver extends DomEventObserver<'mousedown' | 'mouseup' | 'mouseover' | 'mouseout'> {
	/**
	 * @inheritDoc
	 */
	public readonly domEventType = [ 'mousedown', 'mouseup', 'mouseover', 'mouseout' ] as const;

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: MouseEvent ): void {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when the mouse button is pressed down on one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/mouseobserver~MouseObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/mouseobserver~MouseObserver}
 * needs to be added to {@link module:engine/view/view~EditingView} by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @eventName module:engine/view/document~ViewDocument#mousedown
 * @param data The event data.
 */
export type ViewDocumentMouseDownEvent = {
	name: 'mousedown';
	args: [ data: ViewDocumentDomEventData<MouseEvent> ];
};

/**
 * Fired when the mouse button is released over one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/mouseobserver~MouseObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/mouseobserver~MouseObserver}
 * needs to be added to {@link module:engine/view/view~EditingView} by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @eventName module:engine/view/document~ViewDocument#mouseup
 * @param  data The event data.
 */
export type ViewDocumentMouseUpEvent = {
	name: 'mouseup';
	args: [ data: ViewDocumentDomEventData<MouseEvent> ];
};

/**
 * Fired when the mouse is over one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/mouseobserver~MouseObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/mouseobserver~MouseObserver}
 * needs to be added to {@link module:engine/view/view~EditingView} by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @eventName module:engine/view/document~ViewDocument#mouseover
 * @param  data The event data.
 */
export type ViewDocumentMouseOverEvent = {
	name: 'mouseover';
	args: [ data: ViewDocumentDomEventData<MouseEvent> ];
};

/**
 * Fired when the mouse is moved out of the one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/mouseobserver~MouseObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/mouseobserver~MouseObserver}
 * needs to be added to {@link module:engine/view/view~EditingView} by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @eventName module:engine/view/document~ViewDocument#mouseout
 * @param  data The event data.
 */
export type ViewDocumentMouseOutEvent = {
	name: 'mouseout';
	args: [ data: ViewDocumentDomEventData<MouseEvent> ];
};
