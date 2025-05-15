/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/tooltipmanager
 */

import View from './view.js';
import BalloonPanelView from './panel/balloon/balloonpanelview.js';
import type { EditorUIUpdateEvent } from './editorui/editorui.js';

import {
	DomEmitterMixin,
	first,
	global,
	isVisible,
	type EventInfo,
	type PositioningFunction
} from '@ckeditor/ckeditor5-utils';

import type { Editor } from '@ckeditor/ckeditor5-core';

import { isElement, debounce, type DebouncedFunction } from 'es-toolkit/compat';

import '../theme/components/tooltip/tooltip.css';

const BALLOON_CLASS = 'ck-tooltip';

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
export default class TooltipManager extends /* #__PURE__ */ DomEmitterMixin() {
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
	public static defaultBalloonPositions = /* #__PURE__ */ BalloonPanelView.generatePositions( {
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
	private _pinTooltipDebounced!: DebouncedFunction<( targetDomElement: HTMLElement, data: TooltipData ) => void>;

	/**
	 * A debounced version of {@link #_unpinTooltip}. Tooltips hide with a delay to allow hovering of their titles.
	 */
	private _unpinTooltipDebounced!: DebouncedFunction<VoidFunction>;

	private readonly _watchdogExcluded!: true;

	/**
	 * A set of editors the single tooltip manager instance must listen to.
	 * This is mostly to handle `EditorUI#update` listeners from individual editors.
	 */
	private static _editors = new Set<Editor>();

	/**
	 * A reference to the `TooltipManager` instance. The class is a singleton and as such,
	 * successive attempts at creating instances should return this instance.
	 */
	private static _instance: TooltipManager | null = null;

	/**
	 * Creates an instance of the tooltip manager.
	 */
	constructor( editor: Editor ) {
		super();

		TooltipManager._editors.add( editor );

		// TooltipManager must be a singleton. Multiple instances would mean multiple tooltips attached
		// to the same DOM element with data-cke-tooltip-* attributes.
		if ( TooltipManager._instance ) {
			return TooltipManager._instance;
		}

		TooltipManager._instance = this;

		this.tooltipTextView = new View( editor.locale ) as any;
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

		this.balloonPanelView = new BalloonPanelView( editor.locale );
		this.balloonPanelView.class = BALLOON_CLASS;
		this.balloonPanelView.content.add( this.tooltipTextView );

		this._mutationObserver = createMutationObserver( () => {
			this._updateTooltipPosition();
		} );

		this._pinTooltipDebounced = debounce( this._pinTooltip, 600 );
		this._unpinTooltipDebounced = debounce( this._unpinTooltip, 400 );

		this.listenTo( global.document, 'keydown', this._onKeyDown.bind( this ), { useCapture: true } );
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
	 * Destroys the tooltip manager.
	 *
	 * **Note**: The manager singleton cannot be destroyed until all editors that use it are destroyed.
	 *
	 * @param editor The editor the manager was created for.
	 */
	public destroy( editor: Editor ): void {
		const editorBodyViewCollection = editor.ui.view && editor.ui.view.body;

		TooltipManager._editors.delete( editor );
		this.stopListening( editor.ui );

		// Prevent the balloon panel from being destroyed in the EditorUI#destroy() cascade. It should be destroyed along
		// with the last editor only (https://github.com/ckeditor/ckeditor5/issues/12602).
		if ( editorBodyViewCollection && editorBodyViewCollection.has( this.balloonPanelView ) ) {
			editorBodyViewCollection.remove( this.balloonPanelView );
		}

		if ( !TooltipManager._editors.size ) {
			this._unpinTooltip();
			this.balloonPanelView.destroy();
			this.stopListening();

			TooltipManager._instance = null;
		}
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
	private _onEnterOrFocus( evt: EventInfo, { target }: any ) {
		const elementWithTooltipAttribute = getDescendantWithTooltip( target );

		// Abort when there's no descendant needing tooltip.
		if ( !elementWithTooltipAttribute ) {
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
	private _onLeaveOrBlur( evt: EventInfo, { target, relatedTarget }: any ) {
		if ( evt.name === 'mouseleave' ) {
			// Don't act when the event does not concern a DOM element (e.g. a mouseleave out of an entire document),
			if ( !isElement( target ) ) {
				return;
			}

			const balloonElement = this.balloonPanelView.element;
			const isEnteringBalloon = balloonElement && ( balloonElement === relatedTarget || balloonElement.contains( relatedTarget ) );
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
		if ( target.contains( this.balloonPanelView.element ) && target.contains( this._currentElementWithTooltip ) ) {
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

		// Use the body collection of the first editor.
		const bodyViewCollection = first( TooltipManager._editors.values() )!.ui.view.body;

		if ( !bodyViewCollection.has( this.balloonPanelView ) ) {
			bodyViewCollection.add( this.balloonPanelView );
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
		for ( const editor of TooltipManager._editors ) {
			this.listenTo<EditorUIUpdateEvent>( editor.ui, 'update', this._updateTooltipPosition.bind( this ), { priority: 'low' } );
		}

		this._currentElementWithTooltip = targetDomElement;
		this._currentTooltipPosition = position;
	}

	/**
	 * Unpins the tooltip and cancels all queued pinning.
	 */
	private _unpinTooltip() {
		this._unpinTooltipDebounced.cancel();
		this._pinTooltipDebounced.cancel();

		this.balloonPanelView.unpin();

		for ( const editor of TooltipManager._editors ) {
			this.stopListening( editor.ui, 'update' );
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
