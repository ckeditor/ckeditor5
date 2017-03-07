/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/panel/floating/floatingpanelview
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Template from '../../template';
import View from '../../view';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';

const toPx = toUnit( 'px' );

/**
 * The floating panel view class. It floats around the
 * {@link module:ui/panel/floating/floatingpanelview~FloatingPanelView#targetElement} in DOM
 * to remain visible in the browser viewport.
 *
 * See {@link module:ui/panel/floating/floatingpanelview~FloatingPanelView.defaultPositions}
 * to learn about the positioning.
 *
 * @extends module:ui/view~View
 */
export default class FloatingPanelView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Controls whether the floating panel is active. When any editable
		 * is focused in the editor, panel becomes active.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isActive
		 */
		this.set( 'isActive', false );

		/**
		 * The absolute top position of the panel, in pixels.
		 *
		 * @observable
		 * @default 0
		 * @member {Number} #top
		 */
		this.set( 'top', 0 );

		/**
		 * The absolute left position of the panel, in pixels.
		 *
		 * @observable
		 * @default 0
		 * @member {Number} #left
		 */
		this.set( 'left', 0 );

		/**
		 * An element with respect to which the panel is positioned.
		 *
		 * @readonly
		 * @observable
		 * @member {HTMLElement} #targetElement
		 */
		this.set( 'targetElement', null );

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
					'ck-floating-panel',
					bind.if( 'isActive', 'ck-floating-panel_active' ),
				],
				style: {
					top: bind.to( 'top', toPx ),
					left: bind.to( 'left', toPx ),
				}
			},

			children: this.content
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.listenTo( global.window, 'scroll', () => this._updatePosition() );
		this.listenTo( this, 'change:isActive', () => this._updatePosition() );

		return super.init();
	}

	/**
	 * Analyzes the environment to decide where the panel should
	 * be positioned.
	 *
	 * @protected
	 */
	_updatePosition() {
		if ( !this.isActive ) {
			return;
		}

		const { nw, sw, ne, se } = FloatingPanelView.defaultPositions;
		const { top, left } = getOptimalPosition( {
			element: this.element,
			target: this.targetElement,
			positions: [ nw, sw, ne, se ],
			limiter: global.document.body,
			fitInViewport: true
		} );

		Object.assign( this, { top, left } );
	}
}

/**
 * A default set of positioning functions used by the panel view to float
 * around {@link module:ui/panel/floating/floatingpanelview~FloatingPanelView#targetElement}.
 *
 * The available positioning functions are as follows:
 *
 * * South east:
 *
 *		+----------------+
 *		| #targetElement |
 *		+----------------+
 *		         [ Panel ]
 *
 * * South west:
 *
 *		+----------------+
 *		| #targetElement |
 *		+----------------+
 *		[ Panel ]
 *
 * * North east:
 *
 *		         [ Panel ]
 *		+----------------+
 *		| #targetElement |
 *		+----------------+
 *
 *
 * * North west:
 *
 *		[ Panel ]
 *		+----------------+
 *		| #targetElement |
 *		+----------------+
 *
 * See {@link module:ui/panel/floating/floatingpanelview~FloatingPanelView#_updatePosition}.
 *
 * Positioning functions must be compatible with {@link module:utils/dom/position~Position}.
 *
 * @member {Object} module:ui/panel/floating/floatingpanelview~FloatingPanelView.defaultPositions
 */
FloatingPanelView.defaultPositions = {
	nw: ( targetRect, panelRect ) => ( {
		top: targetRect.top - panelRect.height,
		left: targetRect.left,
		name: 'nw'
	} ),

	sw: ( targetRect ) => ( {
		top: targetRect.bottom,
		left: targetRect.left,
		name: 'sw'
	} ),

	ne: ( targetRect, panelRect ) => ( {
		top: targetRect.top - panelRect.height,
		left: targetRect.left + targetRect.width - panelRect.width,
		name: 'ne'
	} ),

	se: ( targetRect, panelRect ) => ( {
		top: targetRect.bottom,
		left: targetRect.left + targetRect.width - panelRect.width,
		name: 'se'
	} )
};
