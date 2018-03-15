/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/keystrokehandler
 */

import DomEmitterMixin from './dom/emittermixin';
import { getCode, parseKeystroke } from './keyboard';

/**
 * Keystroke handler registers keystrokes so the callbacks associated
 * with these keystrokes will be executed if the matching `keydown` is fired
 * by a defined emitter.
 *
 *		const handler = new KeystrokeHandler();
 *
 *		handler.listenTo( emitter );
 *
 *		handler.set( 'Ctrl+A', ( keyEvtData, cancel ) => {
 *			console.log( 'Ctrl+A has been pressed' );
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
		 * @protected
		 * @member {module:utils/dom/emittermixin~Emitter}
		 */
		this._listener = Object.create( DomEmitterMixin );
	}

	/**
	 * Starts listening for `keydown` events from a given emitter.
	 *
	 * @param {module:utils/emittermixin~Emitter} emitter
	 */
	listenTo( emitter ) {
		// The #_listener works here as a kind of dispatcher. It groups the events coming from the same
		// keystroke so the listeners can be attached to them with different priorities.
		//
		// E.g. all the keystrokes with the `keyCode` of 42 coming from the `emitter` are propagated
		// as a `_keydown:42` event by the `_listener`. If there's a callback created by the `set`
		// method for this 42 keystroke, it listens to the `_listener#_keydown:42` event only and interacts
		// only with other listeners of this particular event, thus making it possible to prioritize
		// the listeners and safely cancel execution, when needed. Instead of duplicating the Emitter logic,
		// the KeystrokeHandler re–uses it to do its job.
		this._listener.listenTo( emitter, 'keydown', ( evt, keyEvtData ) => {
			this._listener.fire( '_keydown:' + getCode( keyEvtData ), keyEvtData );
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
	 * @param {Object} [options={}] Additional options.
	 * @param {module:utils/priorities~PriorityString|Number} [options.priority='normal'] The priority of the keystroke
	 * callback. The higher the priority value the sooner the callback will be executed. Keystrokes having the same priority
	 * are called in the order they were added.
	 */
	set( keystroke, callback, options = {} ) {
		const keyCode = parseKeystroke( keystroke );
		const priority = options.priority;

		// Execute the passed callback on KeystrokeHandler#_keydown.
		// TODO: https://github.com/ckeditor/ckeditor5-utils/issues/144
		this._listener.listenTo( this._listener, '_keydown:' + keyCode, ( evt, keyEvtData ) => {
			callback( keyEvtData, () => {
				// Stop the event in the DOM: no listener in the web page
				// will be triggered by this event.
				keyEvtData.preventDefault();
				keyEvtData.stopPropagation();

				// Stop the event in the KeystrokeHandler: no more callbacks
				// will be executed for this keystroke.
				evt.stop();
			} );

			// Mark this keystroke as handled by the callback. See: #press.
			evt.return = true;
		}, { priority } );
	}

	/**
	 * Triggers a keystroke handler for a specified key combination, if such a keystroke was {@link #set defined}.
	 *
	 * @param {module:engine/view/observer/keyobserver~KeyEventData} keyEvtData Key event data.
	 * @returns {Boolean} Whether the keystroke was handled.
	 */
	press( keyEvtData ) {
		return !!this._listener.fire( '_keydown:' + getCode( keyEvtData ), keyEvtData );
	}

	/**
	 * Destroys the keystroke handler.
	 */
	destroy() {
		this._listener.stopListening();
	}
}
