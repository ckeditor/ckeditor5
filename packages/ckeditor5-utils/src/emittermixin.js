/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EventInfo from './eventinfo.js';
import utils from './utils.js';

// Saves how many callbacks has been already added. Does not decrement when callback is removed.
// Used internally as a unique id for a callback.
let eventsCounter = 0;

/**
 * Mixin that injects the events API into its host.
 *
 * @mixin utils.EmitterMixin
 * @implements utils.Emitter
 */
const EmitterMixin = {
	/**
	 * Registers a callback function to be executed when an event is fired. Events can be grouped in namespaces using `:`.
	 * When namespaced event is fired, it additionaly fires all callbacks for that namespace.
	 *
	 *		myEmitter.on( 'myGroup', genericCallback );
	 *		myEmitter.on( 'myGroup:myEvent', specificCallback );
	 *		myEmitter.fire( 'myGroup' ); // genericCallback is fired.
	 *		myEmitter.fire( 'myGroup:myEvent' ); // both genericCallback and specificCallback are fired.
	 *		myEmitter.fire( 'myGroup:foo' ); // genericCallback is fired even though there are no callbacks for "foo".
	 *
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to be called on event.
	 * @param {Object} [ctx] The object that represents `this` in the callback. Defaults to the object firing the
	 * event.
	 * @param {Number} [priority=10] The priority of this callback in relation to other callbacks to that same event.
	 * Lower values are called first.
	 * @method utils.EmitterMixin#on
	 */
	on( event, callback, ctx, priority ) {
		createEventNamespace( this, event );
		const lists = getCallbacksListsForNamespace( this, event );

		// Set the priority defaults.
		if ( typeof priority != 'number' ) {
			priority = 10;
		}

		callback = {
			callback: callback,
			ctx: ctx || this,
			priority: priority
		};

		// Add the callback to all callbacks list.
		for ( let callbacks of lists ) {
			// Save counter value as unique id.
			callback.counter = ++eventsCounter;

			// Add the callback to the list in the right priority position.
			let added = false;

			for ( let i = callbacks.length - 1; i >= 0; i-- ) {
				if ( callbacks[ i ].priority <= priority ) {
					callbacks.splice( i + 1, 0, callback );
					added = true;

					break;
				}
			}

			// Add to the beginning if right place was not found.
			if ( !added ) {
				callbacks.unshift( callback );
			}
		}
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
	 * @method utils.EmitterMixin#once
	 */
	once( event, callback, ctx, priority ) {
		const onceCallback = function( event ) {
			// Go off() at the first call.
			event.off();

			// Go with the original callback.
			callback.apply( this, arguments );
		};

		// Make a similar on() call, simply replacing the callback.
		this.on( event, onceCallback, ctx, priority );
	},

	/**
	 * Stops executing the callback on the given event.
	 *
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to stop being called.
	 * @param {Object} [ctx] The context object to be removed, pared with the given callback. To handle cases where
	 * the same callback is used several times with different contexts.
	 * @method utils.EmitterMixin#off
	 */
	off( event, callback, ctx ) {
		const lists = getCallbacksListsForNamespace( this, event );

		for ( let callbacks of lists ) {
			for ( let i = 0; i < callbacks.length; i++ ) {
				if ( callbacks[ i ].callback == callback ) {
					if ( !ctx || ctx == callbacks[ i ].ctx ) {
						// Remove the callback from the list (fixing the next index).
						callbacks.splice( i, 1 );
						i--;
					}
				}
			}
		}
	},

	/**
	 * Registers a callback function to be executed when an event is fired in a specific (emitter) object.
	 *
	 * @param {utils.Emitter} emitter The object that fires the event.
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to be called on event.
	 * @param {Object} [ctx] The object that represents `this` in the callback. Defaults to `emitter`.
	 * @param {Number} [priority=10] The priority of this callback in relation to other callbacks to that same event.
	 * Lower values are called first.
	 * @method utils.EmitterMixin#listenTo
	 */
	listenTo( emitter, event, callback, ctx, priority ) {
		let emitters, emitterId, emitterInfo, eventCallbacks;

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
	 * @param {utils.Emitter} [emitter] The object to stop listening to. If omitted, stops it for all objects.
	 * @param {String} [event] (Requires the `emitter`) The name of the event to stop listening to. If omitted, stops it
	 * for all events from `emitter`.
	 * @param {Function} [callback] (Requires the `event`) The function to be removed from the call list for the given
	 * `event`.
	 * @method utils.EmitterMixin#stopListening
	 */
	stopListening( emitter, event, callback ) {
		let emitters = this._listeningTo;
		let emitterId = emitter && emitter._emitterId;
		let emitterInfo = emitters && emitterId && emitters[ emitterId ];
		let eventCallbacks = emitterInfo && event && emitterInfo.callbacks[ event ];

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
	 * @method utils.EmitterMixin#fire
	 */
	fire( event, args ) {
		const callbacks = getCallbacksForEvent( this, event );

		if ( !callbacks ) {
			return;
		}

		let eventInfo = new EventInfo( this, event );

		// Take the list of arguments to pass to the callbacks.
		args = Array.prototype.slice.call( arguments, 1 );
		args.unshift( eventInfo );

		// Save how many callbacks were added at the moment when the event has been fired.
		const counter = eventsCounter;

		for ( let i = 0; i < callbacks.length; i++ ) {
			// Filter out callbacks that have been added after event has been fired.
			if ( callbacks[ i ].counter > counter ) {
				continue;
			}

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

export default EmitterMixin;

// Gets the internal `_events` property of the given object.
// `_events` property store all lists with callbacks for registered event names.
// If there were no events registered on the object, empty `_events` object is created.
function getEvents( source ) {
	if ( !source._events ) {
		Object.defineProperty( source, '_events', {
			value: {}
		} );
	}

	return source._events;
}

// Creates event node for generic-specific events relation architecture.
function makeEventNode() {
	return {
		callbacks: [],
		childEvents: []
	};
}

// Creates an architecture for generic-specific events relation.
// If needed, creates all events for given eventName, i.e. if the first registered event
// is foo:bar:abc, it will create foo:bar:abc, foo:bar and foo event and tie them together.
// It also copies callbacks from more generic events to more specific events when
// specific events are created.
function createEventNamespace( source, eventName ) {
	const events = getEvents( source );

	// First, check if the event we want to add to the structure already exists.
	if ( events[ eventName ] ) {
		// If it exists, we don't have to do anything.
		return;
	}

	// In other case, we have to create the structure for the event.
	// Note, that we might need to create intermediate events too.
	// I.e. if foo:bar:abc is being registered and we only have foo in the structure,
	// we need to also register foo:bar.

	// Currently processed event name.
	let name = eventName;
	// Name of the event that is a child event for currently processed event.
	let childEventName = null;

	// Array containing all newly created specific events.
	const newEventNodes = [];

	// While loop can't check for ':' index because we have to handle generic events too.
	// In each loop, we truncate event name, going from the most specific name to the generic one.
	// I.e. foo:bar:abc -> foo:bar -> foo.
	while ( name !== '' ) {
		if ( events[ name ] ) {
			// If the currently processed event name is already registered, we can be sure
			// that it already has all the structure created, so we can break the loop here
			// as no more events need to be registered.
			break;
		}

		// If this event is not yet registered, create a new object for it.
		events[ name ] = makeEventNode();
		// Add it to the array with newly created events.
		newEventNodes.push( events[ name ] );

		// Add previously processed event name as a child of this event.
		if ( childEventName ) {
			events[ name ].childEvents.push( childEventName );
		}

		childEventName = name;
		// If `.lastIndexOf()` returns -1, `.substr()` will return '' which will break the loop.
		name = name.substr( 0, name.lastIndexOf( ':' ) );
	}

	if ( name !== '' ) {
		// If name is not empty, we found an already registered event that was a parent of the
		// event we wanted to register.

		// Copy that event's callbacks to newly registered events.
		for ( let node of newEventNodes ) {
			node.callbacks = events[ name ].callbacks.slice();
		}

		// Add last newly created event to the already registered event.
		events[ name ].childEvents.push( childEventName );
	}
}

// Gets an array containing callbacks list for a given event and it's more specific events.
// I.e. if given event is foo:bar and there is also foo:bar:abc event registered, this will
// return callback list of foo:bar and foo:bar:abc (but not foo).
// Returns empty array if given event has not been yet registered.
function getCallbacksListsForNamespace( source, eventName ) {
	const eventNode = getEvents( source )[ eventName ];

	if ( !eventNode ) {
		return [];
	}

	let callbacksLists = [ eventNode.callbacks ];

	for ( let i = 0; i < eventNode.childEvents.length; i++ ) {
		let childCallbacksLists = getCallbacksListsForNamespace( source, eventNode.childEvents[ i ] );

		callbacksLists = callbacksLists.concat( childCallbacksLists );
	}

	return callbacksLists;
}

// Get the list of callbacks for a given event, but only if there any callbacks have been registered.
// If there are no callbacks registered for given event, it checks if this is a specific event and looks
// for callbacks for it's more generic version.
function getCallbacksForEvent( source, eventName ) {
	let event;

	if ( !source._events || !( event = source._events[ eventName ] ) || !event.callbacks.length ) {
		// There are no callbacks registered for specified eventName.
		// But this could be a specific-type event that is in a namespace.
		if ( eventName.indexOf( ':' ) > -1 ) {
			// If the eventName is specific, try to find callback lists for more generic event.
			return getCallbacksForEvent( source, eventName.substr( 0, eventName.lastIndexOf( ':' ) ) );
		} else {
			// If this is a top-level generic event, return null;
			return null;
		}
	}

	return event.callbacks;
}

/**
 * Interface representing classes which mix in {@link utils.EmitterMixin}.
 *
 * @interface utils.Emitter
 */
