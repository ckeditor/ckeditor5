/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/floating/floatingtoolbarview
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Template from '../../template';
import ToolbarView from '../toolbarview';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';

const toPx = toUnit( 'px' );

/**
 * The floating toolbar view class. It floats around the {@link #targetElement}
 * to remain visible in the viewport.
 *
 * @extends module:ui/toolbar/toolbarview~ToolbarView
 */
export default class FloatingToolbarView extends ToolbarView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Controls whether the floating toolbar is active. When any editable
		 * is focused in the editor, toolbar becomes active.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isActive
		 */
		this.set( 'isActive', false );

		/**
		 * The absolute top position of the toolbar, in pixels.
		 *
		 * @observable
		 * @default 0
		 * @member {Number} #top
		 */
		this.set( 'top', 0 );

		/**
		 * The absolute left position of the toolbar, in pixels.
		 *
		 * @observable
		 * @default 0
		 * @member {Number} #left
		 */
		this.set( 'left', 0 );

		/**
		 * An element with respect to which the toolbar is positioned.
		 *
		 * @readonly
		 * @observable
		 * @member {HTMLElement} #targetElement
		 */
		this.set( 'targetElement', null );

		Template.extend( this.template, {
			attributes: {
				class: [
					'ck-toolbar_floating',
					bind.if( 'isActive', 'ck-toolbar_active' ),
				],
				style: {
					top: bind.to( 'top', toPx ),
					left: bind.to( 'left', toPx ),
				}
			}
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
	 * Analyzes the environment to decide where the toolbar should
	 * be positioned.
	 *
	 * @protected
	 */
	_updatePosition() {
		if ( !this.isActive ) {
			return;
		}

		const { nw, sw, ne, se } = FloatingToolbarView.defaultPositions;
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
 * A default set of positioning functions used by the toolbar view to float
 * around {@link targetElement}.
 *
 * The available positioning functions are as follows:
 *
 * * South east:
 *
 *		+----------------+
 *		| #targetElement |
 *		+----------------+
 *		       [ Toolbar ]
 *
 * * South west:
 *
 *		+----------------+
 *		| #targetElement |
 *		+----------------+
 *		[ Toolbar ]
 *
 * * North east:
 *
 *		       [ Toolbar ]
 *		+----------------+
 *		| #targetElement |
 *		+----------------+
 *
 *
 * * North west:
 *
 *		[ Toolbar ]
 *		+----------------+
 *		| #targetElement |
 *		+----------------+
 *
 * See {@link #_updatePosition}.
 *
 * Positioning functions must be compatible with {@link module:utils/dom/position~Position}.
 *
 * @member {Object} module:ui/toolbar/floating/floatingtoolbarview~FloatingToolbarView#defaultPositions
 */
FloatingToolbarView.defaultPositions = {
	nw: ( targetRect, toolbarRect ) => ( {
		top: targetRect.top - toolbarRect.height,
		left: targetRect.left,
		name: 'nw'
	} ),

	sw: ( targetRect ) => ( {
		top: targetRect.bottom,
		left: targetRect.left,
		name: 'sw'
	} ),

	ne: ( targetRect, toolbarRect ) => ( {
		top: targetRect.top - toolbarRect.height,
		left: targetRect.left + targetRect.width - toolbarRect.width,
		name: 'ne'
	} ),

	se: ( targetRect, toolbarRect ) => ( {
		top: targetRect.bottom,
		left: targetRect.left + targetRect.width - toolbarRect.width,
		name: 'se'
	} )
};
