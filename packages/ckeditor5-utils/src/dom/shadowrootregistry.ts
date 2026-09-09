/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/shadowrootregistry
 */

import { getShadowRoots } from './getshadowroots.js';
import { EmitterMixin, type CallbackOptions, type EmitterMixinConstructor } from '../emittermixin.js';
import { type DomEmitter, type DomEventMap } from './emittermixin.js';
import { type EventInfo } from '../eventinfo.js';

const ShadowRootRegistryBase: EmitterMixinConstructor = /* #__PURE__ */ EmitterMixin();

/**
 * Keeps track of the shadow roots hosting a set of registered DOM nodes (for example an editor UI's editables,
 * toolbars and menu bars, or a feature's own UI), so that consumers can, for instance, inject styles or listeners
 * into every shadow root those nodes currently live in.
 */
export class ShadowRootRegistry extends ShadowRootRegistryBase {
	/**
	 * The shadow roots hosting each registered node, as of the last time that node was looked at. Empty for a node
	 * that was detached or lived in the light DOM then. Re-derived for every node by each {@link #refresh}, so a
	 * node that has since been attached, or moved to another tree, is picked up. The union of the values is
	 * {@link #getShadowRoots}.
	 */
	private _rootsByNode = new Map<Node, Array<ShadowRoot>>();

	/**
	 * Returns the shadow roots currently hosting at least one registered node.
	 */
	public getShadowRoots(): Set<ShadowRoot> {
		const roots = new Set<ShadowRoot>();

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

		const previousRoots = this.getShadowRoots();

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

		const previousRoots = this.getShadowRoots();

		this._rootsByNode.delete( node );
		this._fireRootChanges( previousRoots );
	}

	/**
	 * Re-derives the shadow roots of every registered node, firing {@link #event:add} for the roots that started
	 * hosting one and {@link #event:remove} for those that stopped.
	 *
	 * Call it whenever a registered node may have been attached, detached, or moved – for example on every editor
	 * UI update. Nodes are re-derived rather than resolved once, because the tree a node lives in is not fixed:
	 * an editable mounted by the integrator after the editor was created, or moved into a fullscreen container in
	 * another tree, ends up somewhere its roots were never derived from.
	 */
	public refresh(): void {
		const previousRoots = this.getShadowRoots();

		for ( const node of this._rootsByNode.keys() ) {
			this._rootsByNode.set( node, deriveRoots( node ) );
		}

		this._fireRootChanges( previousRoots );
	}

	/**
	 * Unregisters every currently registered node at once, firing {@link #event:remove} for every shadow root
	 * that consequently stops being tracked.
	 *
	 * @internal
	 */
	public destroy(): void {
		const previousRoots = this.getShadowRoots();

		this._rootsByNode.clear();
		this._fireRootChanges( previousRoots );
	}

	/**
	 * Fires {@link #event:add} and {@link #event:remove} for the difference between the given set of tracked
	 * shadow roots and the current one.
	 */
	private _fireRootChanges( previousRoots: Set<ShadowRoot> ): void {
		const currentRoots = this.getShadowRoots();

		for ( const root of previousRoots ) {
			if ( !currentRoots.has( root ) ) {
				this.fire<ShadowRootRegistryRemoveEvent>( 'remove', root );
			}
		}

		for ( const root of currentRoots ) {
			if ( !previousRoots.has( root ) ) {
				this.fire<ShadowRootRegistryAddEvent>( 'add', root );
			}
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
 * @param registry The registry whose shadow roots should be listened to.
 * @param options.emitter The emitter to which this behavior should be added.
 * @param options.event The DOM event to listen to.
 * @param options.callback The event handler.
 * @param options.listenerOptions Listener options, passed through to `DomEmitter#listenTo()`.
 */
export function listenToShadowRoots(
	registry: ShadowRootRegistry,
	{ emitter, event, callback, listenerOptions }: {
		emitter: DomEmitter;
		event: keyof DomEventMap;
		callback: ( evt: EventInfo, domEvent: any ) => void;
		listenerOptions?: CallbackOptions & { useCapture?: boolean; usePassive?: boolean };
	}
): () => void {
	const attachedRoots = new Set<ShadowRoot>();

	const sync = () => {
		const currentRoots = registry.getShadowRoots();

		for ( const root of attachedRoots ) {
			if ( !currentRoots.has( root ) ) {
				emitter.stopListening( root, event, callback );
				attachedRoots.delete( root );
			}
		}

		for ( const root of currentRoots ) {
			if ( !attachedRoots.has( root ) ) {
				emitter.listenTo( root, event, callback, listenerOptions );
				attachedRoots.add( root );
			}
		}
	};

	emitter.listenTo( registry, 'add', sync );
	emitter.listenTo( registry, 'remove', sync );

	sync();

	return () => {
		emitter.stopListening( registry, 'add', sync );
		emitter.stopListening( registry, 'remove', sync );

		for ( const root of attachedRoots ) {
			emitter.stopListening( root, event, callback );
		}

		attachedRoots.clear();
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
 * The shadow roots a node lives in, or none while it is detached.
 *
 * A detached node still reports the shadow roots of the tree it sits in – those roots exist whether or not their
 * host is in a document – but nothing in them is rendered yet, so there is nothing to listen to or inject into.
 */
function deriveRoots( node: Node ): Array<ShadowRoot> {
	return node.isConnected ? getShadowRoots( node ) : [];
}
