/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/overlayhost
 */

import { BodyCollection } from './editorui/bodycollection.js';
import { TooltipManager } from './tooltipmanager.js';
import { type View } from './view.js';

import {
	EmitterMixin,
	ShadowRootRegistry,
	type CollectionAddEvent,
	type Emitter,
	type EmitterMixinConstructor,
	type Locale
} from '@ckeditor/ckeditor5-utils';

const OverlayHostBase: EmitterMixinConstructor = /* #__PURE__ */ EmitterMixin();

/**
 * Keeps a feature's floating UI – its balloons, dialogs, panels and the tooltips inside them – in the right DOM
 * tree, and keeps it there as the feature moves.
 *
 * For a feature that renders its UI *outside* an editor, in a container the integrator may put anywhere,
 * including inside a shadow root. An editor's own floating UI needs none of this: it is mounted in the root the
 * editor lives in and stays there.
 *
 * # Why it is needed
 *
 * Floating UI is mounted through a {@link module:ui/editorui/bodycollection~BodyCollection}, and it has to go
 * into the same tree as the feature it belongs to. Anywhere else it loses the styles scoped to that tree, and
 * its tooltips come out clipped or mis-styled across the shadow boundary.
 *
 * Doing that by hand means re-mounting the collection whenever the container moves, unmounting it while the
 * container is detached, registering and unregistering it with the shared
 * {@link module:ui/tooltipmanager~TooltipManager}, tracking the shadow roots of the inline UI so that tooltips
 * and click-outside detection reach across boundaries, and tearing it all down in the right order. This class
 * does all of it, behind resolvers that say where the feature's UI currently is.
 *
 * # How to use it
 *
 * ```ts
 * const host = new OverlayHost( locale, {
 * 	resolveMountTarget: () => getOverlayMountRoot( featureContainer ),
 * 	resolveInlineContainer: () => featureContainer
 * } );
 *
 * host.sync();
 * host.bodyCollection.add( balloonPanelView );
 * ```
 *
 * Add the feature's floating views to {@link #bodyCollection}. Call {@link #sync} whenever the container may
 * have moved – right before showing a panel, for instance – and {@link #destroy} once the feature goes away.
 * It re-syncs on its own too: whenever a view is added to the collection, and on every `update` event of an
 * {@link module:ui/overlayhost~OverlayHostOptions#updateEmitter `updateEmitter`}, if one is given.
 *
 * An editor's {@link module:ui/editorui/editorui~EditorUI} uses this class as well, lending it the body
 * collection and shadow root registry it already has.
 */
export class OverlayHost extends OverlayHostBase {
	/**
	 * The body collection holding the floating views. Add the feature's balloons and panels here.
	 */
	public readonly bodyCollection: BodyCollection;

	/**
	 * Tracks the shadow roots hosting the tooltip-bearing UI that lives outside the {@link #bodyCollection}:
	 * the {@link module:ui/overlayhost~OverlayHostOptions#resolveInlineContainer inline UI container} and any
	 * nodes registered directly by the owner (an editor registers its editables, toolbars and menu bar).
	 */
	public readonly shadowRootRegistry: ShadowRootRegistry;

	/**
	 * The shared tooltip manager the {@link #bodyCollection} is registered with.
	 */
	private readonly _tooltipManager: TooltipManager;

	/**
	 * See {@link module:ui/overlayhost~OverlayHostOptions#resolveMountTarget}.
	 */
	private readonly _resolveMountTarget: () => HTMLElement | ShadowRoot | null;

	/**
	 * See {@link module:ui/overlayhost~OverlayHostOptions#resolveInlineContainer}.
	 */
	private readonly _resolveInlineContainer?: () => HTMLElement | null | undefined;

	/**
	 * The inline UI container currently registered with {@link #shadowRootRegistry}, so it can be
	 * replaced when the feature moves to a different container.
	 */
	private _registeredInlineContainer: HTMLElement | null = null;

	/**
	 * Whether the {@link #bodyCollection} was created by this host (and is destroyed with it), as opposed to
	 * a borrowed one whose owner manages its life cycle.
	 */
	private readonly _ownsBodyCollection: boolean;

	/**
	 * Whether the {@link #shadowRootRegistry} was created by this host (and is destroyed with it), as opposed
	 * to a borrowed one whose owner manages its life cycle.
	 */
	private readonly _ownsShadowRootRegistry: boolean;

	/**
	 * Whether this host acquired its own reference to the shared tooltip manager (and releases it on
	 * {@link #destroy}), as opposed to using a borrowed reference whose holder releases it – an editor counts
	 * as a single holder no matter how it splits the work internally.
	 */
	private readonly _ownsTooltipManagerReference: boolean;

