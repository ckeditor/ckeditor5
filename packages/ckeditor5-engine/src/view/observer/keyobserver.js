/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/keyobserver
 */

import DomEventObserver from './domeventobserver';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * Observer for events connected with pressing keyboard keys.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class KeyObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.domEventType = [ 'keydown', 'keyup' ];
	}

	onDomEvent( domEvt ) {
		this.fire( domEvt.type, domEvt, {
			keyCode: domEvt.keyCode,

			altKey: domEvt.altKey,
			ctrlKey: domEvt.ctrlKey,
			shiftKey: domEvt.shiftKey,
			metaKey: domEvt.metaKey,

			get keystroke() {
				return getCode( this );
			}
		} );
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
