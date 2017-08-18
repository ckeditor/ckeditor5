/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/panel/balloon/balloonpanelview
 */

import View from '../../view';
import Template from '../../template';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import isRange from '@ckeditor/ckeditor5-utils/src/dom/isrange';
import isElement from '@ckeditor/ckeditor5-utils/src/lib/lodash/isElement';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import preventDefault from '../../bindings/preventdefault.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

const toPx = toUnit( 'px' );
const defaultLimiterElement = global.document.body;

/**
 * The balloon panel view class.
 *
 * @extends module:ui/view~View
 */
export default class BalloonPanelView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * The absolute top position of the balloon panel in pixels.
		 *
		 * @observable
		 * @default 0
		 * @member {Number} #top
		 */
		this.set( 'top', 0 );

		/**
		 * The absolute left position of the balloon panel in pixels.
		 *
		 * @observable
		 * @default 0
		 * @member {Number} #left
		 */
		this.set( 'left', 0 );

		/**
		 * Balloon panel's current position. The position name is reflected in the CSS class set
		 * to the balloon, i.e. `.ck-balloon-panel_arrow_nw` for "arrow_nw" position. The class
		 * controls the minor aspects of the balloon's visual appearance like placement
		 * of the "arrow". To support a new position, an additional CSS must be created.
		 *
		 * Default position names correspond with
		 * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions}.
		 *
		 * See {@link #attachTo} to learn about custom balloon positions.
		 *
		 * See {@link #withArrow}.
		 *
		 * @observable
		 * @default 'arrow_nw'
		 * @member {'arrow_nw'|'arrow_ne'|'arrow_sw'|'arrow_se'} #position
		 */
		this.set( 'position', 'arrow_nw' );

		/**
		 * Controls whether the balloon panel is visible or not.
		 *
		 * @observable
		 * @default false
		 * @member {Boolean} #isVisible
		 */
		this.set( 'isVisible', false );

		/**
		 * Controls whether the balloon panel has an arrow. The presence of the arrow
		 * is reflected in `ck-balloon-panel_with-arrow` CSS class.
		 *
		 * @observable
		 * @default true
		 * @member {Boolean} #withArrow
		 */
		this.set( 'withArrow', true );

		/**
		 * Additional css class added to the {#element}.
		 *
		 * @observable
		 * @member {String} #className
		 */
		this.set( 'className' );

		/**
		 * A callback that starts pining the panel when {@link #isVisible} gets
		 * `true`. Used by {@link #pin}.
		 *
		 * @private
		 * @member {Function} #_pinWhenIsVisibleCallback
		 */

		/**
		 * Collection of the child views which creates balloon panel contents.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.content = this.createCollection();

		this.template = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck-balloon-panel',
					bind.to( 'position', value => `ck-balloon-panel_${ value }` ),
					bind.if( 'isVisible', 'ck-balloon-panel_visible' ),
					bind.if( 'withArrow', 'ck-balloon-panel_with-arrow' ),
					bind.to( 'className' )
				],

				style: {
					top: bind.to( 'top', toPx ),
					left: bind.to( 'left', toPx )
				}
			},

			children: this.content,

			on: {
				// https://github.com/ckeditor/ckeditor5-ui/issues/206
				mousedown: preventDefault( this ),

				// https://github.com/ckeditor/ckeditor5-ui/issues/243
				selectstart: bind.to( evt => evt.preventDefault() )
			}
		} );
	}

	/**
	 * Shows the balloon panel.
	 *
	 * See {@link #isVisible}.
	 */
	show() {
		this.isVisible = true;
	}

	/**
	 * Hides the balloon panel.
	 *
	 * See {@link #isVisible}.
	 */
	hide() {
		this.isVisible = false;
	}

	/**
	 * Attaches the balloon panel to a specified DOM element or range with a smart heuristics.
	 *
	 * See {@link @link module:utils/dom/position~getOptimalPosition}.
	 *
	 * TODO: More docs and examples.
	 *
	 * @param {module:utils/dom/position~Options} options Positioning options compatible with
	 * {@link module:utils/dom/position~getOptimalPosition}. Default `positions` array is
	 * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions}.
	 */
	attachTo( options ) {
		this.show();

		const defaultPositions = BalloonPanelView.defaultPositions;
		const positionOptions = Object.assign( {}, {
			element: this.element,
			positions: [
				defaultPositions.southArrowNorthWest,
				defaultPositions.southArrowNorthEast,
				defaultPositions.northArrowSouthWest,
				defaultPositions.northArrowSouthEast
			],
			limiter: defaultLimiterElement,
			fitInViewport: true
		}, options );

		const { top, left, name: position } = getOptimalPosition( positionOptions );

		Object.assign( this, { top, left, position } );
	}

	/**
	 * Works the same way as {module:ui/panel/balloon/balloonpanelview~BalloonPanelView.attachTo}
	 * except that the position of the panel is continuously updated when any ancestor of the
	 * {@link module:utils/dom/position~Options#target} or {@link module:utils/dom/position~Options#limiter}
	 * is being scrolled or when the browser window is being resized.
	 *
	 * Thanks to this, the panel always sticks to the {@link module:utils/dom/position~Options#target}.
	 *
	 * See: {@link #unpin}.
	 *
	 * @param {module:utils/dom/position~Options} options Positioning options compatible with
	 * {@link module:utils/dom/position~getOptimalPosition}. Default `positions` array is
	 * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions}.
	 */
	pin( options ) {
		this.unpin();

		this._pinWhenIsVisibleCallback = () => {
			if ( this.isVisible ) {
				this._startPinning( options );
			} else {
				this._stopPinning();
			}
		};

		this._startPinning( options );

		// Control the state of the listeners depending on whether the panel is visible
		// or not.
		// TODO: Use on() (https://github.com/ckeditor/ckeditor5-utils/issues/144).
		this.listenTo( this, 'change:isVisible', this._pinWhenIsVisibleCallback );
	}

	/**
	 * Stops pinning the panel, as set up by {@link #pin}.
	 */
	unpin() {
		if ( this._pinWhenIsVisibleCallback ) {
			// Deactivate listeners attached by pin().
			this._stopPinning();

			// Deactivate the panel pin() control logic.
			// TODO: Use off() (https://github.com/ckeditor/ckeditor5-utils/issues/144).
			this.stopListening( this, 'change:isVisible', this._pinWhenIsVisibleCallback );

			this._pinWhenIsVisibleCallback = null;

			this.hide();
		}
	}

	/**
	 * Starts managing the pinned state of the panel. See {@link #pin}.
	 *
	 * @private
	 * @param {module:utils/dom/position~Options} options Positioning options compatible with
	 * {@link module:utils/dom/position~getOptimalPosition}.
	 */
	_startPinning( options ) {
		this.attachTo( options );

		const targetElement = getDomElement( options.target );
		const limiterElement = options.limiter ? getDomElement( options.limiter ) : defaultLimiterElement;

		// Then we need to listen on scroll event of eny element in the document.
		this.listenTo( global.document, 'scroll', ( evt, domEvt ) => {
			const scrollTarget = domEvt.target;

			// The position needs to be updated if the positioning target is within the scrolled element.
			const isWithinScrollTarget = targetElement && scrollTarget.contains( targetElement );

			// The position needs to be updated if the positioning limiter is within the scrolled element.
			const isLimiterWithinScrollTarget = limiterElement && scrollTarget.contains( limiterElement );

			// The positioning target and/or limiter can be a Rect, object etc..
			// There's no way to optimize the listener then.
			if ( isWithinScrollTarget || isLimiterWithinScrollTarget || !targetElement || !limiterElement ) {
				this.attachTo( options );
			}
		}, { useCapture: true } );

		// We need to listen on window resize event and update position.
		this.listenTo( global.window, 'resize', () => {
			this.attachTo( options );
		} );
	}

	/**
	 * Stops managing the pinned state of the panel. See {@link #pin}.
	 *
	 * @private
	 */
	_stopPinning() {
		this.stopListening( global.document, 'scroll' );
		this.stopListening( global.window, 'resize' );
	}
}