	/**
	 * Whether {@link #destroy} has run, so a repeated call does not release the shared tooltip manager on
	 * behalf of another holder.
	 */
	private _destroyed = false;

	/**
	 * Creates the host: the {@link #bodyCollection} (unless a borrowed one is given) and its registration in
	 * the shared {@link module:ui/tooltipmanager~TooltipManager}. The collection is not mounted in the DOM
	 * yet – call {@link #sync} for that.
	 *
	 * @param locale The locale of the feature (used by the body collection and the tooltip views).
	 * @param options The resolvers describing where the feature UI lives.
	 */
	constructor( locale: Locale, options: OverlayHostOptions ) {
		super();

		this.bodyCollection = options.bodyCollection || new BodyCollection( locale );
		this._ownsBodyCollection = !options.bodyCollection;

		this.shadowRootRegistry = options.shadowRootRegistry || new ShadowRootRegistry();
		this._ownsShadowRootRegistry = !options.shadowRootRegistry;

		this._resolveMountTarget = options.resolveMountTarget;
		this._resolveInlineContainer = options.resolveInlineContainer;

		this._tooltipManager = options.tooltipManager || TooltipManager.for( locale );
		this._ownsTooltipManagerReference = !options.tooltipManager;
		this._tooltipManager.registerBodyCollection( this.bodyCollection, {
			shadowRootRegistry: this.shadowRootRegistry,
			updateEmitter: options.updateEmitter
		} );

		// The mount target may become resolvable only over time (a detached container gets connected, an
		// editor renders): follow the owner's update heartbeat and re-resolve when the first floating UI is
		// about to show up. The high priority makes same-tick `update` listeners see fresh shadow roots.
		if ( options.updateEmitter ) {
			this.listenTo( options.updateEmitter, 'update', () => this.sync(), { priority: 'high' } );
		}

		this.listenTo<CollectionAddEvent<View>>( this.bodyCollection, 'add', () => this.sync() );
	}

	/**
	 * Brings the host up to date with the resolved targets:
	 *
	 * * keeps the {@link #bodyCollection} mounted in the target resolved by
	 *   {@link module:ui/overlayhost~OverlayHostOptions#resolveMountTarget} (re-mounting only when the target
	 *   changes, unmounting on `null`);
	 * * keeps the {@link module:ui/overlayhost~OverlayHostOptions#resolveInlineContainer inline UI container}
	 *   tracked for tooltips, re-resolving its shadow root in case a detached container has become connected.
	 *
	 * Idempotent – call it whenever the targets may have changed: after attaching the feature to a container,
	 * right before showing a floating panel (an editor's UI may be mounted lazily), or on any relevant layout
	 * change.
	 */
	public sync(): void {
		this.bodyCollection.syncMountTarget( this._resolveMountTarget() );

		if ( this._resolveInlineContainer ) {
			const container = this._resolveInlineContainer() || null;

			if ( container !== this._registeredInlineContainer ) {
				if ( this._registeredInlineContainer ) {
					this.shadowRootRegistry.unregisterNode( this._registeredInlineContainer );
				}

				this._registeredInlineContainer = container;

				if ( container ) {
					this.shadowRootRegistry.registerNode( container );
				}
			}
		}

		this.shadowRootRegistry.refresh();
	}

	/**
	 * Destroys the host: stops hosting tooltips in the {@link #bodyCollection}, releases the shared
	 * {@link module:ui/tooltipmanager~TooltipManager} (so it is destroyed with its last holder) and destroys
	 * the collection together with its views and the {@link #shadowRootRegistry} – except the borrowed ones,
	 * which their owners destroy. Safe to call more than once.
	 */
	public destroy(): void {
		if ( this._destroyed ) {
			return;
		}

		this._destroyed = true;

		this.stopListening();

		// The tooltip manager must let go of the collection (pulling the shared balloon out of it) before the
		// collection and its views are destroyed.
		this._tooltipManager.unregisterBodyCollection( this.bodyCollection );

		if ( this._ownsTooltipManagerReference ) {
			this._tooltipManager.release();
		}

		if ( this._ownsShadowRootRegistry ) {
			this.shadowRootRegistry.destroy();
		}

		if ( this._ownsBodyCollection ) {
			this.bodyCollection.destroy();
		}
	}
}

/**
 * The configuration of an {@link module:ui/overlayhost~OverlayHost}: callbacks resolving where the feature UI
 * lives, called on every {@link module:ui/overlayhost~OverlayHost#sync}, and optional borrowed collaborators.
 */
export interface OverlayHostOptions {

