/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/dom/emittermixin
 */

import { default as EmitterMixin, _getEmitterListenedTo, _setEmitterId } from '../emittermixin';
import uid from '../uid';
import extend from '../lib/lodash/extend';
import isNative from '../lib/lodash/isNative';

/**
 * Mixin that injects the DOM events API into its host. It provides the API
 * compatible with {@link module:utils/emittermixin~EmitterMixin}.
 *
 * DOM emitter mixin is by default available in the {@link module:ui/view~View} class,
 * but it can also be mixed into any other class:
 *
 *		import mix from '../utils/mix.js';
 *		import DomEmitterMixin from '../utils/dom/emittermixin.js';
 *
 *		class SomeView {}
 *		mix( SomeView, DomEmitterMixin );
 *
 *		const view = new SomeView();
 *		view.listenTo( domElement, ( evt, domEvt ) => {
 *			console.log( evt, domEvt );
 *		} );
 *
 * @mixin module:utils/dom/emittermixin~EmitterMixin
 * @mixes module:utils/emittermixin~EmitterMixin
 * @implements module:utils/dom/emittermixin~Emitter
 */
const DomEmitterMixin = extend( {}, EmitterMixin, {
	/**
	 * Registers a callback function to be executed when an event is fired in a specific Emitter or DOM Node.
	 * It is backwards compatible with {@link module:utils/emittermixin~EmitterMixin#listenTo}.
	 *
	 * @param {module:utils/emittermixin~Emitter|Node} emitter The object that fires the event.
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to be called on event.
	 * @param {Object} [options={}] Additional options.
	 * @param {module:utils/priorities~PriorityString|Number} [options.priority='normal'] The priority of this event callback. The higher
	 * the priority value the sooner the callback will be fired. Events having the same priority are called in the
	 * order they were added.
	 * @param {Object} [options.context] The object that represents `this` in the callback. Defaults to the object firing the event.
	 * @param {Boolean} [options.useCapture=false] Indicates that events of this type will be dispatched to the registered
	 * listener before being dispatched to any EventTarget beneath it in the DOM tree.
	 *
	 * @method module:utils/dom/emittermixin~EmitterMixin#listenTo
	 */
	listenTo( ...args ) {
		const emitter = args[ 0 ];

		// Check if emitter is an instance of DOM Node. If so, replace the argument with
		// corresponding ProxyEmitter (or create one if not existing).
		if ( isDomNode( emitter ) ) {
			args[ 0 ] = this._getProxyEmitter( emitter ) || new ProxyEmitter( emitter );
		}

		// Execute parent class method with Emitter (or ProxyEmitter) instance.
		EmitterMixin.listenTo.apply( this, args );
	},

	/**
	 * Stops listening for events. It can be used at different levels:
	 * It is backwards compatible with {@link module:utils/emittermixin~EmitterMixin#listenTo}.
	 *
	 * * To stop listening to a specific callback.
	 * * To stop listening to a specific event.
	 * * To stop listening to all events fired by a specific object.
	 * * To stop listening to all events fired by all object.
	 *
	 * @param {module:utils/emittermixin~Emitter|Node} [emitter] The object to stop listening to. If omitted, stops it for all objects.
	 * @param {String} [event] (Requires the `emitter`) The name of the event to stop listening to. If omitted, stops it
	 * for all events from `emitter`.
	 * @param {Function} [callback] (Requires the `event`) The function to be removed from the call list for the given
	 * `event`.
	 *
	 * @method module:utils/dom/emittermixin~EmitterMixin#stopListening
	 */
	stopListening( ...args ) {
		const emitter = args[ 0 ];

		// Check if emitter is an instance of DOM Node. If so, replace the argument with corresponding ProxyEmitter.
		if ( isDomNode( emitter ) ) {
			const proxy = this._getProxyEmitter( emitter );

			// Element has no listeners.
			if ( !proxy ) {
				return;
			}

			args[ 0 ] = proxy;
		}

		// Execute parent class method with Emitter (or ProxyEmitter) instance.
		EmitterMixin.stopListening.apply( this, args );
	},

	/**
	 * Retrieves ProxyEmitter instance for given DOM Node residing in this Host.
	 *
	 * @param {Node} node DOM Node of the ProxyEmitter.
	 * @method module:utils/dom/emittermixin~EmitterMixin#_getProxyEmitter
	 * @return {module:utils/dom/emittermixin~ProxyEmitter} ProxyEmitter instance or null.
	 */
	_getProxyEmitter( node ) {
		return _getEmitterListenedTo( this, getNodeUID( node ) );
	}
} );

export default DomEmitterMixin;

/**
 * Creates a ProxyEmitter instance. Such an instance is a bridge between a DOM Node firing events
 * and any Host listening to them. It is backwards compatible with {@link module:utils/emittermixin~EmitterMixin#on}.
 *
 *                                  listenTo( click, ... )
 *                    +-----------------------------------------+
 *                    |              stopListening( ... )       |
 *     +----------------------------+                           |             addEventListener( click, ... )
 *     | Host                       |                           |   +---------------------------------------------+
 *     +----------------------------+                           |   |       removeEventListener( click, ... )     |
 *     | _listeningTo: {            |                +----------v-------------+                                   |
 *     |   UID: {                   |                | ProxyEmitter           |                                   |
 *     |     emitter: ProxyEmitter, |                +------------------------+                      +------------v----------+
 *     |     callbacks: {           |                | events: {              |                      | Node (HTMLElement)    |
 *     |       click: [ callbacks ] |                |   click: [ callbacks ] |                      +-----------------------+
 *     |     }                      |                | },                     |                      | data-ck-expando: UID  |
 *     |   }                        |                | _domNode: Node,        |                      +-----------------------+
 *     | }                          |                | _domListeners: {},     |                                   |
 *     | +------------------------+ |                | _emitterId: UID        |                                   |
 *     | | DomEmitterMixin        | |                +--------------^---------+                                   |
 *     | +------------------------+ |                           |   |                                             |
 *     +--------------^-------------+                           |   +---------------------------------------------+
 *                    |                                         |                  click (DOM Event)
 *                    +-----------------------------------------+
 *                                fire( click, DOM Event )
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 * @implements module:utils/dom/emittermixin~Emitter
 * @private
 */
