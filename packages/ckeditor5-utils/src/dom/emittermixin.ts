/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable new-cap */

/**
 * @module utils/dom/emittermixin
 */

import {
	_getEmitterListenedTo,
	_setEmitterId,
	Emitter as BaseEmitter,
	type CallbackOptions,
	type BaseEvent,
	type GetCallback
} from '../emittermixin';
import uid from '../uid';
import isNode from './isnode';
import isWindow from './iswindow';
import type EventInfo from '../eventinfo';

/**
 * Mixin that injects the DOM events API into its host. It provides the API
 * compatible with {@link module:utils/emittermixin~EmitterMixin}.
 *
 * DOM emitter mixin is by default available in the {@link module:ui/view~View} class,
 * but it can also be mixed into any other class:
 *
 *		import mix from '../utils/mix.js';
 *		import DomEmitterMixin from '../utils/dom/emittermixin.js';
 *		import { Emitter } from '../utils/emittermixin.js';
 *
 *		class SomeView extends DomEmitterMixin( Emitter ) {}
 *
 *		const view = new SomeView();
 *		view.listenTo( domElement, ( evt, domEvt ) => {
 *			console.log( evt, domEvt );
 *		} );
 *
 * @mixin EmitterMixin
 * @mixes module:utils/emittermixin~EmitterMixin
 * @implements module:utils/dom/emittermixin~Emitter
 */
export default function DomEmitterMixin<Base extends abstract new( ...args: Array<any> ) => BaseEmitter>(
	base: Base
): {
	new( ...args: ConstructorParameters<Base> ): InstanceType<Base> & Emitter;
	prototype: InstanceType<Base> & Emitter;
} {
	abstract class Mixin extends base implements Emitter {
		public override listenTo<K extends keyof HTMLElementEventMap>(
			emitter: Node | Window,
			event: K,
			callback: ( this: this, ev: EventInfo, event: HTMLElementEventMap[ K ] ) => void,
			options?: CallbackOptions & { readonly useCapture?: boolean; readonly usePassive?: boolean }
		): void;
		public override listenTo<TEvent extends BaseEvent>(
			emitter: BaseEmitter,
			event: TEvent[ 'name' ],
			callback: GetCallback<TEvent>,
			options?: CallbackOptions
		): void;
		public override listenTo(
			emitter: BaseEmitter | Node | Window,
			event: string,
			callback: ( ev: EventInfo, ...args: Array<any> ) => void,
			options: CallbackOptions & { readonly useCapture?: boolean; readonly usePassive?: boolean } = {}
		): void {
			// Check if emitter is an instance of DOM Node. If so, use corresponding ProxyEmitter (or create one if not existing).
			if ( isNode( emitter ) || isWindow( emitter ) ) {
				const proxyOptions = {
					capture: !!options.useCapture,
					passive: !!options.usePassive
				};

				const proxyEmitter = this._getProxyEmitter( emitter, proxyOptions ) || new ProxyEmitter( emitter, proxyOptions );

				this.listenTo( proxyEmitter, event, callback, options );
			} else {
				// Execute parent class method with Emitter (or ProxyEmitter) instance.
				BaseEmitter.prototype.listenTo.call( this, emitter, event, callback, options );
			}
		}

		public override stopListening(
			emitter?: BaseEmitter | Node | Window,
			event?: string,
			callback?: Function
		): void {
			// Check if the emitter is an instance of DOM Node. If so, forward the call to the corresponding ProxyEmitters.
			if ( isNode( emitter ) || isWindow( emitter ) ) {
				const proxyEmitters = this._getAllProxyEmitters( emitter );

				for ( const proxy of proxyEmitters ) {
					this.stopListening( proxy, event, callback );
				}
			} else {
				// Execute parent class method with Emitter (or ProxyEmitter) instance.
				BaseEmitter.prototype.stopListening.call( this, emitter, event, callback );
			}
		}

		/**
		 * Retrieves ProxyEmitter instance for given DOM Node residing in this Host and given options.
		 *
		 * @private
		 * @param {Node|Window} node DOM Node of the ProxyEmitter.
		 * @param {Object} [options] Additional options.
		 * @param {Boolean} [options.useCapture=false] Indicates that events of this type will be dispatched to the registered
		 * listener before being dispatched to any EventTarget beneath it in the DOM tree.
		 * @param {Boolean} [options.usePassive=false] Indicates that the function specified by listener will never call preventDefault()
		 * and prevents blocking browser's main thread by this event handler.
		 * @returns {module:utils/dom/emittermixin~ProxyEmitter|null} ProxyEmitter instance bound to the DOM Node.
		 */
		private _getProxyEmitter(
			node: Node | Window,
			options: { capture: boolean; passive: boolean }
		): BaseEmitter | null {
			return _getEmitterListenedTo( this, getProxyEmitterId( node, options ) );
		}

		/**
		 * Retrieves all the ProxyEmitter instances for given DOM Node residing in this Host.
		 *
		 * @private
		 * @param {Node|Window} node DOM Node of the ProxyEmitter.
		 * @returns {Array.<module:utils/dom/emittermixin~ProxyEmitter>}
		 */
		private _getAllProxyEmitters( node: Node | Window ): Array<ProxyEmitter> {
			return [
				{ capture: false, passive: false },
				{ capture: false, passive: true },
				{ capture: true, passive: false },
				{ capture: true, passive: true }
			].map( options => this._getProxyEmitter( node, options ) ).filter( proxy => !!proxy ) as any;
		}
	}

	return Mixin as any;
}

