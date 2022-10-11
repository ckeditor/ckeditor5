/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/tooltipmanager
 */

import View from './view';
import BalloonPanelView, { generatePositions } from './panel/balloon/balloonpanelview';

import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import { global, isVisible, mix, first } from '@ckeditor/ckeditor5-utils';
import { isElement, debounce } from 'lodash-es';

import '../theme/components/tooltip/tooltip.css';

const BALLOON_CLASS = 'ck-tooltip';

/**
 * A tooltip manager class for the UI of the editor.
 *
 * **Note**: Most likely you do not have to use the `TooltipManager` API listed below in order to display tooltips. Popular
 * {@glink framework/guides/architecture/ui-library UI components} support tooltips out-of-the-box via observable properties
 * (see {@link module:ui/button/buttonview~ButtonView#tooltip} and {@link module:ui/button/buttonview~ButtonView#tooltipPosition}).
 *
 * # Displaying tooltips
 *
 * To display a tooltip, set `data-cke-tooltip-text` attribute on any DOM element:
 *
 *		domElement.dataset.ckeTooltipText = 'My tooltip';
 *
 * The tooltip will show up whenever the user moves the mouse over the element or the element gets focus in DOM.
 *
 * # Positioning tooltips
 *
 * To change the position of the tooltip, use the `data-cke-tooltip-position` attribute (`s`, `se`, `sw`, `n`, `e`, or `w`):
 *
 *		domElement.dataset.ckeTooltipText = 'Tooltip to the north';
 *		domElement.dataset.ckeTooltipPosition = 'n';
 *
 * # Disabling tooltips
 *
 * In order to disable the tooltip  temporarily, use the `data-cke-tooltip-disabled` attribute:
 *
 *		domElement.dataset.ckeTooltipText = 'Disabled. For now.';
 *		domElement.dataset.ckeTooltipDisabled = 'true';
 *
 *
 * # Styling tooltips
 *
 * By default, the tooltip has `.ck-tooltip` class and its text inner `.ck-tooltip__text`.
 *
 * If your tooltip requires custom styling, using `data-cke-tooltip-class` attribute will add additional class to the balloon
 * displaying the tooltip:
 *
 *		domElement.dataset.ckeTooltipText = 'Tooltip with a red text';
 *		domElement.dataset.ckeTooltipClass = 'my-class';
 *
 *		.ck.ck-tooltip.my-class { color: red }
 *
 * **Note**: This class is a singleton. All editor instances re-use the same instance loaded by
 * {@link module:core/editor/editorui~EditorUI} of the first editor.
 *
 * @mixes module:utils/domemittermixin~DomEmitterMixin
 */
