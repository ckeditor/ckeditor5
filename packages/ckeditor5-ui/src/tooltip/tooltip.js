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
import { isElement } from 'lodash-es';
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
		const elementWithTooltipAttribute = getDescendantWithTooltip( target );

		// Abort when there's no descendant needing tooltip.
		// Abort when for instance a tooltip is displayed for a focused element, then the same element is mouseentered
		// (avoids flashing).
		if ( !elementWithTooltipAttribute || elementWithTooltipAttribute === this._currentElementWithTooltip ) {
			return;
		}

		const tooltipData = getTooltipData( elementWithTooltipAttribute );

		this._pinTooltip( elementWithTooltipAttribute, tooltipData );
	}

	/**
	 * TODO
	 *
	 * @param {*} evt
	 * @param {*} domEvt
	 * @returns
	 */
	_onLeaveOrBlur( evt, { target } ) {
		if ( !isElement( target ) || !this._currentElementWithTooltip || target !== this._currentElementWithTooltip ) {
			return;
		}

		this._unpinTooltip();
	}

	/**
	 * TODO
	 *
	 * @param {*} targetDomElement
	 * @param {*} TODO
	 */
	_pinTooltip( targetDomElement, { text, position } ) {
		this._tooltipTextView.text = text;

		// This followed by RAF is meant to restart animation. Without it, moving fast between elements with tooltip
		// would display them immediately without an animation.
		this._balloon.class = 'ck-tooltip';

		global.window.requestAnimationFrame( () => {
			this._balloon.class = 'ck-tooltip ck-tooltip_animating';
		} );

		this._balloon.pin( {
			target: targetDomElement,
			positions: Tooltip._getPositioningFunctions( position )
		} );

		this._currentElementWithTooltip = targetDomElement;
	}

	/**
	 * TODO
	 */
	_unpinTooltip() {
		this._balloon.unpin();
		this._currentElementWithTooltip = null;
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
