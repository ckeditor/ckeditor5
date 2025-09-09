/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/observer/pointerobserver
 */

import { DomEventObserver } from './domeventobserver.js';
import { type ViewDocumentDomEventData } from './domeventdata.js';

/**
 * Pointer events observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~EditingView} by {@link module:engine/view/view~EditingView#addObserver} method.
 */
export class PointerObserver extends DomEventObserver<'pointerdown' | 'pointerup' | 'pointermove'> {
	/**
	 * @inheritDoc
	 */
	public readonly domEventType = [ 'pointerdown', 'pointerup', 'pointermove' ] as const;

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: PointerEvent ): void {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when a pointer is down on one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/pointerobserver~PointerObserver}.
 *
 * Note that this event is not available by default. To make it available,
 * {@link module:engine/view/observer/pointerobserver~PointerObserver} needs to be added to {@link module:engine/view/view~EditingView}
 * by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/pointerobserver~PointerObserver
 * @eventName module:engine/view/document~ViewDocument#pointerdown
 * @param data The event data.
 */
export type ViewDocumentPointerDownEvent = {
	name: 'pointerdown';
	args: [ data: ViewDocumentDomEventData<PointerEvent> ];
};

/**
 * Fired when a pointer is up on one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/pointerobserver~PointerObserver}.
 *
 * Note that this event is not available by default. To make it available,
 * {@link module:engine/view/observer/pointerobserver~PointerObserver} needs to be added to {@link module:engine/view/view~EditingView}
 * by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/pointerobserver~PointerObserver
 * @eventName module:engine/view/document~ViewDocument#pointerup
 * @param data The event data.
 */
export type ViewDocumentPointerUpEvent = {
	name: 'pointerup';
	args: [ data: ViewDocumentDomEventData<PointerEvent> ];
};

/**
 * Fired when a pointer is moved on one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/pointerobserver~PointerObserver}.
 *
 * Note that this event is not available by default. To make it available,
 * {@link module:engine/view/observer/pointerobserver~PointerObserver} needs to be added to {@link module:engine/view/view~EditingView}
 * by the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * @see module:engine/view/observer/pointerobserver~PointerObserver
 * @eventName module:engine/view/document~ViewDocument#pointermove
 * @param data The event data.
 */
export type ViewDocumentPointerMoveEvent = {
	name: 'pointermove';
	args: [ data: ViewDocumentDomEventData<PointerEvent> ];
};
