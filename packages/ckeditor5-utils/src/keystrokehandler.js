/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/keystrokehandler
 */

import DomEmitterMixin from '../src/dom/emittermixin';
import { getCode, parseKeystroke } from '../src/keyboard';

/**
 * Keystroke handler registers keystrokes so the callbacks associated
 * with these keystrokes will be executed if the matching `keydown` is fired
 * by a defined emitter.
 *
 *		const handler = new KeystrokeHandler();
 *
 *		handler.listenTo( emitter );
 *
 *		handler.set( 'ctrl + a', ( keyEventData, cancel ) => {
 *			console.log( 'ctrl + a has been pressed' );
 *			cancel();
 *		} );
 */
export default class KeystrokeHandler {
	/**
	 * Creates an instance of the keystroke handler.
	 */
	constructor() {
		/**
		 * Listener used to listen to events for easier keystroke handler destruction.
		 *
		 * @private
		 * @member {module:utils/dom/emittermixin~Emitter}
		 */
		this._listener = Object.create( DomEmitterMixin );

		/**
		 * Map of the defined keystrokes. Keystroke codes are the keys.
		 *
		 * @private
		 * @member {Map}
		 */
		this._keystrokes = new Map();
	}

	/**
	 * Starts listening for `keydown` events from a given emitter.
	 *
	 * @param {module:utils/emittermixin~Emitter} emitter
	 */
	listenTo( emitter ) {
		this._listener.listenTo( emitter, 'keydown', ( evt, data ) => {
			this.press( data );
		} );
	}

	/**
	 * Registers a handler for the specified keystroke.
	 *
	 * @param {String|Array.<String|Number>} keystroke Keystroke defined in a format accepted by
	 * the {@link module:utils/keyboard~parseKeystroke} function.
	 * @param {Function} callback A function called with the
	 * {@link module:engine/view/observer/keyobserver~KeyEventData key event data} object and
	 * a helper to both `preventDefault` and `stopPropagation` of the event.
	 */
	set( keystroke, callback ) {
		const keyCode = parseKeystroke( keystroke );
		const callbacks = this._keystrokes.get( keyCode );

		if ( callbacks ) {
			callbacks.push( callback );
		} else {
			this._keystrokes.set( keyCode, [ callback ] );
		}
	}

	/**
	 * Triggers a keystroke handler for a specified key combination, if such a keystroke was {@link #set defined}.
	 *
	 * @param {module:engine/view/observer/keyobserver~KeyEventData} keyEventData Key event data.
	 * @returns {Boolean} Whether the keystroke was handled.
	 */
	press( keyEventData ) {
		const keyCode = getCode( keyEventData );
		const callbacks = this._keystrokes.get( keyCode );

		if ( !callbacks ) {
			return false;
		}

		for ( let callback of callbacks ) {
			callback( keyEventData, () => {
				keyEventData.preventDefault();
				keyEventData.stopPropagation();
			} );
		}

		return true;
	}

	/**
	 * Destroys the keystroke handler.
	 */
	destroy() {
		this._keystrokes = new Map();
		this._listener.stopListening();
	}
}
