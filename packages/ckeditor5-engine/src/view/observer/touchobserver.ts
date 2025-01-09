/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/observer/touchobserver
 */

import DomEventObserver from './domeventobserver.js';
import type DomEventData from './domeventdata.js';

/**
 * Touch events observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~View} by {@link module:engine/view/view~View#addObserver} method.
 */
export default class TouchObserver extends DomEventObserver<'touchstart' | 'touchend' | 'touchmove'> {
	/**
	 * @inheritDoc
	 */
	public readonly domEventType = [ 'touchstart', 'touchend', 'touchmove' ] as const;

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: TouchEvent ): void {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when a touch is started on one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/touchobserver~TouchObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/touchobserver~TouchObserver}
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/touchobserver~TouchObserver
 * @eventName module:engine/view/document~Document#touchstart
 * @param data The event data.
 */
export type ViewDocumentTouchStartEvent = {
	name: 'touchstart';
	args: [ data: DomEventData<TouchEvent> ];
};

/**
 * Fired when a touch ends on one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/touchobserver~TouchObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/touchobserver~TouchObserver}
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/touchobserver~TouchObserver
 * @eventName module:engine/view/document~Document#touchend
 * @param data The event data.
 */
export type ViewDocumentTouchEndEvent = {
	name: 'touchend';
	args: [ data: DomEventData<TouchEvent> ];
};

/**
 * Fired when a touch is moved on one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/touchobserver~TouchObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/touchobserver~TouchObserver}
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/touchobserver~TouchObserver
 * @eventName module:engine/view/document~Document#touchmove
 * @param data The event data.
 */
export type ViewDocumentTouchMoveEvent = {
	name: 'touchmove';
	args: [ data: DomEventData<TouchEvent> ];
};