class ProxyEmitter {
	/**
	 * @param {Node} node DOM Node that fires events.
	 * @returns {Object} ProxyEmitter instance bound to the DOM Node.
	 */
	constructor( node ) {
		// Set emitter ID to match DOM Node "expando" property.
		_setEmitterId( this, getNodeUID( node ) );

		// Remember the DOM Node this ProxyEmitter is bound to.
		this._domNode = node;
	}
}

extend( ProxyEmitter.prototype, EmitterMixin, {
	/**
	 * Collection of native DOM listeners.
	 *
	 * @private
	 * @member {Object} module:utils/dom/emittermixin~ProxyEmitter#_domListeners
	 */

	/**
	 * Registers a callback function to be executed when an event is fired.
	 *
	 * It attaches a native DOM listener to the DOM Node. When fired,
	 * a corresponding Emitter event will also fire with DOM Event object as an argument.
	 *
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to be called on event.
	 * @param {Object} [options={}] Additional options.
	 * @param {module:utils/priorities~PriorityString|Number} [options.priority='normal'] The priority of this event callback. The higher
	 * the priority value the sooner the callback will be fired. Events having the same priority are called in the
	 * order they were added.
	 * @param {Object} [options.context] The object that represents `this` in the callback. Defaults to the object firing the event.
	 * @param {Boolean} [options.useCapture=false] Indicates that events of this type will be dispatched to the registered
	 * listener before being dispatched to any EventTarget beneath it in the DOM tree.
	 *
	 * @method module:utils/dom/emittermixin~ProxyEmitter#on
	 */
	on( event, callback, options = {} ) {
		// Execute parent class method first.
		EmitterMixin.on.call( this, event, callback, options );

		// If the DOM Listener for given event already exist it is pointless
		// to attach another one.
		if ( this._domListeners && this._domListeners[ event ] ) {
			return;
		}

		const domListener = this._createDomListener( event, !!options.useCapture );

		// Attach the native DOM listener to DOM Node.
		this._domNode.addEventListener( event, domListener, !!options.useCapture );

		if ( !this._domListeners ) {
			this._domListeners = {};
		}

		// Store the native DOM listener in this ProxyEmitter. It will be helpful
		// when stopping listening to the event.
		this._domListeners[ event ] = domListener;
	},

	/**
	 * Stops executing the callback on the given event.
	 *
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to stop being called.
	 * @param {Object} [context] The context object to be removed, pared with the given callback. To handle cases where
	 * the same callback is used several times with different contexts.
	 *
	 * @method module:utils/dom/emittermixin~ProxyEmitter#off
	 */
	off( event, callback, context ) {
		// Execute parent class method first.
		EmitterMixin.off.call( this, event, callback, context );

		let events;

		// Remove native DOM listeners which are orphans. If no callbacks
		// are awaiting given event, detach native DOM listener from DOM Node.
		// See: {@link on}.

		if ( this._domListeners[ event ] && ( !( events = this._events[ event ] ) || !events.callbacks.length ) ) {
			this._domListeners[ event ].removeListener();
		}
	},

	/**
	 * Create a native DOM listener callback. When the native DOM event
	 * is fired it will fire corresponding event on this ProxyEmitter.
	 * Note: A native DOM Event is passed as an argument.
	 *
	 * @private
	 * @param {String} event
	 *
	 * @method module:utils/dom/emittermixin~ProxyEmitter#_createDomListener
	 * @param {String} event The name of the event.
	 * @param {Boolean} useCapture Indicates whether the listener was created for capturing event.
	 * @returns {Function} The DOM listener callback.
	 */
	_createDomListener( event, useCapture ) {
		const domListener = domEvt => {
			this.fire( event, domEvt );
		};

		// Supply the DOM listener callback with a function that will help
		// detach it from the DOM Node, when it is no longer necessary.
		// See: {@link off}.
		domListener.removeListener = () => {
			this._domNode.removeEventListener( event, domListener, useCapture );
			delete this._domListeners[ event ];
		};

		return domListener;
	}
} );

// Gets an unique DOM Node identifier. The identifier will be set if not defined.
//
// @private
// @param {Node} node
// @return {String} UID for given DOM Node.
function getNodeUID( node ) {
	return node[ 'data-ck-expando' ] || ( node[ 'data-ck-expando' ] = uid() );
}

// Checks (naively) if given node is native DOM Node.
//
// @private
// @param {Node} node
// @return {Boolean} True when native DOM Node.
function isDomNode( node ) {
	return node && isNative( node.addEventListener );
}

/**
 * Interface representing classes which mix in {@link module:utils/dom/emittermixin~EmitterMixin}.
 *
 * @interface Emitter
 */