export default class TooltipManager {
	/**
	 * Creates an instance of the tooltip manager.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 */
	constructor( editor ) {
		TooltipManager._editors.add( editor );

		// TooltipManager must be a singleton. Multiple instances would mean multiple tooltips attached
		// to the same DOM element with data-cke-tooltip-* attributes.
		if ( TooltipManager._instance ) {
			return TooltipManager._instance;
		}

		TooltipManager._instance = this;

		/**
		 * The view rendering text of the tooltip.
		 *
		 * @readonly
		 * @member {module:ui/view~View} #tooltipTextView
		 */
		this.tooltipTextView = new View( editor.locale );
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

		/**
		 * The instance of the balloon panel that renders and positions the tooltip.
		 *
		 * @readonly
		 * @member {module:ui/panel/balloon/balloonpanelview~BalloonPanelView} #balloonPanelView
		 */
		this.balloonPanelView = new BalloonPanelView( editor.locale );
		this.balloonPanelView.class = BALLOON_CLASS;
		this.balloonPanelView.content.add( this.tooltipTextView );

		/**
		 * Stores the reference to the DOM element the tooltip is attached to. `null` when there's no tooltip
		 * in the UI.
		 *
		 * @private
		 * @readonly
		 * @member {HTMLElement|null} #_currentElementWithTooltip
		 */
		this._currentElementWithTooltip = null;

		/**
		 * Stores the current tooltip position. `null` when there's no tooltip in the UI.
		 *
		 * @private
		 * @readonly
		 * @member {String|null} #_currentTooltipPosition
		 */
		this._currentTooltipPosition = null;

		/**
		 * A debounced version of {@link #_pinTooltip}. Tooltips show with a delay to avoid flashing and
		 * to improve the UX.
		 *
		 * @private
		 * @readonly
		 * @member {Function} #_pinTooltipDebounced
		 */
		this._pinTooltipDebounced = debounce( this._pinTooltip, 600 );

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
	 * @param {module:core/editor/editor~Editor} editor The editor the manager was created for.
	 */
	destroy( editor ) {
		TooltipManager._editors.delete( editor );
		this.stopListening( editor.ui );

		if ( !TooltipManager._editors.size ) {
			this._unpinTooltip();
			this.balloonPanelView.destroy();
			this.stopListening();

			TooltipManager._instance = null;
		}
	}

	/**
	 * Handles displaying tooltips on `mouseenter` and `focus` in DOM.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
	 * @param {Event} domEvent The DOM event.
	 */
	_onEnterOrFocus( evt, { target } ) {
		const elementWithTooltipAttribute = getDescendantWithTooltip( target );

		// Abort when there's no descendant needing tooltip.
		if ( !elementWithTooltipAttribute ) {
			return;
		}

		// Abort to avoid flashing when, for instance:
		// * a tooltip is displayed for a focused element, then the same element gets mouseentered,
		// * a tooltip is displayed for an element via mouseenter, then the focus moves to the same element.
		if ( elementWithTooltipAttribute === this._currentElementWithTooltip ) {
			return;
		}

		this._unpinTooltip();

		this._pinTooltipDebounced( elementWithTooltipAttribute, getTooltipData( elementWithTooltipAttribute ) );
	}

	/**
	 * Handles hiding tooltips on `mouseleave` and `blur` in DOM.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
	 * @param {Event} domEvent The DOM event.
	 */
	_onLeaveOrBlur( evt, { target, relatedTarget } ) {
		if ( evt.name === 'mouseleave' ) {
			// Don't act when the event does not concern a DOM element (e.g. a mouseleave out of an entire document),
			if ( !isElement( target ) ) {
				return;
			}

			// If a tooltip is currently visible, don't act for a targets other than the one it is attached to.
			// For instance, a random mouseleave far away in the page should not unpin the tooltip that was pinned because
			// of a previous focus. Only leaving the same element should hide the tooltip.
			if ( this._currentElementWithTooltip && target !== this._currentElementWithTooltip ) {
				return;
			}

			const descendantWithTooltip = getDescendantWithTooltip( target );
			const relatedDescendantWithTooltip = getDescendantWithTooltip( relatedTarget );

			// Unpin when the mouse was leaving element with a tooltip to a place which does not have or has a different tooltip.
			// Note that this should happen whether the tooltip is already visible or not, for instance, it could be invisible but queued
			// (debounced): it should get canceled.
			if ( descendantWithTooltip && descendantWithTooltip !== relatedDescendantWithTooltip ) {
				this._unpinTooltip();
			}
		}
		else {
			// If a tooltip is currently visible, don't act for a targets other than the one it is attached to.
			// For instance, a random blur in the web page should not unpin the tooltip that was pinned because of a previous mouseenter.
			if ( this._currentElementWithTooltip && target !== this._currentElementWithTooltip ) {
				return;
			}

			// Note that unpinning should happen whether the tooltip is already visible or not, for instance, it could be invisible but
			// queued (debounced): it should get canceled (e.g. quick focus then quick blur using the keyboard).
			this._unpinTooltip();
		}
	}

	/**
	 * Handles hiding tooltips on `scroll` in DOM.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
	 * @param {Event} domEvent The DOM event.
	 */
	_onScroll( evt, { target } ) {
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
	 * @private
	 * @param {Element} targetDomElement
	 * @param {Object} options
	 * @param {String} options.text Text of the tooltip to display.
	 * @param {String} options.position The position of the tooltip.
	 * @param {String} options.cssClass Additional CSS class of the balloon with the tooltip.
	 */
	_pinTooltip( targetDomElement, { text, position, cssClass } ) {
		// Use the body collection of the first editor.
		const bodyViewCollection = first( TooltipManager._editors.values() ).ui.view.body;

		if ( !bodyViewCollection.has( this.balloonPanelView ) ) {
			bodyViewCollection.add( this.balloonPanelView );
		}

		this.tooltipTextView.text = text;

		this.balloonPanelView.pin( {
			target: targetDomElement,
			positions: TooltipManager.getPositioningFunctions( position )
		} );

		this.balloonPanelView.class = [ BALLOON_CLASS, cssClass ]
			.filter( className => className )
			.join( ' ' );

		// Start responding to changes in editor UI or content layout. For instance, when collaborators change content
		// and a contextual toolbar attached to a content starts to move (and so should move the tooltip).
		// Note: Using low priority to let other listeners that position contextual toolbars etc. to react first.
		for ( const editor of TooltipManager._editors ) {
			this.listenTo( editor.ui, 'update', this._updateTooltipPosition.bind( this ), { priority: 'low' } );
		}

		this._currentElementWithTooltip = targetDomElement;
		this._currentTooltipPosition = position;
	}

	/**
	 * Unpins the tooltip and cancels all queued pinning.
	 *
	 * @private
	 */
	_unpinTooltip() {
		this._pinTooltipDebounced.cancel();

		this.balloonPanelView.unpin();

		for ( const editor of TooltipManager._editors ) {
			this.stopListening( editor.ui, 'update' );
		}

		this._currentElementWithTooltip = null;
		this._currentTooltipPosition = null;
	}

	/**
	 * Updates the position of the tooltip so it stays in sync with the element it is pinned to.
	 *
	 * Hides the tooltip when the element is no longer visible in DOM.
	 *
	 * @private
	 */
	_updateTooltipPosition() {
		// This could happen if the tooltip was attached somewhere in a contextual content toolbar and the toolbar
		// disappeared (e.g. removed an image).
		if ( !isVisible( this._currentElementWithTooltip ) ) {
			this._unpinTooltip();

			return;
		}

		this.balloonPanelView.pin( {
			target: this._currentElementWithTooltip,
			positions: TooltipManager.getPositioningFunctions( this._currentTooltipPosition )
		} );
	}

	/**
	 * Returns {@link #balloonPanelView} {@link module:utils/dom/position~PositioningFunction positioning functions} for a given position
	 * name.
	 *
	 * @static
	 * @param {String} position Name of the position (`s`, `se`, `sw`, `n`, `e`, or `w`).
	 * @returns {Array.<module:utils/dom/position~PositioningFunction>} Positioning functions to be used by the {@link #balloonPanelView}.
	 */
	static getPositioningFunctions( position ) {
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
}

mix( TooltipManager, DomEmitterMixin );

/**
 * A set of default {@link module:utils/dom/position~PositioningFunction positioning functions} used by the `TooltipManager`
 * to pin tooltips in different positions.
 *
 * @member {Object.<String,module:utils/dom/position~PositioningFunction>}
 * module:ui/tooltipmanager~TooltipManager.defaultBalloonPositions
 */
TooltipManager.defaultBalloonPositions = generatePositions( {
	heightOffset: 5,
	sideOffset: 13
} );

/**
 * A reference to the `TooltipManager` instance. The class is a singleton and as such,
 * successive attempts at creating instances should return this instance.
 *
 * @private
 * @member {module:ui/tooltipmanager~TooltipManager} module:ui/tooltipmanager~TooltipManager._instance
 */
TooltipManager._instance = null;

/**
 * An array of editors the single tooltip manager instance must listen to.
 * This is mostly to handle `EditorUI#update` listeners from individual editors.
 *
 * @private
 * @member {Set.<module:core/editor/editor~Editor>} module:ui/tooltipmanager~TooltipManager._editors
 */
TooltipManager._editors = new Set();

function getDescendantWithTooltip( element ) {
	if ( !isElement( element ) ) {
		return null;
	}

	return element.closest( '[data-cke-tooltip-text]:not([data-cke-tooltip-disabled])' );
}

function getTooltipData( element ) {
	return {
		text: element.dataset.ckeTooltipText,
		position: element.dataset.ckeTooltipPosition || 's',
		cssClass: element.dataset.ckeTooltipClass || ''
	};
}
