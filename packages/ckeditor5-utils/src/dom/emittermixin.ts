/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/emittermixin
 */

import EmitterMixin, {
	getCallbacksForEvent,
	type Emitter,
	type CallbackOptions,
	type BaseEvent,
	type GetCallback
} from '../emittermixin';
import isNode from './isnode';
import isWindow from './iswindow';
import type EventInfo from '../eventinfo';
import type { Constructor, Mixed } from '../mix';

const defaultEmitterClass = DomEmitterMixin( EmitterMixin() );

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
			emitter: Node | Window,
			event: K,
			callback: ( this: this, ev: EventInfo, event: HTMLElementEventMap[ K ] ) => void,
			options?: CallbackOptions & DomCallbackOptions
		): void;
		public override listenTo<TEvent extends BaseEvent>(
			emitter: Emitter,
			event: TEvent[ 'name' ],
			callback: GetCallback<TEvent>,
			options?: CallbackOptions
		): void;
		public override listenTo(
			emitter: Emitter | Node | Window,
			event: string,
			callback: ( ev: EventInfo, ...args: Array<any> ) => void,
			options: CallbackOptions & DomCallbackOptions = {}
		): void {
			// Check if emitter is an instance of DOM Node. If so, use corresponding ProxyEmitter (or create one if not existing).
			if ( isNode( emitter ) || isWindow( emitter ) ) {
				const proxyEmitter = this._getProxyEmitter( emitter ) || new ProxyEmitter( emitter );

				this.listenTo( proxyEmitter, event, callback, options );
			} else {
				// Execute parent class method with Emitter (or ProxyEmitter) instance.
				super.listenTo( emitter, event, callback, options );
			}
		}

		public override stopListening(
			emitter?: Emitter | Node | Window,
			event?: string,
			callback?: Function
		): void {
			// Check if the emitter is an instance of DOM Node. If so, forward the call to the corresponding ProxyEmitters.
			if ( isNode( emitter ) || isWindow( emitter ) ) {
				const proxyEmitter = this._getProxyEmitter( emitter );

				if ( proxyEmitter ) {
					this.stopListening( proxyEmitter, event, callback );
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
		 * @returns ProxyEmitter instance bound to the DOM Node.
		 */
		private _getProxyEmitter( node: Node | Window ): Emitter | null {
			return ProxyEmitter._instances.get( node ) || null;
		}
	}

	return Mixin;
}

// Backward compatibility with `mix`
( [
	'_getProxyEmitter', '_getAllProxyEmitters',
	'on', 'once', 'off', 'listenTo',
	'stopListening', 'fire', 'delegate', 'stopDelegating',
	'_addEventListener', '_removeEventListener'
] ).forEach( key => {
	( DomEmitterMixin as any )[ key ] = ( defaultEmitterClass.prototype as any )[ key ];
} );

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
class ProxyEmitter extends EmitterMixin() {
	private readonly _domNode: Node | Window;

	/**
	 * @internal
	 */
	public static _instances = new WeakMap<Node | Window, ProxyEmitter>();

	/**
	 * @param node DOM Node that fires events.
	 */
	constructor( node: Node | Window ) {
		super();

		ProxyEmitter._instances.set( node, this );

		// Remember the DOM Node this ProxyEmitter is bound to.
		this._domNode = node;
	}

	/**
	 * Collection of native DOM listeners.
	 */
	private _domListeners?: {
		[ event: string ]: {
			[ optionsHash: string ]: {
				( domEvent: unknown ): void;
				removeListener(): void;
			};
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
	 * @param options Additional options.
	 */
	public attach( event: string, options: DomCallbackOptions ): void {
		const proxyOptions = {
			capture: !!options.useCapture,
			passive: !!options.usePassive
		};

		const optionsHash = getOptionsHash( proxyOptions );

		// If the DOM Listener for given event already exist it is pointless
		// to attach another one.
		if ( this._domListeners && this._domListeners[ event ] && this._domListeners[ event ][ optionsHash ] ) {
			return;
		}

		const domListener = this._createDomListener( event, proxyOptions );

		// Attach the native DOM listener to DOM Node.
		this._domNode.addEventListener( event, domListener, proxyOptions );

		if ( !this._domListeners ) {
			this._domListeners = {};
		}

		if ( !this._domListeners[ event ] ) {
			this._domListeners[ event ] = {};
		}

		// Store the native DOM listener in this ProxyEmitter. It will be helpful
		// when stopping listening to the event.
		this._domListeners[ event ][ optionsHash ] = domListener;
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
		// Remove native DOM listeners which are orphans. If no callbacks
		// are awaiting given event, detach native DOM listener from DOM Node.
		// See: {@link attach}.

		if ( !this._domListeners![ event ] ) {
			return;
		}

		if ( !getCallbacksForEvent( this, event ) ) {
			for ( const optionsHash of Object.keys( this._domListeners![ event ] ) ) {
				this._domListeners![ event ][ optionsHash ].removeListener();
			}
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
		options: CallbackOptions & DomCallbackOptions
	): void {
		this.attach( event, options );
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
	 * @param options The DOM listener options.
	 * @returns The DOM listener callback.
	 */
	private _createDomListener( event: string, options: AddEventListenerOptions ) {
		const domListener = ( domEvt: unknown ) => {
			this.fire( event, domEvt );
		};

		// Supply the DOM listener callback with a function that will help
		// detach it from the DOM Node, when it is no longer necessary.
		// See: {@link detach}.
		domListener.removeListener = () => {
			this._domNode.removeEventListener( event, domListener, options );
			delete this._domListeners![ event ][ getOptionsHash( options ) ];

			if ( Object.keys( this._domListeners![ event ] ).length == 0 ) {
				delete this._domListeners![ event ];
			}
		};

		return domListener;
	}
}

function getOptionsHash( options: AddEventListenerOptions ): string {
	return Object.entries( options )
		.filter( ( [ , value ] ) => value )
		.map( ( [ key ] ) => key )
		.sort()
		.join( '-' );
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
		emitter: Node | Window,
		event: K,
		callback: ( this: this, ev: EventInfo, event: DomEventMap[ K ] ) => void,
		options?: CallbackOptions & DomCallbackOptions
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
	stopListening( emitter?: Emitter | Node | Window, event?: string, callback?: Function ): void;
}

export interface DomCallbackOptions {

	/**
	 * Indicates that events of this type will be dispatched to the registered
	 * listener before being dispatched to any EventTarget beneath it in the DOM tree.
	 */
	readonly useCapture?: boolean;

	/**
	 * Indicates that the function specified by listener will never call preventDefault()
	 * and prevents blocking browser's main thread by this event handler.
	 */
	readonly usePassive?: boolean;
}
