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
		 * to the balloon, i.e. `.ck-balloon-panel_arrow_se` for "se" position. The class
		 * controls the minor aspects of the balloon's visual appearance like placement
		 * of the "arrow". To support a new position, an additional CSS must be created.
		 *
		 * Default position names correspond with
		 * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions}.
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
	 * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions}.
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

		this._pinWhenVisible = () => {
			if ( this.isVisible ) {
				this._startPinning( options );
			} else {
				this._stopPinning();
			}
		};

		// If the panel is already visible, enable the listeners immediately.
		this._pinWhenVisible();

		// Control the state of the listeners depending on whether the panel is visible
		// or not.
		// TODO: Use on() (https://github.com/ckeditor/ckeditor5-utils/issues/144).
		this.listenTo( this, 'change:isVisible', this._pinWhenVisible );
	}

	/**
	 * Stops pinning the panel, as set up by {@link #pin}.
	 */
	unpin() {
		// Deactivate listeners attached by pin().
		this.stopListening( global.document, 'scroll' );
		this.stopListening( global.window, 'resize' );

		// Deactivate the panel pin() control logic.
		// TODO: Use off() (https://github.com/ckeditor/ckeditor5-utils/issues/144).
		if ( this._pinWhenVisible ) {
			this.stopListening( this, 'change:isVisible', this._pinWhenVisible );
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

		const limiter = options.limiter || defaultLimiterElement;
		let target = null;

		// We need to take HTMLElement related to the target if it is possible.
		if ( isElement( options.target ) ) {
			target = options.target;
		} else if ( isRange( options.target ) ) {
			target = options.target.commonAncestorContainer;
		}

		// Then we need to listen on scroll event of eny element in the document.
		this.listenTo( global.document, 'scroll', ( evt, domEvt ) => {
			// We need to update position if scrolled element contains related to the balloon elements.
			if ( ( target && domEvt.target.contains( target ) ) || domEvt.target.contains( limiter ) ) {
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
