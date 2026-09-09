/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/tooltipmanager
 */

import { View } from './view.js';
import { BalloonPanelView } from './panel/balloon/balloonpanelview.js';
import type { BodyCollection, BodyCollectionRemountEvent } from './editorui/bodycollection.js';

import {
	DomEmitterMixin,
	containsNode,
	first,
	global,
	isShadowHostOf,
	isShadowRoot,
	isVisible,
	type Emitter,
	type EventInfo,
	type Locale,
	type PositioningFunction,
	type ShadowRootRegistry,
	type DomEmitterMixinConstructor
} from '@ckeditor/ckeditor5-utils';

import { isElement, debounce } from 'es-toolkit/compat';

const BALLOON_CLASS = 'ck-tooltip';

const TooltipManagerBase: DomEmitterMixinConstructor = /* #__PURE__ */ DomEmitterMixin();

/**
 * A tooltip manager class for the UI of the editor.
 *
 * **Note**: Most likely you do not have to use the `TooltipManager` API listed below in order to display tooltips. Popular
 * {@glink framework/architecture/ui-library UI components} support tooltips out-of-the-box via observable properties
 * (see {@link module:ui/button/buttonview~ButtonView#tooltip} and {@link module:ui/button/buttonview~ButtonView#tooltipPosition}).
 *
 * # Displaying tooltips
 *
 * To display a tooltip, set `data-cke-tooltip-text` attribute on any DOM element:
 *
 * ```ts
 * domElement.dataset.ckeTooltipText = 'My tooltip';
 * ```
 *
 * The tooltip will show up whenever the user moves the mouse over the element or the element gets focus in DOM.
 *
 * # Positioning tooltips
 *
 * To change the position of the tooltip, use the `data-cke-tooltip-position` attribute (`s`, `se`, `sw`, `n`, `e`, or `w`):
 *
 * ```ts
 * domElement.dataset.ckeTooltipText = 'Tooltip to the north';
 * domElement.dataset.ckeTooltipPosition = 'n';
 * ```
 *
 * # Disabling tooltips
 *
 * In order to disable the tooltip temporarily, use the `data-cke-tooltip-disabled` attribute:
 *
 * ```ts
 * domElement.dataset.ckeTooltipText = 'Disabled. For now.';
 * domElement.dataset.ckeTooltipDisabled = 'true';
 * ```
 *
 * # Instant tooltips
 *
 * To remove the delay before showing or hiding the tooltip, use the `data-cke-tooltip-instant` attribute:
 *
 * ```ts
 * domElement.dataset.ckeTooltipInstant = 'true';
 * ```
 *
 * # Styling tooltips
 *
 * By default, the tooltip has `.ck-tooltip` class and its text inner `.ck-tooltip__text`.
 *
 * If your tooltip requires custom styling, using `data-cke-tooltip-class` attribute will add additional class to the balloon
 * displaying the tooltip:
 *
 * ```ts
 * domElement.dataset.ckeTooltipText = 'Tooltip with a red text';
 * domElement.dataset.ckeTooltipClass = 'my-class';
 * ```
 *
 * ```css
 * .ck.ck-tooltip.my-class { color: red }
 * ```
 *
 * **Note**: This class is a singleton. All editor instances re-use the same instance loaded by
 * {@link module:ui/editorui/editorui~EditorUI} of the first editor.
 */
export class TooltipManager extends TooltipManagerBase {
	/**
	 * The view rendering text of the tooltip.
	 */
	public readonly tooltipTextView!: View & { text: string };

	/**
	 * The instance of the balloon panel that renders and positions the tooltip.
	 */
	public readonly balloonPanelView!: BalloonPanelView;

	/**
	 * A set of default {@link module:utils/dom/position~PositioningFunction positioning functions} used by the `TooltipManager`
	 * to pin tooltips in different positions.
	 */
	public static defaultBalloonPositions: Record<string, PositioningFunction> = /* #__PURE__ */ BalloonPanelView.generatePositions( {
		heightOffset: 5,
		sideOffset: 13
	} );

	/**
	 * Stores the reference to the DOM element the tooltip is attached to. `null` when there's no tooltip
	 * in the UI.
	 */
	private _currentElementWithTooltip: HTMLElement | null = null;

	/**
	 * Stores the current tooltip position. `null` when there's no tooltip in the UI.
	 */
	private _currentTooltipPosition: TooltipPosition | null = null;

	/**
	 * An instance of the mutation observer that keeps track on target element attributes changes.
	 */
	private _mutationObserver: MutationObserverWrapper | null = null;

