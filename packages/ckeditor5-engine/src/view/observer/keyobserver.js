/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/observer/keyobserver
 */

import DomEventObserver from './domeventobserver.js';
import { getCode } from '../../../utils/keyboard.js';

/**
 * {@link module:engine/view/document~Document#keydown Key down} event observer.
 *
 * Note that this observer is attached by the {@link module:engine/view/document~Document} and is available by default.
 *
 * @extends module:engine/view/observer/observer~Observer.DomEventObserver
 */
export default class KeyObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = 'keydown';
	}

	onDomEvent( domEvt ) {
		this.fire( 'keydown', domEvt, {
			keyCode: domEvt.keyCode,

			altKey: domEvt.altKey,
			ctrlKey: domEvt.ctrlKey || domEvt.metaKey,
			shiftKey: domEvt.shiftKey,

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
 * Note that because {@link module:engine/view/observer/keyobserver~KeyObserver} is attached by the {@link
 * module:engine/view/document~Document}
 * this event is available by default.
 *
 * @see module:engine/view/observer/keyobserver~KeyObserver
 * @event module:engine/view/document~Document#keydown
 * @param {module:engine/view/observer/keyobserver~KeyObserver.KeyEventData} keyEventData
 */

/**
 * The value of the {@link module:engine/view/document~Document#keydown} event.
 *
 * @class module:engine/view/observer/keyobserver~KeyObserver.KeyEventData
 * @extends module:engine/view/observer/domeventdata~DomEventData
 * @implements utils.keyboard.KeystrokeData
 */

/**
 * Code of the whole keystroke. See {@link utils.keyboard.getCode}.
 *
 * @readonly
 * @member {Number} module:engine/view/observer/keyobserver~KeyObserver.KeyEventData#keystroke
 */
