/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/keyobserver
 */

import DomEventObserver from './domeventobserver';
import type View from '../view';
import type DomEventData from './domeventdata';
import { getCode, type KeystrokeInfo } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * Observer for events connected with pressing keyboard keys.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class KeyObserver extends DomEventObserver<'keydown' | 'keyup', KeystrokeInfo & { keystroke: number }> {
	constructor( view: View ) {
		super( view );

		this.domEventType = [ 'keydown', 'keyup' ];
	}

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

export type ViewDocumentKeyEvent = {
	name: 'keydown' | 'keyup';
	args: [ data: DomEventData<KeyboardEvent> & KeystrokeInfo & { keystroke: number } ];
};

/**
 * Fired when a key has been pressed.
 *
 * Introduced by {@link module:engine/view/observer/keyobserver~KeyObserver}.
 *
 * Note that because {@link module:engine/view/observer/keyobserver~KeyObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/keyobserver~KeyObserver
 * @event module:engine/view/document~Document#event:keydown
 * @param {module:engine/view/observer/keyobserver~KeyEventData} keyEventData
 */

/**
 * Fired when a key has been released.
 *
 * Introduced by {@link module:engine/view/observer/keyobserver~KeyObserver}.
 *
 * Note that because {@link module:engine/view/observer/keyobserver~KeyObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/keyobserver~KeyObserver
 * @event module:engine/view/document~Document#event:keyup
 * @param {module:engine/view/observer/keyobserver~KeyEventData} keyEventData
 */

/**
 * The value of both events - {@link module:engine/view/document~Document#event:keydown} and
 * {@link module:engine/view/document~Document#event:keyup}.
 *
 * @class module:engine/view/observer/keyobserver~KeyEventData
 * @extends module:engine/view/observer/domeventdata~DomEventData
 * @implements module:utils/keyboard~KeystrokeInfo
 */

/**
 * Code of the whole keystroke. See {@link module:utils/keyboard~getCode}.
 *
 * @readonly
 * @member {Number} module:engine/view/observer/keyobserver~KeyEventData#keystroke
 */