// Returns the DOM element for given object or null, if there's none,
// e.g. when passed object is a Rect instance or so.
//
// @private
// @param {*} object
// @returns {HTMLElement|null}
function getDomElement( object ) {
	if ( isElement( object ) ) {
		return object;
	}

	if ( isRange( object ) ) {
		return object.commonAncestorContainer;
	}

	if ( typeof object == 'function' ) {
		return getDomElement( object() );
	}

	return null;
}

/**
 * A horizontal offset of the arrow tip from the edge of the balloon. Controlled by CSS.
 *
 *		 +-----|---------...
 *		 |     |
 *		 |     |
 *		 |     |
 *		 |     |
 *		 +--+  |  +------...
 *		     \ | /
 *		      \|/
 *	    >|-----|<---------------- horizontal offset
 *
 * @default 30
 * @member {Number} module:ui/panel/balloon/balloonpanelview~BalloonPanelView.arrowHorizontalOffset
 */
BalloonPanelView.arrowHorizontalOffset = 30;

/**
 * A vertical offset of the arrow from the edge of the balloon. Controlled by CSS.
 *
 *		 +-------------...
 *		 |
 *		 |
 *		 |                      /-- vertical offset
 *		 |                     V
 *		 +--+    +-----...    ---------
 *		     \  /              |
 *		      \/               |
 *		-------------------------------
 *		                       ^
 *
 * @default 15
 * @member {Number} module:ui/panel/balloon/balloonpanelview~BalloonPanelView.arrowVerticalOffset
 */
