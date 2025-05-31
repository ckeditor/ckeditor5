/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/emittermixin
 */

import EmitterMixin, {
	_getEmitterListenedTo,
	_setEmitterId,
	type Emitter,
	type CallbackOptions,
	type BaseEvent,
	type GetCallback
} from '../emittermixin.js';
import uid from '../uid.js';
import isNode from './isnode.js';
import isWindow from './iswindow.js';
import type EventInfo from '../eventinfo.js';
import type { Constructor, Mixed } from '../mix.js';
import global from './global.js';

const defaultEmitterClass = /* #__PURE__ */ DomEmitterMixin( /* #__PURE__ */ EmitterMixin() );

/**
 * Mixin that injects the DOM events API into its host. It provides the API
 * compatible with {@link module:utils/emittermixin~Emitter}.
 *
 * This function creates a class that inherits from the provided `base` and implements `Emitter` interface.
 *
 * DOM emitter mixin is by default available in the {@link module:ui/view~View} class,
 * but it can also be mixed into any other class:
 *
 * ```ts
 * import DomEmitterMixin from '../utils/dom/emittermixin.js';
 *
 * class BaseClass { ... }
 *
 * class SomeView extends DomEmitterMixin( BaseClass ) {}
 *
 * const view = new SomeView();
 * view.listenTo( domElement, ( evt, domEvt ) => {
 * 	console.log( evt, domEvt );
 * } );
 * ```
 *
 * @label EXTENDS
 */
export default function DomEmitterMixin<Base extends Constructor<Emitter>>( base: Base ): Mixed<Base, DomEmitter>;

/**
 * Mixin that injects the DOM events API into its host. It provides the API
 * compatible with {@link module:utils/emittermixin~Emitter}.
 *
 * This function creates a class that implements `Emitter` interface.
 *
 * DOM emitter mixin is by default available in the {@link module:ui/view~View} class,
 * but it can also be mixed into any other class:
 *
 * ```ts
 * import DomEmitterMixin from '../utils/dom/emittermixin.js';
 *
 * class SomeView extends DomEmitterMixin() {}
 *
 * const view = new SomeView();
 * view.listenTo( domElement, ( evt, domEvt ) => {
 * 	console.log( evt, domEvt );
 * } );
 * ```
 *
 * @label NO_ARGUMENTS
 */
export default function DomEmitterMixin(): {
	new (): DomEmitter;
	prototype: DomEmitter;
};

export default function DomEmitterMixin( base?: Constructor<Emitter> ): unknown {
	if ( !base ) {
		return defaultEmitterClass;
	}

	abstract class Mixin extends base implements DomEmitter {
		public override listenTo<K extends keyof HTMLElementEventMap>(
			emitter: Node | Window | EventTarget,
			event: K,
			callback: ( this: this, ev: EventInfo, event: HTMLElementEventMap[ K ] ) => void,
			options?: CallbackOptions & { readonly useCapture?: boolean; readonly usePassive?: boolean }
		): void;
		public override listenTo<TEvent extends BaseEvent>(
			emitter: Emitter,
			event: TEvent[ 'name' ],
			callback: GetCallback<TEvent>,
			options?: CallbackOptions
		): void;
		public override listenTo(
			emitter: Emitter | Node | Window | EventTarget,
			event: string,
			callback: ( ev: EventInfo, ...args: Array<any> ) => void,
			options: CallbackOptions & { readonly useCapture?: boolean; readonly usePassive?: boolean } = {}
		): void {
			// Check if emitter is an instance of DOM Node. If so, use corresponding ProxyEmitter (or create one if not existing).
			if ( isNode( emitter ) || isWindow( emitter ) || emitter instanceof global.window.EventTarget ) {
				const proxyOptions = {
					capture: !!options.useCapture,
					passive: !!options.usePassive
				};

				const proxyEmitter = this._getProxyEmitter( emitter, proxyOptions ) || new ProxyEmitter( emitter, proxyOptions );

				this.listenTo( proxyEmitter, event, callback, options );
			} else {
				// Execute parent class method with Emitter (or ProxyEmitter) instance.
				super.listenTo( emitter, event, callback, options );
			}
		}

		public override stopListening(
			emitter?: Emitter | Node | Window | EventTarget,
			event?: string,
			callback?: Function
		): void {
			// Check if the emitter is an instance of DOM Node. If so, forward the call to the corresponding ProxyEmitters.
			if ( isNode( emitter ) || isWindow( emitter ) || emitter instanceof global.window.EventTarget ) {
				const proxyEmitters = this._getAllProxyEmitters( emitter );

				for ( const proxy of proxyEmitters ) {
					this.stopListening( proxy, event, callback );
				}
			} else {
				// Execute parent class method with Emitter (or ProxyEmitter) instance.
				super.stopListening( emitter, event, callback );
			}
		}

		/**
		 * Retrieves ProxyEmitter instance for given DOM Node residing in this Host and given options.
		 *
		 * @param node DOM Node of the ProxyEmitter.
		 * @param options Additional options.
		 * @param options.useCapture Indicates that events of this type will be dispatched to the registered
		 * listener before being dispatched to any EventTarget beneath it in the DOM tree.
		 * @param options.usePassive Indicates that the function specified by listener will never call preventDefault()
		 * and prevents blocking browser's main thread by this event handler.
		 * @returns ProxyEmitter instance bound to the DOM Node.
		 */
		private _getProxyEmitter(
			node: Node | Window | EventTarget,
			options: { capture: boolean; passive: boolean }
		): Emitter | null {
			return _getEmitterListenedTo( this, getProxyEmitterId( node, options ) );
		}

		/**
		 * Retrieves all the ProxyEmitter instances for given DOM Node residing in this Host.
		 *
		 * @param node DOM Node of the ProxyEmitter.
		 */
		private _getAllProxyEmitters( node: Node | Window | EventTarget ): Array<ProxyEmitter> {
			return [
				{ capture: false, passive: false },
				{ capture: false, passive: true },
				{ capture: true, passive: false },
				{ capture: true, passive: true }
			].map( options => this._getProxyEmitter( node, options ) ).filter( proxy => !!proxy ) as any;
		}
	}

	return Mixin;
}

