/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/simpleeventemitter
 */

/**
 * @private
 */
export default class SimpleEventEmitter {
	constructor() {
		/**
		 * Simple event emitter listeners
		 *
		 * @private
		 * @type {Object.<String,Array.<Function>>}
		 */
		this._listeners = {};
	}

	/**
	 * Starts listening to the specific event name by registering a callback that will be executed
	 * when the event with the given name will be fired.
	 *
	 * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
	 *
	 * @param {String} eventName
	 * @param {Function} callback
	 */
	on( eventName, callback ) {
		if ( !this._listeners[ eventName ] ) {
			this._listeners[ eventName ] = [];
		}

		this._listeners[ eventName ].push( callback );
	}

	/**
	 * Stops listening to the specified event name by removing the callback.
	 *
	 * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
	 *
	 * @param {String} eventName
	 * @param {Function} callback
	 */
	off( eventName, callback ) {
		if ( !this._listeners[ eventName ] ) {
			return;
		}

		this._listeners[ eventName ] = this._listeners[ eventName ]
			.filter( cb => cb !== callback );
	}

	/**
	 * Fires an event with the given event name and arguments.
	 *
	 * Note that this method differs from the CKEditor 5's default `EventEmitterMixin` implementation.
	 *
	 * @param {String} eventName
	 * @param  {...any} args
	 */
	fire( eventName, ...args ) {
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