	/**
	 * Resolves the element or shadow root the {@link module:ui/overlayhost~OverlayHost#bodyCollection} should
	 * be mounted in – that is, where the feature's floating views end up in the DOM. The collection is
	 * appended as a top-level child of this target, which should meet two requirements at once:
	 *
	 * * it adopts the same styles as the root the feature's UI lives in – typically a shadow root sharing that
	 *   root's adopted stylesheets – so the floating views are styled like the rest of the feature's UI;
	 * * it sits at the end of `document.body`, both so that `overflow` on the ancestors between the feature
	 *   and the document body cannot clip the floating UI, and so that it paints above the rest of the UI
	 *   (DOM order decides paint order within a stacking context) instead of below it.
	 *
	 * A dedicated shadow root appended at the end of `document.body` that mirrors those styles satisfies both.
	 * The target is therefore not required to be the feature's own root, and to stay unclipped and on top it
	 * usually should not be nested inside the feature's container.
	 *
	 * Return `null` to keep the collection unmounted – for example while the feature's container is not
	 * connected to the document yet, so there is no root to resolve. The target is re-resolved on every
	 * {@link module:ui/overlayhost~OverlayHost#sync}, so the collection is re-mounted if the feature moves to a
	 * different root and unmounted once its container goes away.
	 *
	 * {@link module:utils/dom/getoverlaymountroot~getOverlayMountRoot} covers the common resolution from an
	 * anchor node (the feature's container): the anchor's shadow root when it lives in one, `document.body`
	 * in the light DOM, or `null` while the anchor is detached.
	 */
	resolveMountTarget: () => HTMLElement | ShadowRoot | null;

	/**
	 * Resolves the DOM element holding the feature's *inline* UI – the parts the feature renders directly into
	 * its own container (buttons, badges, and similar), as opposed to the floating views it puts into the
	 * {@link module:ui/overlayhost~OverlayHost#bodyCollection}.
	 *
	 * The host registers this element with its {@link module:ui/overlayhost~OverlayHost#shadowRootRegistry} so
	 * the shared {@link module:ui/tooltipmanager~TooltipManager} can drive the tooltips of that inline UI. This
	 * matters when the inline UI sits inside a shadow root: in events observed at the document level the
	 * elements inside the root are hidden behind their shadow host, so the tooltip manager has to attach its
	 * listeners inside each registered root – without this element being registered, the tooltips of the
	 * feature's inline UI would never fire. The element is re-resolved on every
	 * {@link module:ui/overlayhost~OverlayHost#sync}, so the registration follows the feature if it moves to a
	 * different container.
	 *
	 * Omit it when the feature has no tooltip-bearing UI outside the body collection, or when those nodes are
	 * registered directly with the {@link module:ui/overlayhost~OverlayHost#shadowRootRegistry} instead.
	 */
	resolveInlineContainer?: () => HTMLElement | null | undefined;

	/**
	 * An existing body collection to host instead of creating one – used by
	 * {@link module:ui/editorui/editorui~EditorUI}, whose collection belongs to the
	 * {@link module:ui/editorui/editoruiview~EditorUIView}. A borrowed collection is not destroyed by
	 * {@link module:ui/overlayhost~OverlayHost#destroy}; its owner destroys it.
	 */
	bodyCollection?: BodyCollection;

	/**
	 * An existing shadow root registry to use instead of creating one – used by
	 * {@link module:ui/editorui/editorui~EditorUI}, which feeds its registry from many places (editables,
	 * toolbars, the menu bar) and shares it with other features. A borrowed registry is not destroyed by
	 * {@link module:ui/overlayhost~OverlayHost#destroy}; its owner destroys it.
	 */
	shadowRootRegistry?: ShadowRootRegistry;

	/**
	 * A borrowed reference to the shared tooltip manager to register the body collection with, instead of the
	 * host {@link module:ui/tooltipmanager~TooltipManager.for acquiring} (and on destroy
	 * {@link module:ui/tooltipmanager~TooltipManager#release releasing}) a reference of its own – used by
	 * {@link module:ui/editorui/editorui~EditorUI}, so an editor keeps counting as a single holder of the
	 * singleton. The holder of the borrowed reference releases it.
	 */
	tooltipManager?: TooltipManager;

	/**
	 * An emitter whose `update` event signals that the UI may have moved or re-rendered (an editor passes its
	 * {@link module:ui/editorui/editorui~EditorUI}). The host {@link module:ui/overlayhost~OverlayHost#sync
	 * re-syncs} on every such event and the shared tooltip manager repositions a pinned tooltip.
	 */
	updateEmitter?: Emitter;
}
