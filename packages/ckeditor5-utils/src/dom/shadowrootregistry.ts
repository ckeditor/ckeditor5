/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/shadowrootregistry
 */

import { getEventRoots } from './geteventroots.js';
import { DomTargetsListener, type DomTargetsListenerOptions } from './domtargetslistener.js';
import { isShadowRoot } from './isshadowroot.js';
import { EmitterMixin, type EmitterMixinConstructor } from '../emittermixin.js';
import { type DomEventMap } from './emittermixin.js';
import { global } from './global.js';

const ShadowRootRegistryBase: EmitterMixinConstructor = /* #__PURE__ */ EmitterMixin();

/**
 * Keeps track of the shadow roots hosting a set of registered DOM nodes (for example an editor UI's editables,
 * toolbars and menu bars, or a feature's own UI), so that consumers can, for instance, inject styles or listeners
 * into every shadow root those nodes currently live in.
 *
 * It also keeps track of the wider set of the {@link #getEventRoots event roots} of those nodes – the shadow roots
 * plus the documents the nodes are connected to – for consumers that listen to DOM events of those nodes.
 */
export class ShadowRootRegistry extends ShadowRootRegistryBase {
	/**
	 * The event roots of each registered node, as of the last time that node was looked at: the shadow roots hosting
	 * it and the document it is connected to. Empty for a node that was detached then. Re-derived for every node by
	 * each {@link #refresh}, so a node that has since been attached, or moved to another tree, is picked up.
	 * The union of the values is {@link #getEventRoots}, and its shadow roots are {@link #getShadowRoots}.
	 */
	private _rootsByNode = new Map<Node, Array<Document | ShadowRoot>>();

	/**
	 * Returns the shadow roots currently hosting at least one registered node.
	 */
	public getShadowRoots(): Set<ShadowRoot> {
		const roots = new Set<ShadowRoot>();

		for ( const root of this.getEventRoots() ) {
			if ( isShadowRoot( root ) ) {
				roots.add( root );
			}
		}

		return roots;
	}

	/**
	 * Returns the event roots of the currently registered nodes: every shadow root hosting at least one of them,
	 * as in {@link #getShadowRoots}, and every document at least one of them is connected to.
	 *
	 * See {@link module:utils/dom/geteventroots~getEventRoots} for what an event root is.
	 */
	public getEventRoots(): Set<Document | ShadowRoot> {
		const roots = new Set<Document | ShadowRoot>();

		for ( const nodeRoots of this._rootsByNode.values() ) {
			for ( const root of nodeRoots ) {
				roots.add( root );
			}
		}

		return roots;
	}

	/**
	 * Registers a node, so the shadow roots hosting it become a part of {@link #getShadowRoots}.
	 *
	 * The node does not have to be attached to the DOM yet; while it is not, it simply contributes no shadow root.
	 * The next {@link #refresh} picks it up once it is attached.
	 */
	public registerNode( node: Node ): void {
		if ( this._rootsByNode.has( node ) ) {
			return;
		}

		const previousRoots = this.getEventRoots();

		this._rootsByNode.set( node, deriveRoots( node ) );
		this._fireRootChanges( previousRoots );
	}

	/**
	 * Unregisters a previously {@link #registerNode registered} node. Shadow roots that no longer host any
	 * registered node stop being a part of {@link #getShadowRoots}.
	 */
	public unregisterNode( node: Node ): void {
		if ( !this._rootsByNode.has( node ) ) {
			return;
		}

		const previousRoots = this.getEventRoots();

		this._rootsByNode.delete( node );
		this._fireRootChanges( previousRoots );
	}

