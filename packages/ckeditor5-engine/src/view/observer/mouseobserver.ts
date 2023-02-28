/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/mouseobserver
 */

import DomEventObserver from './domeventobserver';
import type DomEventData from './domeventdata';

/**
 * Mouse events observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~View} by {@link module:engine/view/view~View#addObserver} method.
 */
export default class MouseObserver extends DomEventObserver<'mousedown' | 'mouseup' | 'mouseover' | 'mouseout'> {
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
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @eventName mousedown
 * @param data The event data.
 */
export type ViewDocumentMouseDownEvent = {
	name: 'mousedown';
	args: [ data: DomEventData<MouseEvent> ];
};

/**
 * Fired when the mouse button is released over one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/mouseobserver~MouseObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/mouseobserver~MouseObserver}
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @eventName mouseup
 * @param  data The event data.
 */
export type ViewDocumentMouseUpEvent = {
	name: 'mouseup';
	args: [ data: DomEventData<MouseEvent> ];
};

/**
 * Fired when the mouse is over one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/mouseobserver~MouseObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/mouseobserver~MouseObserver}
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @eventName mouseup
 * @param  data The event data.
 */
export type ViewDocumentMouseOverEvent = {
	name: 'mouseover';
	args: [ data: DomEventData<MouseEvent> ];
};

/**
 * Fired when the mouse is moved out of the one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/mouseobserver~MouseObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/mouseobserver~MouseObserver}
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @eventName mouseup
 * @param  data The event data.
 */
export type ViewDocumentMouseOutEvent = {
	name: 'mouseout';
	args: [ data: DomEventData<MouseEvent> ];
};
