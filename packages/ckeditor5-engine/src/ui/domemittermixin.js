/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EmitterMixin from '../emittermixin.js';
import utils from '../utils.js';
import objectUtils from '../lib/lodash/object.js';
import log from '../log.js';

/**
 * Creates a ProxyEmitter instance. Such an instance is a bridge between a DOM Node firing events
 * and any Host listening to them. It is backwards compatible with {@link EmitterMixin#on}.
 *
 * @class DOMEmitterMixin
 * @mixins EmitterMixin
 * @param {Node} node DOM Node that fires events.
 * @returns {Object} ProxyEmitter instance bound to the DOM Node.
 */
class ProxyEmitter {
	constructor( node ) {
		// Set emitter ID to match DOM Node "expando" property.
		this._emitterId = getNodeUID( node );

		// Remember the DOM Node this ProxyEmitter is bound to.
		this._domNode = node;
	}
}

objectUtils.extend( ProxyEmitter.prototype, EmitterMixin, {
	/**
	 * Collection of native DOM listeners.
	 *
	 * @property {Object} _domListeners
	 */

	/**
	 * Registers a callback function to be executed when an event is fired.
	 *
	 * It attaches a native DOM listener to the DOM Node. When fired,
	 * a corresponding Emitter event will also fire with DOM Event object as an argument.
	 *
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to be called on event.
	 * @param {Object} [ctx] The object that represents `this` in the callback. Defaults to the object firing the
	 * event.
	 * @param {Number} [priority=10] The priority of this callback in relation to other callbacks to that same event.
	 * Lower values are called first.
	 */
	on( event ) {
		// Execute parent class method first.
		EmitterMixin.on.apply( this, arguments );

		// If the DOM Listener for given event already exist it is pointless
		// to attach another one.
		if ( this._domListeners && this._domListeners[ event ] ) {
			return;
		}

		const domListener = this._createDomListener( event );

		// Attach the native DOM listener to DOM Node.
		this._domNode.addEventListener( event, domListener );

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
	 * @param {Object} [ctx] The context object to be removed, pared with the given callback. To handle cases where
	 * the same callback is used several times with different contexts.
	 */
	off( event ) {
		// Execute parent class method first.
		EmitterMixin.off.apply( this, arguments );

		let callbacks;

		// Remove native DOM listeners which are orphans. If no callbacks
		// are awaiting given event, detach native DOM listener from DOM Node.
		// See: {@link on}.
		if ( !( callbacks = this._events[ event ] ) || !callbacks.length ) {
			this._domListeners[ event ].removeListener();
		}
	},

	/**
	 * Create a native DOM listener callback. When the native DOM event
	 * is fired it will fire corresponding event on this ProxyEmitter.
	 * Note: A native DOM Event is passed as an argument.
	 *
	 * @param {String} event
	 * @returns {Function} The DOM listener callback.
	 */
	_createDomListener( event ) {
		const domListener = domEvt => {
			this.fire( event, domEvt );
		};

		// Supply the DOM listener callback with a function that will help
		// detach it from the DOM Node, when it is no longer necessary.
		// See: {@link off}.
		domListener.removeListener = () => {
			this._domNode.removeEventListener( event, domListener );
			delete this._domListeners[ event ];
		};

		return domListener;
	}
} );

/**
 * Mixin that injects the DOM events API into its host. It provides the API
 * compatible with {@link EmitterMixin}.
 *
 *                               listenTo( click, ... )
 *                 +-----------------------------------------+
 *                 |              stopListening( ... )       |
 *  +----------------------------+                           |             addEventListener( click, ... )
 *  | Host                       |                           |   +---------------------------------------------+
 *  +----------------------------+                           |   |       removeEventListener( click, ... )     |
 *  | _listeningTo: {            |                +----------v-------------+                                   |
 *  |   UID: {                   |                | ProxyEmitter           |                                   |
 *  |     emitter: ProxyEmitter, |                +------------------------+                      +------------v----------+
 *  |     callbacks: {           |                | events: {              |                      | Node (HTMLElement)    |
 *  |       click: [ callbacks ] |                |   click: [ callbacks ] |                      +-----------------------+
 *  |     }                      |                | },                     |                      | data-cke-expando: UID |
 *  |   }                        |                | _domNode: Node,        |                      +-----------------------+
 *  | }                          |                | _domListeners: {},     |                                   |
 *  | +------------------------+ |                | _emitterId: UID        |                                   |
 *  | | DOMEmitterMixin        | |                +--------------^---------+                                   |
 *  | +------------------------+ |                           |   |                                             |
 *  +--------------^-------------+                           |   +---------------------------------------------+
 *                 |                                         |                  click (DOM Event)
 *                 +-----------------------------------------+
 *                             fire( click, DOM Event )
 *
 * @class DOMEmitterMixin
 * @extends EmitterMixin
 * @singleton
 */

const DOMEmitterMixin = {
	/**
	 * Registers a callback function to be executed when an event is fired in a specific Emitter or DOM Node.
	 * It is backwards compatible with {@link EmitterMixin#listenTo}.
	 *
	 * @param {Emitter|Node} emitter The object that fires the event.
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to be called on event.
	 * @param {Object} [ctx] The object that represents `this` in the callback. Defaults to `emitter`.
	 * @param {Number} [priority=10] The priority of this callback in relation to other callbacks to that same event.
	 * Lower values are called first.
	 */
	listenTo() {
		const args = Array.prototype.slice.call( arguments );
		const emitter = args[ 0 ];

		// Check if emitter is an instance of DOM Node. If so, replace the argument with
		// corresponding ProxyEmitter (or create one if not existing).
		if ( emitter instanceof Node ) {
			args[ 0 ] = this._getProxyEmitter( emitter ) || new ProxyEmitter( emitter );
		}

		// Execute parent class method with Emitter (or ProxyEmitter) instance.
		EmitterMixin.listenTo.apply( this, args );
	},

	/**
	 * Stops listening for events. It can be used at different levels:
	 * It is backwards compatible with {@link EmitterMixin#listenTo}.
	 *
	 * * To stop listening to a specific callback.
	 * * To stop listening to a specific event.
	 * * To stop listening to all events fired by a specific object.
	 * * To stop listening to all events fired by all object.
	 *
	 * @param {Emitter|Node} [emitter] The object to stop listening to. If omitted, stops it for all objects.
	 * @param {String} [event] (Requires the `emitter`) The name of the event to stop listening to. If omitted, stops it
	 * for all events from `emitter`.
	 * @param {Function} [callback] (Requires the `event`) The function to be removed from the call list for the given
	 * `event`.
	 */
	stopListening() {
		const args = Array.prototype.slice.call( arguments );
		const emitter = args[ 0 ];

		// Check if emitter is an instance of DOM Node. If so, replace the argument with corresponding ProxyEmitter.
		if ( emitter instanceof Node ) {
			let proxy = this._getProxyEmitter( emitter );

			if ( proxy ) {
				args[ 0 ] = proxy;
			} else {
				log.error(
					'domemittermixin-stoplistening: Stopped listening on a DOM Node that has no emitter or emitter is gone.',
					emitter
				);
			}
		}

		// Execute parent class method with Emitter (or ProxyEmitter) instance.
		EmitterMixin.stopListening.apply( this, args );
	},

	/**
	 * Retrieves ProxyEmitter instance for given DOM Node residing in this Host.
	 *
	 * @param {Node} node DOM Node of the ProxyEmitter.
	 * @return {ProxyEmitter} ProxyEmitter instance or null.
	 */
	_getProxyEmitter( node ) {
		let proxy, emitters, emitterInfo;

		// Get node UID. It allows finding Proxy Emitter for this DOM Node.
		const uid = getNodeUID( node );

		// Find existing Proxy Emitter for this DOM Node among emitters.
		if ( ( emitters = this._listeningTo ) ) {
			if ( ( emitterInfo = emitters[ uid ] ) ) {
				proxy = emitterInfo.emitter;
			}
		}

		return proxy || null;
	}
};

export default DOMEmitterMixin;

/**
 * Gets an unique DOM Node identifier. The identifier will be set if not defined.
 *
 * @param {Node} node
 * @return {Number} UID for given DOM Node.
 */
function getNodeUID( node ) {
	return node[ 'data-ck-expando' ] || ( node[ 'data-ck-expando' ] = utils.uid() );
}