export const Emitter = DomEmitterMixin( BaseEmitter );

// Backward compatibility with `mix`
( [
	'_getProxyEmitter', '_getAllProxyEmitters',
	'on', 'once', 'off', 'listenTo',
	'stopListening', 'fire', 'delegate', 'stopDelegating',
	'_addEventListener', '_removeEventListener'
] ).forEach( key => {
	( DomEmitterMixin as any )[ key ] = ( Emitter.prototype as any )[ key ];
} );

/**
 * Creates a ProxyEmitter instance. Such an instance is a bridge between a DOM Node firing events
 * and any Host listening to them. It is backwards compatible with {@link module:utils/emittermixin~EmitterMixin#on}.
 * There is a separate instance for each combination of modes (useCapture & usePassive). The mode is concatenated with
 * UID stored in HTMLElement to give each instance unique identifier.
 *
 *                                  listenTo( click, ... )
 *                    +-----------------------------------------+
 *                    |              stopListening( ... )       |
 *     +----------------------------+                           |             addEventListener( click, ... )
 *     | Host                       |                           |   +---------------------------------------------+
 *     +----------------------------+                           |   |       removeEventListener( click, ... )     |
 *     | _listeningTo: {            |                +----------v-------------+                                   |
 *     |   UID+mode: {              |                | ProxyEmitter           |                                   |
 *     |     emitter: ProxyEmitter, |                +------------------------+                      +------------v----------+
 *     |     callbacks: {           |                | events: {              |                      | Node (HTMLElement)    |
 *     |       click: [ callbacks ] |                |   click: [ callbacks ] |                      +-----------------------+
 *     |     }                      |                | },                     |                      | data-ck-expando: UID  |
 *     |   }                        |                | _domNode: Node,        |                      +-----------------------+
 *     | }                          |                | _domListeners: {},     |                                   |
 *     | +------------------------+ |                | _emitterId: UID+mode   |                                   |
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
class ProxyEmitter extends BaseEmitter {
	private readonly _domNode: Node | Window;
	private readonly _options: { capture: boolean; passive: boolean };

	/**
	 * @param {Node|Window} node DOM Node that fires events.
	 * @param {Object} [options] Additional options.
	 * @param {Boolean} [options.useCapture=false] Indicates that events of this type will be dispatched to the registered
	 * listener before being dispatched to any EventTarget beneath it in the DOM tree.
	 * @param {Boolean} [options.usePassive=false] Indicates that the function specified by listener will never call preventDefault()
	 * and prevents blocking browser's main thread by this event handler.
	 */
	constructor(
		node: Node | Window,
		options: { capture: boolean; passive: boolean }
	) {
		super();

		// Set emitter ID to match DOM Node "expando" property.
		_setEmitterId( this, getProxyEmitterId( node, options ) );

		// Remember the DOM Node this ProxyEmitter is bound to.
		this._domNode = node;

		// And given options.
		this._options = options;
	}

	/**
	 * Collection of native DOM listeners.
	 *
	 * @private
	 * @member {Object} module:utils/dom/emittermixin~ProxyEmitter#_domListeners
	 */
	private _domListeners?: {
		[ event: string ]: {
			( domEvent: unknown ): void;
			removeListener(): void;
		};
	};

	/**
	 * Registers a callback function to be executed when an event is fired.
	 *
	 * It attaches a native DOM listener to the DOM Node. When fired,
	 * a corresponding Emitter event will also fire with DOM Event object as an argument.
	 *
	 * **Note**: This is automatically called by the
	 * {@link module:utils/emittermixin~EmitterMixin#listenTo `EmitterMixin#listenTo()`}.
	 *
	 * @method module:utils/dom/emittermixin~ProxyEmitter#attach
	 * @param {String} event The name of the event.
	 */
	public attach( event: string ): void {
		// If the DOM Listener for given event already exist it is pointless
		// to attach another one.
		if ( this._domListeners && this._domListeners[ event ] ) {
			return;
		}

		const domListener = this._createDomListener( event );

		// Attach the native DOM listener to DOM Node.
		this._domNode.addEventListener( event, domListener, this._options );

		if ( !this._domListeners ) {
			this._domListeners = {};
		}

		// Store the native DOM listener in this ProxyEmitter. It will be helpful
		// when stopping listening to the event.
		this._domListeners[ event ] = domListener;
	}

	/**
	 * Stops executing the callback on the given event.
	 *
	 * **Note**: This is automatically called by the
	 * {@link module:utils/emittermixin~EmitterMixin#stopListening `EmitterMixin#stopListening()`}.
	 *
	 * @method module:utils/dom/emittermixin~ProxyEmitter#detach
	 * @param {String} event The name of the event.
	 */
	public detach( event: string ): void {
		let events;

		// Remove native DOM listeners which are orphans. If no callbacks
		// are awaiting given event, detach native DOM listener from DOM Node.
		// See: {@link attach}.

		if ( this._domListeners![ event ] && ( !( events = ( this as any )._events![ event ] ) || !events.callbacks.length ) ) {
			this._domListeners![ event ].removeListener();
		}
	}

	/**
	 * Adds callback to emitter for given event.
	 *
	 * @protected
	 * @method module:utils/dom/emittermixin~ProxyEmitter#_addEventListener
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to be called on event.
	 * @param {Object} [options={}] Additional options.
	 * @param {module:utils/priorities~PriorityString} [options.priority='normal'] The priority of this event callback. The higher
	 * the priority value the sooner the callback will be fired. Events having the same priority are called in the
	 * order they were added.
	 */
	public _addEventListener<TEvent extends BaseEvent>(
		event: TEvent[ 'name' ],
		callback: GetCallback<TEvent>,
		options: CallbackOptions
	): void {
		this.attach( event );
		( BaseEmitter.prototype as any )._addEventListener.call( this, event, callback, options );
	}

	/**
	 * Removes callback from emitter for given event.
	 *
	 * @protected
	 * @method module:utils/dom/emittermixin~ProxyEmitter#_removeEventListener
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to stop being called.
	 */
	public _removeEventListener( event: string, callback: Function ) {
		( BaseEmitter.prototype as any )._removeEventListener.call( this, event, callback );
		this.detach( event );
	}

	/**
	 * Creates a native DOM listener callback. When the native DOM event
	 * is fired it will fire corresponding event on this ProxyEmitter.
	 * Note: A native DOM Event is passed as an argument.
	 *
	 * @private
	 * @method module:utils/dom/emittermixin~ProxyEmitter#_createDomListener
	 * @param {String} event The name of the event.
	 * @returns {Function} The DOM listener callback.
	 */
	private _createDomListener( event: string ) {
		const domListener = ( domEvt: unknown ) => {
			this.fire( event, domEvt );
		};

		// Supply the DOM listener callback with a function that will help
		// detach it from the DOM Node, when it is no longer necessary.
		// See: {@link detach}.
		domListener.removeListener = () => {
			this._domNode.removeEventListener( event, domListener, this._options );
			delete this._domListeners![ event ];
		};

		return domListener;
	}
}

