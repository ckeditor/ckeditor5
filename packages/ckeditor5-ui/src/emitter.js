/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Mixin that injects the events API into its host.
 *
 * @class Emitter
 * @singleton
 */

CKEDITOR.define( [ 'eventinfo', 'utils' ], function( EventInfo, utils ) {
	var EmmitterMixin = {
		/**
		 * Registers a callback function to be executed when an event is fired.
		 *
		 * @param {String} event The name of the event.
		 * @param {Function} callback The function to be called on event.
		 * @param {Object} [ctx] The object that represents `this` in the callback. Defaults to the object firing the
		 * event.
		 * @param {Number} [priority=10] The priority of this callback in relation to other callbacks to that same event.
		 * Lower values are called first.
		 */
		on: function( event, callback, ctx, priority ) {
			var callbacks = getCallbacks( this, event );

			// Set the priority defaults.
			if ( typeof priority != 'number' ) {
				priority = 10;
			}

			callback = {
				callback: callback,
				ctx: ctx || this,
				priority: priority
			};

			// Add the callback to the list in the right priority position.
			for ( var i = callbacks.length - 1; i >= 0; i-- ) {
				if ( callbacks[ i ].priority <= priority ) {
					callbacks.splice( i + 1, 0, callback );

					return;
				}
			}

			callbacks.unshift( callback );
		},

		/**
		 * Registers a callback function to be executed on the next time the event is fired only. This is similar to
		 * calling {@link #on} followed by {@link #off} in the callback.
		 *
		 * @param {String} event The name of the event.
		 * @param {Function} callback The function to be called on event.
		 * @param {Object} [ctx] The object that represents `this` in the callback. Defaults to the object firing the
		 * event.
		 * @param {Number} [priority=10] The priority of this callback in relation to other callbacks to that same event.
		 * Lower values are called first.
		 */
		once: function( event, callback, ctx, priority ) {
			var onceCallback = function( event ) {
				// Go off() at the first call.
				event.off();

				// Go with the original callback.
				callback.apply( this, arguments );
			};

			// Make the a similar on() call, simply replacing the callback.
			this.on( event, onceCallback, ctx, priority );
		},

		/**
		 * Stops executing the callback on the given event.
		 *
		 * @param {String} event The name of the event.
		 * @param {Function} callback The function to stop being called.
		 * @param {Object} [ctx] The context object to be removed, pared with the given callback. To handle cases where
		 * the same callback is used several times with different contexts.
		 */
		off: function( event, callback, ctx ) {
			var callbacks = getCallbacksIfAny( this, event );

			if ( !callbacks ) {
				return;
			}

			for ( var i = 0; i < callbacks.length; i++ ) {
				if ( callbacks[ i ].callback == callback ) {
					if ( !ctx || ctx == callbacks[ i ].ctx ) {
						// Remove the callback from the list (fixing the next index).
						callbacks.splice( i, 1 );
						i--;
					}
				}
			}
		},

		/**
		 * Registers a callback function to be executed when an event is fired in a specific (emitter) object.
		 *
		 * @param {Emitter} emitter The object that fires the event.
		 * @param {String} event The name of the event.
		 * @param {Function} callback The function to be called on event.
		 * @param {Object} [ctx] The object that represents `this` in the callback. Defaults to `emitter`.
		 * @param {Number} [priority=10] The priority of this callback in relation to other callbacks to that same event.
		 * Lower values are called first.
		 */
		listenTo: function( emitter, event, callback, ctx, priority ) {
			var emitters, emitterId, emitterInfo, eventCallbacks;

			// _listeningTo contains a list of emitters that this object is listening to.
			// This list has the following format:
			//
			// _listeningTo: {
			//     emitterId: {
			//         emitter: emitter,
			//         callbacks: {
			//             event1: [ callback1, callback2, ... ]
			//             ....
			//         }
			//     },
			//     ...
			// }

			if ( !( emitters = this._listeningTo ) ) {
				emitters = this._listeningTo = {};
			}

			if ( !( emitterId = emitter._emitterId ) ) {
				emitterId = emitter._emitterId = utils.uid();
			}

			if ( !( emitterInfo = emitters[ emitterId ] ) ) {
				emitterInfo = emitters[ emitterId ] = {
					emitter: emitter,
					callbacks: {}
				};
			}

			if ( !( eventCallbacks = emitterInfo.callbacks[ event ] ) ) {
				eventCallbacks = emitterInfo.callbacks[ event ] = [];
			}

			eventCallbacks.push( callback );

			// Finally register the callback to the event.
			emitter.on( event, callback, ctx, priority );
		},

		/**
		 * Stops listening for events. It can be used at different levels:
		 *
		 * * To stop listening to a specific callback.
		 * * To stop listening to a specific event.
		 * * To stop listening to all events fired by a specific object.
		 * * To stop listening to all events fired by all object.
		 *
		 * @param {Emitter} [emitter] The object to stop listening to. If omitted, stops it for all objects.
		 * @param {String} [event] (Requires the `emitter`) The name of the event to stop listening to. If omitted, stops it
		 * for all events from `emitter`.
		 * @param {Function} [callback] (Requires the `event`) The function to be removed from the call list for the given
		 * `event`.
		 */
		stopListening: function( emitter, event, callback ) {
			var emitters = this._listeningTo;
			var emitterId = emitter && emitter._emitterId;
			var emitterInfo = emitters && emitterId && emitters[ emitterId ];
			var eventCallbacks = emitterInfo && event && emitterInfo.callbacks[ event ];

			// Stop if nothing has been listened.
			if ( !emitters || ( emitter && !emitterInfo ) || ( event && !eventCallbacks ) ) {
				return;
			}

			// All params provided. off() that single callback.
			if ( callback ) {
				emitter.off( event, callback );
			}
			// Only `emitter` and `event` provided. off() all callbacks for that event.
			else if ( eventCallbacks ) {
				while ( ( callback = eventCallbacks.pop() ) ) {
					emitter.off( event, callback );
				}
				delete emitterInfo.callbacks[ event ];
			}
			// Only `emitter` provided. off() all events for that emitter.
			else if ( emitterInfo ) {
				for ( event in emitterInfo.callbacks ) {
					this.stopListening( emitter, event );
				}
				delete emitters[ emitterId ];
			}
			// No params provided. off() all emitters.
			else {
				for ( emitterId in emitters ) {
					this.stopListening( emitters[ emitterId ].emitter );
				}
				delete this._listeningTo;
			}
		},

		/**
		 * Fires an event, executing all callbacks registered for it.
		 *
		 * The first parameter passed to callbacks is an {@link EventInfo} object, followed by the optional `args` provided in
		 * the `fire()` method call.
		 *
		 * @param {String} event The name of the event.
		 * @param {...*} [args] Additional arguments to be passed to the callbacks.
		 */
		fire: function( event, args ) {
			var eventInfo = event instanceof EventInfo && event;
			var eventName = eventInfo ? eventInfo.name : event;
			var callbacks = getCallbacksIfAny( this, eventName );

			if ( !callbacks ) {
				return;
			}

			if ( !eventInfo ) {
				eventInfo = new EventInfo( this, eventName );
			}

			// Take the list of arguments to pass to the callbacks.
			args = Array.prototype.slice.call( arguments, 1 );
			args.unshift( eventInfo );

			for ( var i = 0; i < callbacks.length; i++ ) {
				callbacks[ i ].callback.apply( callbacks[ i ].ctx, args );

				// Remove the callback from future requests if off() has been called.
				if ( eventInfo.off.called ) {
					// Remove the called mark for the next calls.
					delete eventInfo.off.called;

					// Remove the callback from the list (fixing the next index).
					callbacks.splice( i, 1 );
					i--;
				}

				// Do not execute next callbacks if stop() was called.
				if ( eventInfo.stop.called ) {
					break;
				}
			}
		}
	};

	return EmmitterMixin;

	// Gets the internal events hash of a give object.
	function getEvents( source ) {
		if ( !source._events ) {
			Object.defineProperty( source, '_events', {
				value: {}
			} );
		}

		return source._events;
	}

	// Gets the list of callbacks for a given event.
	function getCallbacks( source, eventName ) {
		var events = getEvents( source );

		if ( !events[ eventName ] ) {
			events[ eventName ] = [];
		}

		return events[ eventName ];
	}

	// Get the list of callbacks for a given event only if there is any available.
	function getCallbacksIfAny( source, event ) {
		var callbacks;

		if ( !source._events || !( callbacks = source._events[ event ] ) || !callbacks.length ) {
			return null;
		}

		return callbacks;
	}
} );