	/**
	 * Re-derives the shadow roots of every registered node, firing {@link #event:add} for the roots that started
	 * hosting one and {@link #event:remove} for those that stopped. Fires {@link #event:changeEventRoots} if
	 * the {@link #getEventRoots event roots} changed.
	 *
	 * Call it whenever a registered node may have been attached, detached, or moved – for example on every editor
	 * UI update. Nodes are re-derived rather than resolved once, because the tree a node lives in is not fixed:
	 * an editable mounted by the integrator after the editor was created, or moved into a fullscreen container in
	 * another tree, ends up somewhere its roots were never derived from.
	 */
	public refresh(): void {
		const previousRoots = this.getEventRoots();

		for ( const node of this._rootsByNode.keys() ) {
			this._rootsByNode.set( node, deriveRoots( node ) );
		}

		this._fireRootChanges( previousRoots );
	}

	/**
	 * Unregisters every currently registered node at once, firing {@link #event:remove} for every shadow root
	 * that consequently stops being tracked, and {@link #event:changeEventRoots} if any event root was tracked.
	 *
	 * @internal
	 */
	public destroy(): void {
		const previousRoots = this.getEventRoots();

		this._rootsByNode.clear();
		this._fireRootChanges( previousRoots );
	}

	/**
	 * Fires {@link #event:add} and {@link #event:remove} for the difference between the shadow roots in the given
	 * set of tracked event roots and the current ones, followed by a single {@link #event:changeEventRoots} if
	 * the event roots differ at all.
	 */
	private _fireRootChanges( previousRoots: Set<Document | ShadowRoot> ): void {
		const currentRoots = this.getEventRoots();
		let hasChanged = false;

		for ( const root of previousRoots ) {
			if ( !currentRoots.has( root ) ) {
				hasChanged = true;

				if ( isShadowRoot( root ) ) {
					this.fire<ShadowRootRegistryRemoveEvent>( 'remove', root );
				}
			}
		}

		for ( const root of currentRoots ) {
			if ( !previousRoots.has( root ) ) {
				hasChanged = true;

				if ( isShadowRoot( root ) ) {
					this.fire<ShadowRootRegistryAddEvent>( 'add', root );
				}
			}
		}

		if ( hasChanged ) {
			this.fire<ShadowRootRegistryChangeEventRootsEvent>( 'changeEventRoots' );
		}
	}
}

/**
 * Some DOM events never reach a listener on `document` if they originate inside a shadow root — `scroll` and
 * `mouseenter`/`mouseleave`, for instance, do not cross a shadow boundary at all. This function is how code that
 * needs those events anyway reacts to them for every shadow root a registry is currently tracking: it attaches
 * `emitter`'s callback directly to each one tracked by `registry`, and keeps that up to date — attaching to
 * roots that appear later, detaching from roots that disappear — for as long as the returned function is not
 * called.
 *
 * Attach it alongside the `document` listener rather than instead of it — one covers the light DOM, the other
 * each shadow root:
 *
 * ```ts
 * view.listenTo( global.document, 'scroll', repositionOnScroll, { useCapture: true } );
 *
 * const stopListening = listenToShadowRoots( editor.ui.shadowRootRegistry, {
 * 	emitter: view,
 * 	event: 'scroll',
 * 	listenerOptions: { useCapture: true },
 * 	callback: repositionOnScroll
 * } );
 * ```
 *
 * To cover both with a single call, use {@link ~listenToEventRoots} instead.
 *
 * The `useCapture` above is not incidental. The events this function exists for do not bubble when fired on an
 * element, so a listener on a shadow root only sees one that originates inside that root during the capture
 * phase. Without it the listener is attached but never fires.
 *
 * Call the returned function to detach. There is nothing to refresh, as the listener follows the registry on its own.
 *
 * @param registry The registry whose shadow roots should be listened to.
 * @param options Describes the listener to attach to each shadow root.
 */
export function listenToShadowRoots<TEvent extends keyof DomEventMap>(
	registry: ShadowRootRegistry,
	options: DomTargetsListenerOptions<TEvent>
): () => void {
	return listenToTrackedRoots( registry, [ 'add', 'remove' ], () => registry.getShadowRoots(), options );
}