// Gets an unique DOM Node identifier. The identifier will be set if not defined.
//
// @private
// @param {Node} node
// @returns {String} UID for given DOM Node.
function getNodeUID( node: any ): string {
	return node[ 'data-ck-expando' ] || ( node[ 'data-ck-expando' ] = uid() );
}

// Gets id of the ProxyEmitter for the given node.
//
// Combines DOM Node identifier and additional options.
//
// @private
// @param {Node} node
// @param {Object} options Additional options.
// @returns {String} ProxyEmitter id.
function getProxyEmitterId( node: Node | Window, options: { [ option: string ]: any } ): string {
	let id = getNodeUID( node );

	for ( const option of Object.keys( options ).sort() ) {
		if ( options[ option ] ) {
			id += '-' + option;
		}
	}

	return id;
}

/**
 * Interface representing classes which mix in {@link module:utils/dom/emittermixin~EmitterMixin}.
 *
 * @interface Emitter
 */
export interface Emitter extends BaseEmitter {

	/**
	 * Registers a callback function to be executed when an event is fired in a specific Emitter or DOM Node.
	 * It is backwards compatible with {@link module:utils/emittermixin~EmitterMixin#listenTo}.
	 *
	 * @param {module:utils/emittermixin~Emitter|Node|Window} emitter The object that fires the event.
	 * @param {String} event The name of the event.
	 * @param {Function} callback The function to be called on event.
	 * @param {Object} [options={}] Additional options.
	 * @param {module:utils/priorities~PriorityString} [options.priority='normal'] The priority of this event callback. The higher
	 * the priority value the sooner the callback will be fired. Events having the same priority are called in the
	 * order they were added.
	 * @param {Boolean} [options.useCapture=false] Indicates that events of this type will be dispatched to the registered
	 * listener before being dispatched to any EventTarget beneath it in the DOM tree.
	 * @param {Boolean} [options.usePassive=false] Indicates that the function specified by listener will never call preventDefault()
	 * and prevents blocking browser's main thread by this event handler.
	 */
	listenTo<K extends keyof HTMLElementEventMap>(
		emitter: Node | Window,
		event: K,
		callback: ( this: this, ev: EventInfo, event: HTMLElementEventMap[ K ] ) => void,
		options?: CallbackOptions & { readonly useCapture?: boolean; readonly usePassive?: boolean }
	): void;
	listenTo<TEvent extends BaseEvent>(
		emitter: BaseEmitter,
		event: TEvent[ 'name' ],
		callback: GetCallback<TEvent>,
		options?: CallbackOptions
	): void;

	/**
	 * Stops listening for events. It can be used at different levels:
	 * It is backwards compatible with {@link module:utils/emittermixin~EmitterMixin#listenTo}.
	 *
	 * * To stop listening to a specific callback.
	 * * To stop listening to a specific event.
	 * * To stop listening to all events fired by a specific object.
	 * * To stop listening to all events fired by all object.
	 *
	 * @param {module:utils/emittermixin~Emitter|Node|Window} [emitter] The object to stop listening to.
	 * If omitted, stops it for all objects.
	 * @param {String} [event] (Requires the `emitter`) The name of the event to stop listening to. If omitted, stops it
	 * for all events from `emitter`.
	 * @param {Function} [callback] (Requires the `event`) The function to be removed from the call list for the given
	 * `event`.
	 */
	stopListening( emitter?: BaseEmitter | Node | Window, event?: string, callback?: Function ): void;
}
