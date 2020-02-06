/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/simpleeventemitter
 */

/**
 * A private class that mimics the {@link module:utils/emittermixin~EmitterMixin} and partially implements
 * the {@link module:utils/emittermixin~Emitter} interface. Though, there are huge differences between both APIs
 * as `SimpleEventEmitter` implements only the `on()`, `off()` and `_fire()` methods, and does not provide others.
 * It also passes `null` as the first argument to event listeners instead of the `EventSource` instance.
 *
 * @private
 */
export default class SimpleEventEmitter {
	constructor() {
		/**
		 * A dictionary of event emitter listeners.
		 *
		 * @private
		 * @type {Object.<String,Array.<Function>>}
		 */
		this._listeners = {};
	}

	/**
	 * Starts listening to the specific event name by registering a callback that will be executed
	 * whenever an event with given name fires.
	 *
	 * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
	 *
	 * @param {String} eventName  Event name.
	 * @param {Function} callback A callback which will be added to event listeners.
	 */
	on( eventName, callback ) {
		if ( !this._listeners[ eventName ] ) {
			this._listeners[ eventName ] = [];
		}

		this._listeners[ eventName ].push( callback );
	}

	/**
	 * Stops listening to the specified event name by removing the callback from event listeners.
	 *
	 * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
	 *
	 * @param {String} eventName Event name.
	 * @param {Function} callback A callback which will be removed from event listeners.
	 */
	off( eventName, callback ) {
		this._listeners[ eventName ] = this._listeners[ eventName ]
			.filter( cb => cb !== callback );
	}

	/**
	 * Fires an event with given event name and arguments.
	 *
	 * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
	 *
	 * @protected
	 * @param {String} eventName Event name.
	 * @param  {...any} args Event arguments.
	 */
	_fire( eventName, ...args ) {
		const callbacks = this._listeners[ eventName ] || [];

		for ( const callback of callbacks ) {
			callback.apply( this, [ null, ...args ] );
		}
	}

	/**
	 * Destroys all listeners and releases the resources associated to this instance.
	 */
	destroy() {
		this._listeners = {};
	}
}
