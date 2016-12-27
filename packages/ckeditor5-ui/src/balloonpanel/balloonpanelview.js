/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/balloonpanel/balloonpanelview
 */

/* globals document */

import View from '../view';
import Template from '../template';
import { getOptimalPosition } from 'ckeditor5-utils/src/dom/position';
import toUnit from 'ckeditor5-utils/src/dom/tounit';

const toPx = toUnit( 'px' );

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
		 * to the balloon, i.e. `.ck-balloon-panel_arrow_se` for "se" position. The class
		 * controls the minor aspects of the balloon's visual appearance like placement
		 * of the "arrow". To support a new position, an additional CSS must be created.
		 *
		 * Default position names correspond with {@link #defaultPositions}.
		 *
		 * @observable
		 * @default 'se'
		 * @member {'se'|'sw'|'ne'|'nw'} #position
		 */
		this.set( 'position', 'se' );

		/**
		 * Controls whether the balloon panel is visible or not.
		 *
		 * @observable
		 * @default false
		 * @member {Boolean} #isVisible
		 */
		this.set( 'isVisible', false );

		/**
		 * Max width of the balloon panel, as in CSS.
		 *
		 * @observable
		 * @member {Number} #maxWidth
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
					bind.to( 'position', ( value ) => `ck-balloon-panel_arrow_${ value }` ),
					bind.if( 'isVisible', 'ck-balloon-panel_visible' )
				],

				style: {
					top: bind.to( 'top', toPx ),
					left: bind.to( 'left', toPx ),
					maxWidth: bind.to( 'maxWidth', toPx )
				},

				// Make this element `focusable` to be available for adding to FocusTracker.
				tabindex: -1
			},

			children: this.content
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
	 * {@link module:ui/balloonpanel/balloonpanelview~BalloonPanelView.defaultPositions}.
	 */
	attachTo( options ) {
		this.show();

		const defaultPositions = BalloonPanelView.defaultPositions;
		const positionOptions = Object.assign( {}, {
			element: this.element,
			positions: [
				defaultPositions.se,
				defaultPositions.sw,
				defaultPositions.ne,
				defaultPositions.nw
			],
			limiter: document.body,
			fitInViewport: true
		}, options );

		const { top, left, name: position } = getOptimalPosition( positionOptions );

		Object.assign( this, { top, left, position } );
	}
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
 * @member {Number} module:ui/balloonpanel/balloonpanelview~BalloonPanelView.arrowHorizontalOffset
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
 * @member {Number} module:ui/balloonpanel/balloonpanelview~BalloonPanelView.arrowVerticalOffset
 */
BalloonPanelView.arrowVerticalOffset = 15;

/**
 * A default set of positioning functions used by the balloon panel view
 * when attaching using {@link #attachTo} method.
 *
 * The available positioning functions are as follows:
 *
 * * South east:
 *
 *		[ Target ]
 *		    ^
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *
 *
 * * South west:
 *
 *		         [ Target ]
 *		              ^
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *
 *
 * * North east:
 *
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *		    V
 *		[ Target ]
 *
 *
 * * North west:
 *
 *		+-----------------+
 *		|     Balloon     |
 *		+-----------------+
 *		              V
 *		         [ Target ]
 *
 * See {@link #attachTo}.
 *
 * Positioning functions must be compatible with {@link module:utils/dom/position~Position}.
 *
 * The name that position function returns will be reflected in balloon panel's class that
 * controls the placement of the "arrow". See {@link #position} to learn more.
 *
 * @member {Object} module:ui/balloonpanel/balloonpanelview~BalloonPanelView.defaultPositions
 */
BalloonPanelView.defaultPositions = {
	se: ( targetRect ) => ( {
		top: targetRect.bottom + BalloonPanelView.arrowVerticalOffset,
		left: targetRect.left + targetRect.width / 2 - BalloonPanelView.arrowHorizontalOffset,
		name: 'se'
	} ),

	sw: ( targetRect, balloonRect ) => ( {
		top: targetRect.bottom + BalloonPanelView.arrowVerticalOffset,
		left: targetRect.left + targetRect.width / 2 - balloonRect.width + BalloonPanelView.arrowHorizontalOffset,
		name: 'sw'
	} ),

	ne: ( targetRect, balloonRect ) => ( {
		top: targetRect.top - balloonRect.height - BalloonPanelView.arrowVerticalOffset,
		left: targetRect.left + targetRect.width / 2 - BalloonPanelView.arrowHorizontalOffset,
		name: 'ne'
	} ),

	nw: ( targetRect, balloonRect ) => ( {
		top: targetRect.top - balloonRect.height - BalloonPanelView.arrowVerticalOffset,
		left: targetRect.left + targetRect.width / 2 - balloonRect.width + BalloonPanelView.arrowHorizontalOffset,
		name: 'nw'
	} )
};