BalloonPanelView.arrowVerticalOffset = 15;

/**
 * A default set of positioning functions used by the balloon panel view
 * when attaching using {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView#attachTo} method.
 *
 * The available positioning functions are as follow:
 *
 * **North**
 *
 * * `northArrowSouth`
 *
 * 		+-----------------+
 * 		|     Balloon     |
 * 		+-----------------+
 * 		         V
 * 		    [ Target ]
 *
 * * `northArrowSouthEast`
 *
 * 		+-----------------+
 * 		|     Balloon     |
 * 		+-----------------+
 * 		               V
 * 		          [ Target ]
 *
 * * `northArrowSouthWest`
 *
 * 		  +-----------------+
 * 		  |     Balloon     |
 * 		  +-----------------+
 * 		     V
 * 		[ Target ]
 *
 * **North west**
 *
 * * `northWestArrowSouth`
 *
 * 		+-----------------+
 * 		|     Balloon     |
 * 		+-----------------+
 * 		         V
 * 		         [ Target ]
 *
 * * `northWestArrowSouthWest`
 *
 * 		+-----------------+
 * 		|     Balloon     |
 * 		+-----------------+
 * 		   V
 * 		   [ Target ]
 *
 * * `northWestArrowSouthEast`
 *
 * 		+-----------------+
 * 		|     Balloon     |
 * 		+-----------------+
 * 		               V
 * 		               [ Target ]
 *
 * **North east**
 *
 * * `northEastArrowSouth`
 *
 * 		+-----------------+
 * 		|     Balloon     |
 * 		+-----------------+
 * 		         V
 * 		[ Target ]
 *
 * * `northEastArrowSouthEast`
 *
 * 		+-----------------+
 * 		|     Balloon     |
 * 		+-----------------+
 * 		               V
 * 		      [ Target ]
 *
 * * `northEastArrowSouthWest`
 *
 * 		      +-----------------+
 * 		      |     Balloon     |
 * 		      +-----------------+
 * 		         V
 * 		[ Target ]
 *
 * **South**
 *
 * * `southArrowNorth`
 *
 *		    [ Target ]
 *		         ^
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *
 * * `southArrowNorthEast`
 *
 *		          [ Target ]
 *		               ^
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *
 * * `southArrowNorthWest`
 *
 *		[ Target ]
 *		     ^
 *		   +-----------------+
 *		   |     Balloon     |
 *		   +-----------------+
 *
 * **South west**
 *
 * * `southWestArrowNorth`
 *
 *		         [ Target ]
 *		         ^
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *
 * * `southWestArrowNorthWest`
 *
 *		  [ Target ]
 *		  ^
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *
 * * `southWestArrowNorthEast`
 *
 *		               [ Target ]
 *		               ^
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *
 * **South east**
 *
 * * `southEastArrowNorth`
 *
 *		[ Target ]
 *		         ^
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *
 * * `southEastArrowNorthEast`
 *
 *		       [ Target ]
 *		                ^
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *
 * * `southEastArrowNorthWest`
 *
 *		[ Target ]
 *		         ^
 *		       +-----------------+
 *		       |     Balloon     |
 *		       +-----------------+
 *
 * See {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView#attachTo}.
 *
 * Positioning functions must be compatible with {@link module:utils/dom/position~Position}.
 *
 * The name that position function returns will be reflected in balloon panel's class that
 * controls the placement of the "arrow". See {@link #position} to learn more.
 *
 * @member {Object} module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions
 */