/**
 * Attaches `emitter`'s callback to the global `document` and to every {@link ~ShadowRootRegistry#getEventRoots event root}
 * tracked by `registry`, and keeps that up to date – attaching to roots that appear later, detaching from roots that
 * disappear – for as long as the returned function is not called.
 *
 * It replaces a pair of a `document` listener and {@link ~listenToShadowRoots}:
 *
 * ```ts
 * const stopListening = listenToEventRoots( editor.ui.shadowRootRegistry, {
 * 	emitter: view,
 * 	event: 'scroll',
 * 	listenerOptions: { useCapture: true },
 * 	callback: repositionOnScroll
 * } );
 * ```
 *
 * The global `document` is always listened to, even if no registered node lives in it, so the callback receives
 * the same events as a listener on `document` would, plus the events of the other event roots. Each root is listened
 * to once, no matter how many registered nodes it hosts.
 *
 * As with {@link ~listenToShadowRoots}, use `useCapture: true` for events that do not bubble, such as `scroll`.
 *
 * Call the returned function to detach. There is nothing to refresh, as the listener follows the registry on its own.
 *
 * @param registry The registry whose event roots should be listened to.
 * @param options Describes the listener to attach to each event root.
 */
export function listenToEventRoots<TEvent extends keyof DomEventMap>(
	registry: ShadowRootRegistry,
	options: DomTargetsListenerOptions<TEvent>
): () => void {
	return listenToTrackedRoots( registry, [ 'changeEventRoots' ], () => {
		const roots = registry.getEventRoots();

		roots.add( global.document );

		return roots;
	}, options );
}

/**
 * Keeps `emitter`'s callback attached to exactly the roots returned by `getRoots()`, re-reading them whenever
 * the registry fires one of `registryEvents`.
 */
function listenToTrackedRoots<TEvent extends keyof DomEventMap>(
	registry: ShadowRootRegistry,
	registryEvents: Array<string>,
	getRoots: () => Set<Document | ShadowRoot>,
	options: DomTargetsListenerOptions<TEvent>
): () => void {
	const rootsListener = new DomTargetsListener( getRoots, options );
	const refresh = () => rootsListener.refresh();

	for ( const registryEvent of registryEvents ) {
		options.emitter.listenTo( registry, registryEvent, refresh );
	}

	return () => {
		for ( const registryEvent of registryEvents ) {
			options.emitter.stopListening( registry, registryEvent, refresh );
		}

		rootsListener.destroy();
	};
}

/**
 * Fired when a shadow root starts hosting a registered node.
 *
 * @eventName ~ShadowRootRegistry#add
 * @param root The shadow root that started being tracked.
 */
export type ShadowRootRegistryAddEvent = {
	name: 'add';
	args: [ root: ShadowRoot ];
};

/**
 * Fired when a shadow root no longer hosts any registered node.
 *
 * @eventName ~ShadowRootRegistry#remove
 * @param root The shadow root that stopped being tracked.
 */
export type ShadowRootRegistryRemoveEvent = {
	name: 'remove';
	args: [ root: ShadowRoot ];
};

/**
 * Fired when the {@link ~ShadowRootRegistry#getEventRoots event roots} of the registered nodes change: a shadow root
 * or a document starts or stops hosting a registered node. Fired once per change, after any {@link ~ShadowRootRegistry#event:add}
 * and {@link ~ShadowRootRegistry#event:remove} events, so read the current roots with {@link ~ShadowRootRegistry#getEventRoots}.
 *
 * @eventName ~ShadowRootRegistry#changeEventRoots
 */
export type ShadowRootRegistryChangeEventRootsEvent = {
	name: 'changeEventRoots';
	args: [];
};

/**
 * The event roots a node lives in, or none while it is detached.
 *
 * A detached node still reports the shadow roots of the tree it sits in – those roots exist whether or not their
 * host is in a document – but nothing in them is rendered yet, so there is nothing to listen to or inject into.
 */
function deriveRoots( node: Node ): Array<Document | ShadowRoot> {
	return node.isConnected ? getEventRoots( node ) : [];
}