	/**
	 * A debounced version of {@link #_pinTooltip}. Tooltips show with a delay to avoid flashing and
	 * to improve the UX.
	 */
	private _pinTooltipDebounced!: ReturnType<typeof debounce<( targetDomElement: HTMLElement, data: TooltipData ) => void>>;

	/**
	 * A debounced version of {@link #_unpinTooltip}. Tooltips hide with a delay to allow hovering of their titles.
	 */
	private _unpinTooltipDebounced!: ReturnType<typeof debounce<VoidFunction>>;

	/**
	 * Shadow roots the manager currently has listeners attached to.
	 */
	private _shadowRoots = new Set<ShadowRoot>();

	/**
	 * Maps each DOM tree (the document or a shadow root) that hosts tooltip-bearing UI to the body collection
	 * the shared tooltip balloon should be pinned into for targets in that tree. Rebuilt from
	 * {@link module:ui/tooltipmanager~TooltipManager._registrations} by {@link #_rebuild}.
	 */
	private _bodyCollectionByTree = new Map<Document | ShadowRoot, BodyCollection>();

	private readonly _watchdogExcluded!: true;

	/**
	 * The number of holders (editors and features) currently using the singleton, so it is destroyed only when
	 * the last one {@link #release releases} it.
	 */
	private _refCount = 0;

	/**
	 * A reference to the `TooltipManager` instance. The class is a singleton and as such,
	 * successive attempts at creating instances should return this instance.
	 */
	private static _instance: TooltipManager | null = null;

	/**
	 * The body collections the shared tooltip balloon may be pinned into, each with the sources describing where
	 * its tooltip-bearing UI lives: an optional {@link module:utils/dom/shadowrootregistry~ShadowRootRegistry}
	 * (the shadow roots its out-of-collection UI occupies) and an optional emitter whose `update` event should
	 * reposition a pinned tooltip.
	 */
	private static _registrations = new Map<BodyCollection, BodyCollectionRegistration>();

	/**
	 * Returns the shared `TooltipManager` singleton, creating it – with the given locale – on first use, and
	 * marks one more holder as using it. Every caller must later {@link #release} it, so the singleton is
	 * destroyed once the last holder is gone.
	 *
	 * Editors and features obtain the manager this way and then {@link #registerBodyCollection register} the
	 * body collection their tooltip-bearing UI renders into. A feature therefore does not need an editor
	 * reference to display tooltips – it attaches to the same singleton directly.
	 *
	 * @param locale The locale used to create the tooltip views on first use.
	 */
	public static for( locale: Locale ): TooltipManager {
		if ( !TooltipManager._instance ) {
			TooltipManager._instance = new TooltipManager( locale );
		}

		TooltipManager._instance._refCount++;

		return TooltipManager._instance;
	}