BalloonPanelView.defaultPositions = {
	// ------- North

	northArrowSouth: ( targetRect, balloonRect ) => ( {
		top: getNorthTop( targetRect, balloonRect ),
		left: targetRect.left + targetRect.width / 2 - balloonRect.width / 2,
		name: 'arrow_s'
	} ),

	northArrowSouthEast: ( targetRect, balloonRect ) => ( {
		top: getNorthTop( targetRect, balloonRect ),
		left: targetRect.left + targetRect.width / 2 - balloonRect.width + BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_se'
	} ),

	northArrowSouthWest: ( targetRect, balloonRect ) => ( {
		top: getNorthTop( targetRect, balloonRect ),
		left: targetRect.left + targetRect.width / 2 - BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_sw'
	} ),

	// ------- North west

	northWestArrowSouth: ( targetRect, balloonRect ) => ( {
		top: getNorthTop( targetRect, balloonRect ),
		left: targetRect.left - balloonRect.width / 2,
		name: 'arrow_s'
	} ),

	northWestArrowSouthWest: ( targetRect, balloonRect ) => ( {
		top: getNorthTop( targetRect, balloonRect ),
		left: targetRect.left - BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_sw'
	} ),

	northWestArrowSouthEast: ( targetRect, balloonRect ) => ( {
		top: getNorthTop( targetRect, balloonRect ),
		left: targetRect.left - balloonRect.width + BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_se'
	} ),

	// ------- North east

	northEastArrowSouth: ( targetRect, balloonRect ) => ( {
		top: getNorthTop( targetRect, balloonRect ),
		left: targetRect.right - balloonRect.width / 2,
		name: 'arrow_s'
	} ),

	northEastArrowSouthEast: ( targetRect, balloonRect ) => ( {
		top: getNorthTop( targetRect, balloonRect ),
		left: targetRect.right - balloonRect.width + BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_se'
	} ),

	northEastArrowSouthWest: ( targetRect, balloonRect ) => ( {
		top: getNorthTop( targetRect, balloonRect ),
		left: targetRect.right - BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_sw'
	} ),

	// ------- South

	southArrowNorth: ( targetRect, balloonRect ) => ( {
		top: getSouthTop( targetRect, balloonRect ),
		left: targetRect.left + targetRect.width / 2 - balloonRect.width / 2,
		name: 'arrow_n'
	} ),

	southArrowNorthEast: ( targetRect, balloonRect ) => ( {
		top: getSouthTop( targetRect, balloonRect ),
		left: targetRect.left + targetRect.width / 2 - balloonRect.width + BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_ne'
	} ),

	southArrowNorthWest: ( targetRect, balloonRect ) => ( {
		top: getSouthTop( targetRect, balloonRect ),
		left: targetRect.left + targetRect.width / 2 - BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_nw'
	} ),

	// ------- South west

	southWestArrowNorth: ( targetRect, balloonRect ) => ( {
		top: getSouthTop( targetRect, balloonRect ),
		left: targetRect.left - balloonRect.width / 2,
		name: 'arrow_n'
	} ),

	southWestArrowNorthWest: ( targetRect, balloonRect ) => ( {
		top: getSouthTop( targetRect, balloonRect ),
		left: targetRect.left - BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_nw'
	} ),

	southWestArrowNorthEast: ( targetRect, balloonRect ) => ( {
		top: getSouthTop( targetRect, balloonRect ),
		left: targetRect.left - balloonRect.width + BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_ne'
	} ),

	// ------- South east

	southEastArrowNorth: ( targetRect, balloonRect ) => ( {
		top: getSouthTop( targetRect, balloonRect ),
		left: targetRect.right - balloonRect.width / 2,
		name: 'arrow_n'
	} ),

	southEastArrowNorthEast: ( targetRect, balloonRect ) => ( {
		top: getSouthTop( targetRect, balloonRect ),
		left: targetRect.right - balloonRect.width + BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_ne'
	} ),

	southEastArrowNorthWest: ( targetRect, balloonRect ) => ( {
		top: getSouthTop( targetRect, balloonRect ),
		left: targetRect.right - BalloonPanelView.arrowHorizontalOffset,
		name: 'arrow_nw'
	} ),
};

// Returns the top coordinate for positions starting with `north*`.
//
// @private
// @param {utils/dom/rect~Rect} targetRect A rect of the target.
// @param {utils/dom/rect~Rect} elementRect A rect of the balloon.
// @returns {Number}
function getNorthTop( targetRect, balloonRect ) {
	return targetRect.top - balloonRect.height - BalloonPanelView.arrowVerticalOffset;
}

// Returns the top coordinate for positions starting with `south*`.
//
// @private
// @param {utils/dom/rect~Rect} targetRect A rect of the target.
// @param {utils/dom/rect~Rect} elementRect A rect of the balloon.
// @returns {Number}
function getSouthTop( targetRect ) {
	return targetRect.bottom + BalloonPanelView.arrowVerticalOffset;
}
