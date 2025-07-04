/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/observer/touchobserver
 */

import { DomEventObserver } from './domeventobserver.js';
import { type ViewDocumentDomEventData } from './domeventdata.js';

/**
 * Touch events observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~EditingView} by {@link module:engine/view/view~EditingView#addObserver} method.
 */
export class TouchObserver extends DomEventObserver<'touchstart' | 'touchend' | 'touchmove'> {
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
 * needs to be added to {@link module:engine/view/view~EditingView} by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/touchobserver~TouchObserver
 * @eventName module:engine/view/document~ViewDocument#touchstart
 * @param data The event data.
 */
export type ViewDocumentTouchStartEvent = {
	name: 'touchstart';
	args: [ data: ViewDocumentDomEventData<TouchEvent> ];
};

/**
 * Fired when a touch ends on one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/touchobserver~TouchObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/touchobserver~TouchObserver}
 * needs to be added to {@link module:engine/view/view~EditingView} by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/touchobserver~TouchObserver
 * @eventName module:engine/view/document~ViewDocument#touchend
 * @param data The event data.
 */
export type ViewDocumentTouchEndEvent = {
	name: 'touchend';
	args: [ data: ViewDocumentDomEventData<TouchEvent> ];
};

/**
 * Fired when a touch is moved on one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/touchobserver~TouchObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/touchobserver~TouchObserver}
 * needs to be added to {@link module:engine/view/view~EditingView} by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/touchobserver~TouchObserver
 * @eventName module:engine/view/document~ViewDocument#touchmove
 * @param data The event data.
 */
export type ViewDocumentTouchMoveEvent = {
	name: 'touchmove';
	args: [ data: ViewDocumentDomEventData<TouchEvent> ];
};