	/**
	 * Creates an instance of the tooltip manager. Private – use {@link module:ui/tooltipmanager~TooltipManager.for} to obtain the shared
	 * singleton.
	 */
	private constructor( locale: Locale ) {
		super();

		this.tooltipTextView = new View( locale ) as any;
		this.tooltipTextView.set( 'text', '' );
		this.tooltipTextView.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck',
					'ck-tooltip__text'
				]
			},
			children: [
				{
					text: this.tooltipTextView.bindTemplate.to( 'text' )
				}
			]
		} );

		this.balloonPanelView = new BalloonPanelView( locale );
		this.balloonPanelView.class = BALLOON_CLASS;
		this.balloonPanelView.content.add( this.tooltipTextView );

		this._mutationObserver = createMutationObserver( () => {
			this._updateTooltipPosition();
		} );

		this._pinTooltipDebounced = debounce( this._pinTooltip, 600 );
		this._unpinTooltipDebounced = debounce( this._unpinTooltip, 400 );

		this.listenTo( global.document, 'keydown', this._onKeyDown.bind( this ), { useCapture: true } );

		// These are all attached on `document` to cover the light (non-shadow) DOM. Shadow roots get their
		// own listeners for the same events, see #_resyncShadowRootListeners — `document`'s copies either never
		// fire for shadow-originated events (`mouseenter`, `mouseleave`, `scroll`, all non-`composed`) or fire
		// with a retargeted, unusable target (`focus`, `blur`, which are `composed`).
		//
		// Unlike these, set up once here, the shadow-root listeners are attached and detached over time by
		// `#_resyncShadowRootListeners`, as registered body collections and their shadow roots come and go.
		this.listenTo( global.document, 'mouseenter', this._onEnterOrFocus.bind( this ), { useCapture: true } );
		this.listenTo( global.document, 'mouseleave', this._onLeaveOrBlur.bind( this ), { useCapture: true } );

		this.listenTo( global.document, 'focus', this._onEnterOrFocus.bind( this ), { useCapture: true } );
		this.listenTo( global.document, 'blur', this._onLeaveOrBlur.bind( this ), { useCapture: true } );

		this.listenTo( global.document, 'scroll', this._onScroll.bind( this ), { useCapture: true } );

		// Because this class is a singleton, its only instance is shared across all editors and connects them through the reference.
		// This causes issues with the ContextWatchdog. When an error is thrown in one editor, the watchdog traverses the references
		// and (because of shared tooltip manager) figures that the error affects all editors and restarts them all.
		// This flag, excludes tooltip manager instance from the traversal and brings ContextWatchdog back to normal.
		// More in https://github.com/ckeditor/ckeditor5/issues/12292.
		this._watchdogExcluded = true;
	}

	/**
	 * Marks one holder as done with the singleton (see {@link module:ui/tooltipmanager~TooltipManager.for}). When the last holder
	 * releases it, the singleton unpins the tooltip, destroys the shared balloon and drops every listener.
	 */
	public release(): void {
		// Guard against releasing more times than the singleton was obtained (for example a double editor
		// destroy), which would otherwise tear the shared instance down twice.
		if ( this._refCount === 0 || --this._refCount > 0 ) {
			return;
		}

		this._unpinTooltip();
		this.balloonPanelView.destroy();
		this.stopListening();

		TooltipManager._registrations.clear();
		this._bodyCollectionByTree.clear();
		this._shadowRoots.clear();

		TooltipManager._instance = null;
	}

	/**
	 * Registers a body collection the shared tooltip balloon may be pinned into, so that a tooltip triggered
	 * inside its DOM tree is hosted there instead of an unrelated one – keeping it in the same shadow tree, not
	 * clipped by or mis-styled across a boundary. Editors register their own
	 * {@link module:ui/editorui/editoruiview~EditorUIView#body body collection}; features that render floating UI
	 * in their own body collection register it too, which is what lets them display tooltips without an editor.
	 *
	 * @param bodyCollection The body collection to register.
	 * @param options Additional sources describing where this collection's tooltip-bearing UI lives.
	 * @param options.shadowRootRegistry The shadow roots hosting UI that is *not* inside `bodyCollection` (an
	 * editor's editables, toolbar, menu bar). Omit it when all tooltip-bearing UI lives inside the collection.
	 * @param options.updateEmitter An emitter whose `update` event should reposition a pinned tooltip (an editor
	 * passes its {@link module:ui/editorui/editorui~EditorUI}). Omit it when nothing moves the tooltip anchor.
	 */
	public registerBodyCollection(
		bodyCollection: BodyCollection,
		{ shadowRootRegistry, updateEmitter }: BodyCollectionRegistration = {}
	): void {
		if ( TooltipManager._registrations.has( bodyCollection ) ) {
			return;
		}

		TooltipManager._registrations.set( bodyCollection, { shadowRootRegistry, updateEmitter } );

		this.listenTo<BodyCollectionRemountEvent>( bodyCollection, 'remount', () => {
			// An unmounted collection takes the shared balloon out of the DOM with it. If a tooltip is pinned
			// there, unpin it – otherwise the manager would keep treating the disconnected balloon as pinned
			// and later reposition it (a collection that is unregistered instead gets the same treatment, see
			// #unregisterBodyCollection). When nothing is pinned the balloon is merely idle here; do not unpin
			// then, as that would cancel a pending pin queued by another live registrant.
			if ( !bodyCollection.mountTarget && bodyCollection.has( this.balloonPanelView ) && this._currentElementWithTooltip ) {
				this._unpinTooltip();
			}

			this._rebuild();
		} );

		if ( shadowRootRegistry ) {
			this.listenTo( shadowRootRegistry, 'add', () => this._rebuild() );
			this.listenTo( shadowRootRegistry, 'remove', () => this._rebuild() );
		}

		this._rebuild();
	}

	/**
	 * Reverts {@link #registerBodyCollection}: stops hosting the shared balloon in the given collection and
	 * drops the listeners set up for it. Pulls the shared balloon out first, so it never dangles in a collection
	 * that is going away.
	 *
	 * @param bodyCollection The body collection to unregister.
	 */
	public unregisterBodyCollection( bodyCollection: BodyCollection ): void {
		const registration = TooltipManager._registrations.get( bodyCollection );

		if ( !registration ) {
			return;
		}

		TooltipManager._registrations.delete( bodyCollection );

		this.stopListening( bodyCollection );

		if ( registration.shadowRootRegistry ) {
			this.stopListening( registration.shadowRootRegistry );
		}

		// Only when no other registration still uses it: emitters can be shared (an editor and a feature hosting
		// its own overlay layer both follow the editor's UI update), and `stopListening()` drops every listener on
		// the emitter, not just the ones set up for this registration – which would leave a tooltip pinned by a
		// still-live registrant stranded at its old position.
		if ( registration.updateEmitter && !this._getUpdateEmitters().has( registration.updateEmitter ) ) {
			this.stopListening( registration.updateEmitter );
		}

		if ( bodyCollection.has( this.balloonPanelView ) ) {
			// If a tooltip is currently pinned, it uses this shared balloon, which lives here – so unpin it first,
			// otherwise the manager would keep treating the about-to-be-detached balloon as pinned and later
			// reposition it. When nothing is pinned the balloon is merely idle here (left after an earlier
			// tooltip); do not unpin then, as that would cancel a pending pin queued by another live registrant.
			if ( this._currentElementWithTooltip ) {
				this._unpinTooltip();
			}

			bodyCollection.remove( this.balloonPanelView );
		}

		this._rebuild();
	}

	/**
	 * Returns the distinct `update` emitters of all registered body collections.
	 *
	 * Deduplicated, because an emitter can be shared by several registrations (an editor and a feature hosting its
	 * own overlay layer both follow the editor's UI update) while listeners are attached per emitter, not per
	 * registration – listening once per registration would reposition a pinned tooltip several times per update.
	 */
	private _getUpdateEmitters(): Set<Emitter> {
		const updateEmitters = new Set<Emitter>();

		for ( const { updateEmitter } of TooltipManager._registrations.values() ) {
			if ( updateEmitter ) {
				updateEmitters.add( updateEmitter );
			}
		}

		return updateEmitters;
	}

	/**
	 * Rebuilds {@link #_bodyCollectionByTree} from {@link module:ui/tooltipmanager~TooltipManager._registrations}: every registered
	 * collection claims the DOM tree it is mounted in, and – for editors – every shadow root its registry reports (ancestor-inclusive,
	 * so nested and decoupled trees resolve too). Then re-syncs the per-shadow-root listeners.
	 */
	private _rebuild(): void {
		const map = new Map<Document | ShadowRoot, BodyCollection>();

		// When several registrants claim the same tree (for example two light-DOM editors both mounted in
		// `document.body`), the first one registered wins, so the choice is stable and matches the fallback
		// order. Registrants are iterated in registration order.
		const claim = ( tree: Document | ShadowRoot, bodyCollection: BodyCollection ) => {
			if ( !map.has( tree ) ) {
				map.set( tree, bodyCollection );
			}
		};

		for ( const [ bodyCollection, { shadowRootRegistry } ] of TooltipManager._registrations ) {
			const mountTarget = bodyCollection.mountTarget;

			if ( mountTarget ) {
				claim( mountTarget.getRootNode() as Document | ShadowRoot, bodyCollection );
			}

			if ( shadowRootRegistry ) {
				for ( const root of shadowRootRegistry.getShadowRoots() ) {
					claim( root, bodyCollection );
				}
			}
		}

		this._bodyCollectionByTree = map;

		this._resyncShadowRootListeners();
	}

	/**
	 * Returns {@link #balloonPanelView} {@link module:utils/dom/position~PositioningFunction positioning functions} for a given position
	 * name.
	 *
	 * @param position Name of the position (`s`, `se`, `sw`, `n`, `e`, or `w`).
	 * @returns Positioning functions to be used by the {@link #balloonPanelView}.
	 */
	public static getPositioningFunctions( position: TooltipPosition ): Array<PositioningFunction> {
		const defaultPositions = TooltipManager.defaultBalloonPositions;

		return {
			// South is most popular. We can use positioning heuristics to avoid clipping by the viewport with the sane fallback.
			s: [
				defaultPositions.southArrowNorth,
				defaultPositions.southArrowNorthEast,
				defaultPositions.southArrowNorthWest
			],
			n: [ defaultPositions.northArrowSouth ],
			e: [ defaultPositions.eastArrowWest ],
			w: [ defaultPositions.westArrowEast ],
			sw: [ defaultPositions.southArrowNorthEast ],
			se: [ defaultPositions.southArrowNorthWest ]
		}[ position ];
	}

	/**
	 * Handles hiding tooltips on `keydown` in DOM.
	 *
	 * @param evt An object containing information about the fired event.
	 * @param domEvent The DOM event.
	 */
	private _onKeyDown( evt: EventInfo, domEvent: KeyboardEvent ) {
		if ( domEvent.key === 'Escape' && this._currentElementWithTooltip ) {
			this._unpinTooltip();
			domEvent.stopPropagation();
		}
	}

	/**
	 * Handles displaying tooltips on `mouseenter` and `focus` in DOM.
	 *
	 * @param evt An object containing information about the fired event.
	 * @param domEvent The DOM event.
	 */
	private _onEnterOrFocus( evt: EventInfo, domEvent: any ) {
		// A `composed` event (`focus`/`blur`; on old browsers also `mouseenter`/`mouseleave`, see
		// #_resyncShadowRootListeners) that originates inside a tracked shadow root reaches this listener too
		// when it is the one attached to `document`, but with its target retargeted to the shadow host —
		// useless here. Nothing is lost by bailing out: the capture phase runs outwards-in, so the listener
		// attached to that shadow root runs *after* this one and sees the real target. Without this, the
		// outer listener would act on the wrong element, and both would act on the same event.
		if ( isShadowHostOf( domEvent.target, this._shadowRoots ) ) {
			return;
		}

		const { target } = domEvent;
		const elementWithTooltipAttribute = getDescendantWithTooltip( target );

		// Abort when there's no descendant needing tooltip.
		if ( !elementWithTooltipAttribute ) {
			// The pointer moved onto the tooltip balloon itself, so keep the tooltip visible by cancelling the
			// unpin that the preceding `mouseleave` has just scheduled. This is checked on `mouseenter`, where
			// `target` is the balloon, and not on that `mouseleave`, where `relatedTarget` gets retargeted to a
			// shadow host standing for every panel in the balloon's tree and so cannot identify the balloon.
			if ( evt.name === 'mouseenter' && containsNode( this.balloonPanelView.element!, target ) ) {
				this._unpinTooltipDebounced.cancel();

				return;
			}

			// Unpin if element is focused, regardless of whether it contains a label or not.
			// It also prevents tooltips from overlapping the menu bar
			if ( evt.name === 'focus' ) {
				this._unpinTooltip();
			}

			return;
		}

		// Abort to avoid flashing when, for instance:
		// * a tooltip is displayed for a focused element, then the same element gets mouseentered,
		// * a tooltip is displayed for an element via mouseenter, then the focus moves to the same element.
		if ( elementWithTooltipAttribute === this._currentElementWithTooltip ) {
			this._unpinTooltipDebounced.cancel();

			return;
		}

		this._unpinTooltip();

		// The tooltip should be pinned immediately when the element gets focused using keyboard.
		// If it is focused using the mouse, the tooltip should be pinned after a delay to prevent flashing.
		// See https://github.com/ckeditor/ckeditor5/issues/16383
		// Also, if the element has an attribute `data-cke-tooltip-instant`, the tooltip should be pinned immediately.
		// This is useful for elements that have their content partially hidden (e.g. a long text in a small container)
		// and should show a tooltip on hover, like merge field.
		if (
			evt.name === 'focus' && !elementWithTooltipAttribute.matches( ':hover' ) ||
			elementWithTooltipAttribute.matches( '[data-cke-tooltip-instant]' )
		) {
			this._pinTooltip( elementWithTooltipAttribute, getTooltipData( elementWithTooltipAttribute ) );
		} else {
			this._pinTooltipDebounced( elementWithTooltipAttribute, getTooltipData( elementWithTooltipAttribute ) );
		}
	}

	/**
	 * Handles hiding tooltips on `mouseleave` and `blur` in DOM.
	 *
	 * @param evt An object containing information about the fired event.
	 * @param domEvent The DOM event.
	 */
	private _onLeaveOrBlur( evt: EventInfo, domEvent: any ) {
		// Retargeted event seen by an outer listener, see the same guard in #_onEnterOrFocus.
		if ( isShadowHostOf( domEvent.target, this._shadowRoots ) ) {
			return;
		}

		const { target, relatedTarget } = domEvent;

		if ( evt.name === 'mouseleave' ) {
			// Don't act when the event does not concern a DOM element (e.g. a mouseleave out of an entire document),
			if ( !isElement( target ) ) {
				return;
			}

			const balloonElement = this.balloonPanelView.element;

			// Only an unambiguous `relatedTarget` counts here. When the balloon lives in another shadow tree than
			// `target`, `relatedTarget` is retargeted to that tree's host, which stands for every panel inside it
			// — dropdowns and other balloons included — so it cannot be trusted to mean the balloon. Such a case
			// falls through to the debounced unpin below, which the `mouseenter` on the balloon then cancels.
			const isEnteringBalloon = !!balloonElement && containsNode( balloonElement, relatedTarget );
			const isLeavingBalloon = !isEnteringBalloon && target === balloonElement;

			// Do not hide the tooltip when the user moves the cursor over it.
			if ( isEnteringBalloon ) {
				this._unpinTooltipDebounced.cancel();

				return;
			}

			// If a tooltip is currently visible, don't act for a targets other than the one it is attached to.
			// The only exception is leaving balloon, in this scenario tooltip should be closed.
			// For instance, a random mouseleave far away in the page should not unpin the tooltip that was pinned because
			// of a previous focus. Only leaving the same element should hide the tooltip.
			if ( !isLeavingBalloon && this._currentElementWithTooltip && target !== this._currentElementWithTooltip ) {
				return;
			}

			const descendantWithTooltip = getDescendantWithTooltip( target );
			const relatedDescendantWithTooltip = getDescendantWithTooltip( relatedTarget );

			// Unpin when the mouse was leaving element with a tooltip to a place which does not have or has a different tooltip.
			// Note that this should happen whether the tooltip is already visible or not, for instance,
			// it could be invisible but queued (debounced): it should get canceled.
			if ( isLeavingBalloon || ( descendantWithTooltip && descendantWithTooltip !== relatedDescendantWithTooltip ) ) {
				this._pinTooltipDebounced.cancel();

				// If the currently visible tooltip is instant, unpin it immediately.
				if (
					this._currentElementWithTooltip && this._currentElementWithTooltip.matches( '[data-cke-tooltip-instant]' ) ||
					descendantWithTooltip && descendantWithTooltip.matches( '[data-cke-tooltip-instant]' )
				) {
					this._unpinTooltip();
				} else {
					this._unpinTooltipDebounced();
				}
			}
		} else {
			// If a tooltip is currently visible, don't act for a targets other than the one it is attached to.
			// For instance, a random blur in the web page should not unpin the tooltip that was pinned because of a previous mouseenter.
			if ( this._currentElementWithTooltip && target !== this._currentElementWithTooltip ) {
				return;
			}

			// Note that unpinning should happen whether the tooltip is already visible or not, for instance, it could be invisible but
			// queued (debounced): it should get canceled (e.g. quick focus then quick blur using the keyboard).
			this._pinTooltipDebounced.cancel();
			this._unpinTooltipDebounced();
		}
	}

	/**
	 * Attaches or detaches listeners on shadow roots so they match the shadow roots that host tooltip-bearing UI
	 * exactly, i.e. the shadow-root keys of {@link #_bodyCollectionByTree}.
	 *
	 * The listeners duplicate the ones on `document` for two different reasons:
	 *
	 * * `mouseenter`, `mouseleave` and `scroll` are not `composed`, so their event path ends at the shadow root
	 * they originated in and the `document` listeners never see them at all. Here the per-root listener is what
	 * delivers the event.
	 * * `focus` and `blur` are `composed`, so the capturing `document` listeners do see them (the capture phase
	 * walks the whole composed path even though these events do not bubble) — but with `target` retargeted to
	 * the shadow host, which is useless for `getDescendantWithTooltip()`. Here the per-root listener is
	 * what provides the real target. It cannot be replaced by reading `composedPath()[0]` on `document`,
	 * because that path is truncated at the boundary of a `closed` root.
	 *
	 * Since the capture phase runs outwards-in, the `document` listener fires *before* these; see the
	 * `isShadowHostOf()` guards in {@link #_onEnterOrFocus} and {@link #_onLeaveOrBlur}, which make the
	 * outer listeners step aside for the innermost one.
	 */
	private _resyncShadowRootListeners(): void {
		const currentRoots = new Set<ShadowRoot>();

		for ( const tree of this._bodyCollectionByTree.keys() ) {
			if ( isShadowRoot( tree ) ) {
				currentRoots.add( tree );
			}
		}

		for ( const root of this._shadowRoots ) {
			if ( !currentRoots.has( root ) ) {
				this.stopListening( root );
				this._shadowRoots.delete( root );
			}
		}

		for ( const root of currentRoots ) {
			if ( this._shadowRoots.has( root ) ) {
				continue;
			}

			// Not `composed` — the `document` listeners never receive these from inside a shadow root.
			this.listenTo( root, 'mouseenter', this._onEnterOrFocus.bind( this ), { useCapture: true } );
			this.listenTo( root, 'mouseleave', this._onLeaveOrBlur.bind( this ), { useCapture: true } );
			this.listenTo( root, 'scroll', this._onScroll.bind( this ), { useCapture: true } );

			// `composed`, so the `document` listeners do receive these — but with a retargeted `target`.
			// These see the real one.
			this.listenTo( root, 'focus', this._onEnterOrFocus.bind( this ), { useCapture: true } );
			this.listenTo( root, 'blur', this._onLeaveOrBlur.bind( this ), { useCapture: true } );

			this._shadowRoots.add( root );
		}
	}

	/**
	 * Handles hiding tooltips on `scroll` in DOM.
	 *
	 * @param evt An object containing information about the fired event.
	 * @param domEvent The DOM event.
	 */
	private _onScroll( evt: unknown, { target }: any ) {
		// No tooltip, no reason to react on scroll.
		if ( !this._currentElementWithTooltip ) {
			return;
		}

		// When scrolling a container that has both the balloon and the current element (common ancestor), the balloon can remain
		// visible (e.g. scrolling ≤body>). Otherwise, to avoid glitches (clipping, lagging) better just hide the tooltip.
		// Also, don't do anything when scrolling an unrelated DOM element that has nothing to do with the current element and the balloon.
		if (
			containsNode( target, this.balloonPanelView.element ) &&
			containsNode( target, this._currentElementWithTooltip )
		) {
			return;
		}

		this._unpinTooltip();
	}

	/**
	 * Pins the tooltip to a specific DOM element.
	 *
	 * @param targetDomElement Element to be pinned to.
	 * @param options Options for the tooltip.
	 * @param options.text Text of the tooltip to display.
	 * @param options.position The position of the tooltip.
	 * @param options.cssClass Additional CSS class of the balloon with the tooltip.
	 */
	private _pinTooltip(
		targetDomElement: HTMLElement,
		{ text, position, cssClass }: TooltipData
	): void {
		this._unpinTooltip();

		// Without a registered body collection to host it, the tooltip has nowhere to render, so bail out.
		if ( !this._moveBalloonToConnectedBodyCollection( targetDomElement ) ) {
			return;
		}

		this.tooltipTextView.text = text;

		this.balloonPanelView.class = [ BALLOON_CLASS, cssClass ]
			.filter( className => className )
			.join( ' ' );

		// Ensure that all changes to the tooltip are set before pinning it.
		// Setting class or text after pinning can cause the tooltip to be pinned in the wrong position.
		// It happens especially often when tooltip has class modified (like adding `ck-tooltip_multi-line`).
		// See https://github.com/ckeditor/ckeditor5/issues/16365
		this.balloonPanelView.pin( {
			target: targetDomElement,
			positions: TooltipManager.getPositioningFunctions( position )
		} );

		this._mutationObserver!.attach( targetDomElement );

		// Start responding to changes in editor UI or content layout. For instance, when collaborators change content
		// and a contextual toolbar attached to a content starts to move (and so should move the tooltip).
		// Note: Using low priority to let other listeners that position contextual toolbars etc. to react first.
		for ( const updateEmitter of this._getUpdateEmitters() ) {
			this.listenTo( updateEmitter, 'update', this._updateTooltipPosition.bind( this ), { priority: 'low' } );
		}

		this._currentElementWithTooltip = targetDomElement;
		this._currentTooltipPosition = position;
	}

	/**
	 * Moves the shared tooltip balloon into the body collection returned by {@link #_getConnectedBodyCollection},
	 * first removing it from any registered body collection that previously hosted it. The balloon is a singleton
	 * shared by every registrant, so it must belong to exactly one collection at a time; otherwise unregistering
	 * one collection would detach the shared element while another registrant still references it.
	 *
	 * @param targetDomElement The element the tooltip is being pinned to, used to prefer the body collection
	 * that hosts its DOM tree.
	 * @returns `true` if a host body collection was found (and the balloon moved into it), `false` when none is
	 * registered and the tooltip therefore cannot be shown.
	 */
	private _moveBalloonToConnectedBodyCollection( targetDomElement: HTMLElement ): boolean {
		const balloon = this.balloonPanelView;
		const targetBodyCollection = this._getConnectedBodyCollection( targetDomElement );

		if ( !targetBodyCollection ) {
			return false;
		}

		// Take the balloon out of whichever body collection hosted it before, so it never belongs to two at once.
		for ( const bodyCollection of TooltipManager._registrations.keys() ) {
			if ( bodyCollection !== targetBodyCollection && bodyCollection.has( balloon ) ) {
				bodyCollection.remove( balloon );
			}
		}

		if ( !targetBodyCollection.has( balloon ) ) {
			targetBodyCollection.add( balloon );
		}

		return true;
	}

	/**
	 * Returns the body collection the shared tooltip balloon should be pinned into. The balloon is a singleton,
	 * but each registered body collection can live in a different DOM tree (a shadow root, or a configured
	 * `ui.overlayContainer`). To keep the tooltip in the tree of the hovered element — so it is styled by that
	 * tree's sheets and not clipped by another root — the tree is looked up in {@link #_bodyCollectionByTree},
	 * which maps every tree hosting tooltip-bearing UI (a collection's own mount tree, and an editor's editable,
	 * toolbar or menu bar trees) to the collection that should host it.
	 *
	 * A body collection is mounted lazily and unmounted when its host leaves the document, and a configured
	 * `ui.overlayContainer` may be detached — a body in either state would render the balloon outside the
	 * document and hide tooltips, so the mount target must be connected, not merely set. When no connected body
	 * collection hosts the hovered element's tree, it falls back to the first connected registrant, then to the
	 * first registered one, and to `null` when nothing is registered at all.
	 *
	 * @param targetDomElement The element the tooltip is being pinned to.
	 */
	private _getConnectedBodyCollection( targetDomElement: HTMLElement ): BodyCollection | null {
		const targetRoot = targetDomElement.getRootNode() as Document | ShadowRoot;
		const owning = this._bodyCollectionByTree.get( targetRoot );

		if ( owning && owning.mountTarget && owning.mountTarget.isConnected ) {
			return owning;
		}

		for ( const bodyCollection of TooltipManager._registrations.keys() ) {
			if ( bodyCollection.mountTarget && bodyCollection.mountTarget.isConnected ) {
				return bodyCollection;
			}
		}

		return first( TooltipManager._registrations.keys() ) || null;
	}

	/**
	 * Unpins the tooltip and cancels all queued pinning.
	 */
	private _unpinTooltip() {
		this._unpinTooltipDebounced.cancel();
		this._pinTooltipDebounced.cancel();

		this.balloonPanelView.unpin();

		for ( const updateEmitter of this._getUpdateEmitters() ) {
			this.stopListening( updateEmitter, 'update' );
		}

		this._currentElementWithTooltip = null;
		this._currentTooltipPosition = null;
		this.tooltipTextView.text = '';

		this._mutationObserver!.detach();
	}

	/**
	 * Updates the position of the tooltip so it stays in sync with the element it is pinned to.
	 *
	 * Hides the tooltip when the element is no longer visible in DOM or the tooltip text was removed.
	 */
	private _updateTooltipPosition() {
		// The tooltip might get removed by focus listener triggered by the same UI `update` event.
		// See https://github.com/ckeditor/ckeditor5/pull/16363.
		if ( !this._currentElementWithTooltip ) {
			return;
		}

		const tooltipData = getTooltipData( this._currentElementWithTooltip );

		// This could happen if the tooltip was attached somewhere in a contextual content toolbar and the toolbar
		// disappeared (e.g. removed an image), or the tooltip text was removed.
		if ( !isVisible( this._currentElementWithTooltip ) || !tooltipData.text ) {
			this._unpinTooltip();

			return;
		}

		this.balloonPanelView.pin( {
			target: this._currentElementWithTooltip,
			positions: TooltipManager.getPositioningFunctions( tooltipData.position )
		} );
	}
}

