/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/observer/keyobserver
 */

import { DomEventObserver } from './domeventobserver.js';
import { type ViewDocumentDomEventData } from './domeventdata.js';
import { getCode, type KeystrokeInfo } from '@ckeditor/ckeditor5-utils';

/**
 * Observer for events connected with pressing keyboard keys.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 */
export class KeyObserver extends DomEventObserver<'keydown' | 'keyup', KeystrokeInfo & { keystroke: number }> {
	/**
	 * @inheritDoc
	 */
	public readonly domEventType = [ 'keydown', 'keyup' ] as const;

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvt: KeyboardEvent ): void {
		const data = {
			keyCode: domEvt.keyCode,

			altKey: domEvt.altKey,
			ctrlKey: domEvt.ctrlKey,
			shiftKey: domEvt.shiftKey,
			metaKey: domEvt.metaKey,

			get keystroke() {
				return getCode( this );
			}
		};

		this.fire( domEvt.type, domEvt, data );
	}
}

/**
 * Fired when a key has been pressed.
 *
 * Introduced by {@link module:engine/view/observer/keyobserver~KeyObserver}.
 *
 * Note that because {@link module:engine/view/observer/keyobserver~KeyObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/keyobserver~KeyObserver
 * @eventName module:engine/view/document~ViewDocument#keydown
 */
export type ViewDocumentKeyDownEvent = {
	name: 'keydown';
	args: [ data: ViewDocumentKeyEventData ];
};

/**
 * Fired when a key has been released.
 *
 * Introduced by {@link module:engine/view/observer/keyobserver~KeyObserver}.
 *
 * Note that because {@link module:engine/view/observer/keyobserver~KeyObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/keyobserver~KeyObserver
 * @eventName module:engine/view/document~ViewDocument#keyup
 */
export type ViewDocumentKeyUpEvent = {
	name: 'keyup';
	args: [ data: ViewDocumentKeyEventData ];
};

/**
 * The value of both events - {@link ~ViewDocumentKeyDownEvent} and {@link ~ViewDocumentKeyUpEvent}.
 */
export interface ViewDocumentKeyEventData extends ViewDocumentDomEventData<KeyboardEvent>, KeystrokeInfo {

	/**
	 * Code of the whole keystroke. See {@link module:utils/keyboard~getCode}.
	 */
	keystroke: number;
}
