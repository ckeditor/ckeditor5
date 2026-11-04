/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/domtargetslistener
 */

import { type DomEmitter, type DomEventMap } from './emittermixin.js';
import { type CallbackOptions } from '../emittermixin.js';
import { type EventInfo } from '../eventinfo.js';

/**
 * Keeps `emitter`'s callback attached to exactly the DOM event targets returned by `getTargets()`, for code whose
 * targets are known only later or change over time.
 *
 * To listen to the events of the whole editor UI, use {@link module:utils/dom/shadowrootregistry~listenToEventRoots}
 * instead, which follows the editor's {@link module:utils/dom/shadowrootregistry~ShadowRootRegistry registry} on its own.
 * Use this listener for particular elements, such as the positioning target of a balloon or the limiter of a sticky
 * panel: return `document` and their {@link module:utils/dom/geteventroots~getEventRoots event roots} from `getTargets()`.
 * Unlike the registry listeners, it does not listen to `document` on its own.
 *
 * The targets are read once, when the listener is created. Call {@link #refresh} whenever they may have changed:
 * it calls `getTargets()` again, attaches the callback to the targets that appeared and detaches it from the targets
 * that disappeared, leaving the others alone. Call {@link #destroy} to detach the callback from every target:
 *
 * ```ts
 * const scrollListener = new DomTargetsListener( () => [ document, ...getEventRoots( limiterElement ) ], {
 * 	emitter: view,
 * 	event: 'scroll',
 * 	listenerOptions: { useCapture: true },
 * 	callback: onScroll
 * } );
 *
 * // For example once the limiter was moved to another shadow root.
 * scrollListener.refresh();
 *
 * // For example when the view is destroyed.
 * scrollListener.destroy();
 * ```
 *
 * Only this callback is ever detached, so other listeners of the same emitter on the same targets are not affected.
 */
export class DomTargetsListener<TEvent extends keyof DomEventMap = keyof DomEventMap> {
	/**
	 * Returns the targets that should be listened to.
	 */
	private readonly _getTargets: () => Iterable<EventTarget | null | undefined>;

	/**
	 * The emitter the callback is attached with.
	 */
	private readonly _emitter: DomEmitter;

	/**
	 * The DOM event the callback is attached to.
	 */
	private readonly _event: keyof DomEventMap;

	/**
	 * The callback attached to each target.
	 */
	private readonly _callback: ( evt: EventInfo, domEvent: any ) => void;

	/**
	 * The options the callback is attached with.
	 */
	private readonly _listenerOptions: DomTargetsListenerOptions<keyof DomEventMap>[ 'listenerOptions' ];

	/**
	 * The targets the callback is currently attached to.
	 */
	private readonly _attachedTargets = new Set<EventTarget>();

	/**
	 * Creates the listener and attaches the callback to the targets returned by `getTargets()`.
	 *
	 * @param getTargets Returns the targets that should be listened to. `null` and `undefined` entries are skipped.
	 * @param options Describes the listener to attach to each target.
	 */
	constructor(
		getTargets: () => Iterable<EventTarget | null | undefined>,
		{ emitter, event, listenerOptions, callback }: DomTargetsListenerOptions<TEvent>
	) {
		this._getTargets = getTargets;
		this._emitter = emitter;
		this._event = event;
		this._callback = callback;
		this._listenerOptions = listenerOptions;

		this.refresh();
	}

	/**
	 * Reads the targets again: attaches the callback to the targets that appeared and detaches it from the targets that
	 * disappeared.
	 */
	public refresh(): void {
		const targets = new Set<EventTarget>();

		for ( const target of this._getTargets() ) {
			if ( target ) {
				targets.add( target );
			}
		}

		this._attachTo( targets );
	}

	/**
	 * Detaches the callback from every target.
	 */
	public destroy(): void {
		this._attachTo( new Set() );
	}

	/**
	 * Attaches the callback to exactly the given targets.
	 */
	private _attachTo( targets: Set<EventTarget> ): void {
		for ( const target of this._attachedTargets ) {
			if ( !targets.has( target ) ) {
				this._emitter.stopListening( target, this._event, this._callback );
				this._attachedTargets.delete( target );
			}
		}

		for ( const target of targets ) {
			if ( !this._attachedTargets.has( target ) ) {
				this._emitter.listenTo( target, this._event, this._callback, this._listenerOptions );
				this._attachedTargets.add( target );
			}
		}
	}
}

/**
 * The listener that {@link ~DomTargetsListener} and the registry helpers attach to each DOM event target.
 */
export interface DomTargetsListenerOptions<TEvent extends keyof DomEventMap> {

	/**
	 * The emitter to which this behavior should be added.
	 */
	emitter: DomEmitter;

	/**
	 * The DOM event to listen to.
	 */
	event: TEvent;

	/**
	 * Listener options, passed through to `DomEmitter#listenTo()`.
	 */
	listenerOptions?: CallbackOptions & { useCapture?: boolean; usePassive?: boolean };

	/**
	 * The event handler.
	 */
	callback: ( evt: EventInfo, domEvent: DomEventMap[ TEvent ] ) => void;
}