export type TooltipPosition = 's' | 'n' | 'e' | 'w' | 'sw' | 'se';

/**
 * The sources describing where a {@link module:ui/tooltipmanager~TooltipManager#registerBodyCollection registered}
 * body collection's tooltip-bearing UI lives.
 */
export interface BodyCollectionRegistration {

	/**
	 * The shadow roots hosting UI that is not inside the registered body collection (an editor's editables,
	 * toolbar or menu bar). Omitted when all tooltip-bearing UI lives inside the collection.
	 */
	shadowRootRegistry?: ShadowRootRegistry;

	/**
	 * An emitter whose `update` event should reposition a pinned tooltip. Omitted when nothing moves the anchor.
	 */
	updateEmitter?: Emitter;
}

function getDescendantWithTooltip( element: HTMLElement ) {
	if ( !isElement( element ) ) {
		return null;
	}

	return element.closest( '[data-cke-tooltip-text]:not([data-cke-tooltip-disabled])' ) as HTMLElement;
}

interface TooltipData {
	text: string;
	position: TooltipPosition;
	cssClass: string;
}

function getTooltipData( element: HTMLElement ): TooltipData {
	return {
		text: element.dataset.ckeTooltipText!,
		position: ( element.dataset.ckeTooltipPosition || 's' ) as TooltipPosition,
		cssClass: element.dataset.ckeTooltipClass || ''
	};
}

// Creates a simple `MutationObserver` instance wrapper that observes changes in the tooltip-related attributes of the given element.
// Used instead of the `MutationObserver` from the engine for simplicity.
function createMutationObserver( callback: ( ...args: Array<any> ) => unknown ): MutationObserverWrapper {
	const mutationObserver = new MutationObserver( () => {
		callback();
	} );

	return {
		attach( element ) {
			mutationObserver.observe( element, {
				attributes: true,
				attributeFilter: [ 'data-cke-tooltip-text', 'data-cke-tooltip-position' ]
			} );
		},

		detach() {
			mutationObserver.disconnect();
		}
	};
}

interface MutationObserverWrapper {
	attach: ( element: Node ) => void;
	detach: () => void;
}