/**
 * Creates a ProxyEmitter instance. Such an instance is a bridge between a DOM Node firing events
 * and any Host listening to them. It is backwards compatible with {@link module:utils/emittermixin~Emitter#on}.
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
 */
class ProxyEmitter extends /* #__PURE__ */ EmitterMixin() {
	private readonly _domNode: Node | Window | EventTarget;
	private readonly _options: { capture: boolean; passive: boolean };

	/**
	 * @param node DOM Node that fires events.
	 * @param options Additional options.
	 * @param options.useCapture Indicates that events of this type will be dispatched to the registered
	 * listener before being dispatched to any EventTarget beneath it in the DOM tree.
	 * @param options.usePassive Indicates that the function specified by listener will never call preventDefault()
	 * and prevents blocking browser's main thread by this event handler.
	 */
	constructor(
		node: Node | Window | EventTarget,
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
	 * {@link module:utils/emittermixin~Emitter#listenTo `Emitter#listenTo()`}.
	 *
	 * @param event The name of the event.
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
	 * {@link module:utils/emittermixin~Emitter#stopListening `Emitter#stopListening()`}.
	 *
	 * @param event The name of the event.
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
	 * @internal
	 * @param event The name of the event.
	 * @param callback The function to be called on event.
	 * @param options Additional options.
	 */
	public _addEventListener<TEvent extends BaseEvent>(
		event: TEvent[ 'name' ],
		callback: GetCallback<TEvent>,
		options: CallbackOptions
	): void {
		this.attach( event );
		( EmitterMixin().prototype as any )._addEventListener.call( this, event, callback, options );
	}

	/**
	 * Removes callback from emitter for given event.
	 *
	 * @internal
	 * @param event The name of the event.
	 * @param callback The function to stop being called.
	 */
	public _removeEventListener( event: string, callback: Function ) {
		( EmitterMixin().prototype as any )._removeEventListener.call( this, event, callback );
		this.detach( event );
	}

	/**
	 * Creates a native DOM listener callback. When the native DOM event
	 * is fired it will fire corresponding event on this ProxyEmitter.
	 * Note: A native DOM Event is passed as an argument.
	 *
	 * @param event The name of the event.
	 * @returns The DOM listener callback.
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

/**
 * Gets an unique DOM Node identifier. The identifier will be set if not defined.
 *
 * @returns UID for given DOM Node.
 */
function getNodeUID( node: any ): string {
	return node[ 'data-ck-expando' ] || ( node[ 'data-ck-expando' ] = uid() );
}

/**
 * Gets id of the ProxyEmitter for the given node.
 */
function getProxyEmitterId( node: Node | Window | EventTarget, options: { [ option: string ]: any } ): string {
	let id = getNodeUID( node );

	for ( const option of Object.keys( options ).sort() ) {
		if ( options[ option ] ) {
			id += '-' + option;
		}
	}

	return id;
}

export interface DomEventMap extends HTMLElementEventMap, WindowEventMap {
}

/**
 * Interface representing classes which mix in {@link module:utils/dom/emittermixin~DomEmitterMixin}.
 *
 * Can be easily implemented by a class by mixing the {@link module:utils/dom/emittermixin~DomEmitterMixin} mixin.
 *
 * ```ts
 * class MyClass extends DomEmitterMixin( OtherBaseClass ) {
 * 	// This class now implements the `Emitter` interface.
 * }
 * ```
 */
export interface DomEmitter extends Emitter {

	/**
	 * Registers a callback function to be executed when an event is fired in a specific Emitter or DOM Node.
	 * It is backwards compatible with {@link module:utils/emittermixin~Emitter#listenTo}.
	 *
	 * @label HTML_EMITTER
	 * @param emitter The object that fires the event.
	 * @param event The name of the event.
	 * @param callback The function to be called on event.
	 * @param options Additional options.
	 * @param options.useCapture Indicates that events of this type will be dispatched to the registered
	 * listener before being dispatched to any EventTarget beneath it in the DOM tree.
	 * @param options.usePassive Indicates that the function specified by listener will never call preventDefault()
	 * and prevents blocking browser's main thread by this event handler.
	 */
	listenTo<K extends keyof DomEventMap>(
		emitter: Node | Window | EventTarget,
		event: K,
		callback: ( this: this, ev: EventInfo, event: DomEventMap[ K ] ) => void,
		options?: CallbackOptions & { readonly useCapture?: boolean; readonly usePassive?: boolean }
	): void;

	/**
	 * Registers a callback function to be executed when an event is fired in a specific (emitter) object.
	 *
	 * Events can be grouped in namespaces using `:`.
	 * When namespaced event is fired, it additionally fires all callbacks for that namespace.
	 *
	 * ```ts
	 * // myEmitter.on( ... ) is a shorthand for myEmitter.listenTo( myEmitter, ... ).
	 * myEmitter.on( 'myGroup', genericCallback );
	 * myEmitter.on( 'myGroup:myEvent', specificCallback );
	 *
	 * // genericCallback is fired.
	 * myEmitter.fire( 'myGroup' );
	 * // both genericCallback and specificCallback are fired.
	 * myEmitter.fire( 'myGroup:myEvent' );
	 * // genericCallback is fired even though there are no callbacks for "foo".
	 * myEmitter.fire( 'myGroup:foo' );
	 * ```
	 *
	 * An event callback can {@link module:utils/eventinfo~EventInfo#stop stop the event} and
	 * set the {@link module:utils/eventinfo~EventInfo#return return value} of the {@link #fire} method.
	 *
	 * @label DOM_EMITTER
	 * @typeParam TEvent The type describing the event. See {@link module:utils/emittermixin~BaseEvent}.
	 * @param emitter The object that fires the event.
	 * @param event The name of the event.
	 * @param callback The function to be called on event.
	 * @param options Additional options.
	 */
	listenTo<TEvent extends BaseEvent>(
		emitter: Emitter,
		event: TEvent[ 'name' ],
		callback: GetCallback<TEvent>,
		options?: CallbackOptions
	): void;

	/**
	 * Stops listening for events. It can be used at different levels:
	 * It is backwards compatible with {@link module:utils/emittermixin~Emitter#listenTo}.
	 *
	 * * To stop listening to a specific callback.
	 * * To stop listening to a specific event.
	 * * To stop listening to all events fired by a specific object.
	 * * To stop listening to all events fired by all objects.
	 *
	 * @label DOM_STOP
	 * @param emitter The object to stop listening to.
	 * If omitted, stops it for all objects.
	 * @param event (Requires the `emitter`) The name of the event to stop listening to. If omitted, stops it
	 * for all events from `emitter`.
	 * @param callback (Requires the `event`) The function to be removed from the call list for the given
	 * `event`.
	 */
	stopListening( emitter?: Emitter | Node | Window | EventTarget, event?: string, callback?: Function ): void;
}
