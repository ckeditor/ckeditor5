/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/tooltip/tooltip
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { isElement, debounce } from 'lodash-es';
import BalloonPanelView, { generatePositions } from '../panel/balloon/balloonpanelview';
import View from '../view';

import '../../theme/components/tooltip/tooltip.css';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class Tooltip extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Tooltip';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * TODO
		 */
		this._domEmitter = Object.create( DomEmitterMixin );

		/**
		 * TODO
		 */
		this._tooltipTextView = new View( this.editor.locale );
		this._tooltipTextView.set( 'text', '' );
		this._tooltipTextView.setTemplate( {
			tag: 'span',
			children: [
				{
					text: this._tooltipTextView.bindTemplate.to( 'text' )
				}
			]
		} );

		/**
		 * TODO
		 */
		this._balloon = new BalloonPanelView( this.editor.locale );
		this._balloon.class = 'ck-tooltip';
		this._balloon.content.add( this._tooltipTextView );

		editor.ui.view.body.add( this._balloon );

		/**
		 * TODO
		 */
		this._currentElementWithTooltip = null;

		/**
		 * TODO
		 */
		this._currentTooltipPosition = null;

		/**
		 * TODO
		 */
		this._pinTooltipDebounced = debounce( this._pinTooltip, 600 );

		this._domEmitter.listenTo( global.document, 'mouseleave', this._onLeaveOrBlur.bind( this ), { useCapture: true } );
		this._domEmitter.listenTo( global.document, 'blur', this._onLeaveOrBlur.bind( this ), { useCapture: true } );

		this._domEmitter.listenTo( global.document, 'mouseenter', this._onEnterOrFocus.bind( this ), { useCapture: true } );
		this._domEmitter.listenTo( global.document, 'focus', this._onEnterOrFocus.bind( this ), { useCapture: true } );
	}

	destroy() {
		this._balloon.destroy();
		this._domEmitter.stopListening();
	}

	/**
	 * TODO
	 *
	 * @param {*} evt
	 * @param {*} domEvt
	 * @returns
	 */
	_onEnterOrFocus( evt, { target } ) {
		// console.log( `[Tooltip] %c${ evt.name } %c${ logElement( target ) }`, 'color:green', 'color:black' );

		const elementWithTooltipAttribute = getDescendantWithTooltip( target );

		// Abort when there's no descendant needing tooltip.
		if ( !elementWithTooltipAttribute ) {
			// console.log( '[Tooltip] No element to display the tooltip, aborting' );

			return;
		}

		// Abort when for instance a tooltip is displayed for a focused element, then the same element is mouseentered
		// (avoids flashing).
		if ( elementWithTooltipAttribute === this._currentElementWithTooltip ) {
			// console.log( '[Tooltip] Don\'t display the tooltip for the same element. Aborting.', elementWithTooltipAttribute );

			return;
		}

		const tooltipData = getTooltipData( elementWithTooltipAttribute );

		this._unpinTooltip();

		// console.log( '%c[Tooltip] Queueing tooltip pinning...', 'font-weight: bold', tooltipData );
		this._pinTooltipDebounced( elementWithTooltipAttribute, tooltipData );
	}

	/**
	 * TODO
	 *
	 * @param {*} evt
	 * @param {*} domEvt
	 * @returns
	 */
	_onLeaveOrBlur( evt, { target, relatedTarget } ) {
		// console.log( `[Tooltip] %c${ evt.name } %c${ logElement( target ) }`, 'color:blue', 'color:black' );

		if ( evt.name === 'mouseleave' ) {
			// Don't act when the event does not concern a DOM element (e.g. a mouseleave out of an entire document),
			if ( !isElement( target ) ) {
				return;
			}

			// If a tooltip is currently visible, don't act for a targets other than the one it is attached to.
			// For instance, a random mouseleave far away in the page should not unpin the tooltip that was pinned because
			// of a previous focus.
			if ( this._currentElementWithTooltip && target !== this._currentElementWithTooltip ) {
				// console.log( '[Tooltip] Dont unpin. Event target is not the same as the current element.', { target } );

				return;
			}

			const descendantWithTooltip = getDescendantWithTooltip( target );
			const relatedDescendantWithTooltip = getDescendantWithTooltip( relatedTarget );

			// Unpin when the mouse was leaving element with a tooltip to a place which does not have or has a different tooltip.
			// Note that this should happen whether the tooltip is already visible or not, for instance, it could be invisible but queued
			// (debounced).
			if ( descendantWithTooltip && descendantWithTooltip !== relatedDescendantWithTooltip ) {
				this._unpinTooltip();
			}
		}
		else {
			// If a tooltip is currently visible, don't act for a targets other than the one it is attached to.
			// For instance, a random blur in the web page should not unpin the tooltip that was pinned because of a previous mouseenter.
			if ( this._currentElementWithTooltip && target !== this._currentElementWithTooltip ) {
				// console.log( '[Tooltip] Dont unpin. Event target is not the same as the current element.', { target } );

				return;
			}

			this._unpinTooltip();
		}
	}

	/**
	 * TODO
	 *
	 * @param {*} targetDomElement
	 * @param {*} TODO
	 */
	_pinTooltip( targetDomElement, { text, position } ) {
		// console.log( `%c[Tooltip] Pinning the tooltip after a delay, 'font-weight: bold', "${ text }"`, targetDomElement );

		this._tooltipTextView.text = text;

		this._balloon.pin( {
			target: targetDomElement,
			positions: Tooltip._getPositioningFunctions( position )
		} );

		// Start responding to changes in editor UI or content layout. For instance, when collaborators change content
		// and a contextual toolbar attached to a content starts to move (and so should move the tooltip).
		// Note: Using low priority to let other listeners that position contextual toolbars etc. to react first.
		this.listenTo( this.editor.ui, 'update', this._updateTooltipPosition.bind( this ), { priority: 'low' } );

		this._currentElementWithTooltip = targetDomElement;
		this._currentTooltipPosition = position;
	}

	/**
	 * TODO
	 */
	_unpinTooltip() {
		// console.log( '%c[Tooltip] Canceling queued tooltip pinning...', 'font-weight: bold' );
		this._pinTooltipDebounced.cancel();

		// console.log( '[Tooltip] Unpinning the tooltip' );

		this._balloon.unpin();

		this.stopListening( this.editor.ui, 'update' );

		this._currentElementWithTooltip = null;
		this._currentTooltipPosition = null;
	}

	/**
	 * TODO
	 */
	_updateTooltipPosition() {
		// This could happen if the tooltip was attached somewhere in a contextual content toolbar and the toolbar
		// disappeared (e.g. removed an image).
		if ( !this._currentElementWithTooltip ) {
			this._unpinTooltip();

			return;
		}

		this._balloon.pin( {
			target: this._currentElementWithTooltip,
			positions: Tooltip._getPositioningFunctions( this._currentTooltipPosition )
		} );
	}

	/**
	 * TODO
	 *
	 * @param {*} position
	 * @returns
	 */
	static _getPositioningFunctions( position ) {
		const defaultPositions = Tooltip.defaultPositions;

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

Tooltip.defaultPositions = generatePositions( {
	verticalOffset: 5,
	horizontalOffset: 18
} );

function getDescendantWithTooltip( element ) {
	if ( !isElement( element ) ) {
		return null;
	}

	return element.closest( '[data-cke-tooltip-text]:not(.ck-tooltip_hidden)' );
}

function getTooltipData( element ) {
	return {
		text: element.dataset.ckeTooltipText,
		position: element.dataset.ckeTooltipPosition || 's'
	};
}

// function logElement( element ) {
// 	if ( isElement( element ) ) {
// 		return `${ element.tagName }.${ Array.from( element.classList ).join( '.' ) }`;
// 	} else {
// 		return 'Not a DOM element';
// 	}
// }
