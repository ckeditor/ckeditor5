/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/floating/floatingtoolbarview
 */

/* globals document */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Template from '../../template';
import ToolbarView from '../toolbarview';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';

const toPx = toUnit( 'px' );

/**
 * The floating toolbar view class.
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
		 * Controls whether the floating toolbar should be active. When any editable
		 * is focused in the editor, toolbar becomes active.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isActive
		 */
		this.set( 'isActive', false );

		/**
		 * The absolute top position of the balloon panel in pixels.
		 *
		 * @observable
		 * @default 0
		 * @member {Number} #top
		 */
		this.set( 'top', 0 );

		/**
		 * TODO
		 *
		 * @readonly
		 * @observable
		 * @member {HTMLElement} #limiterElement
		 */
		this.set( 'targetElement', null );

		/**
		 * The absolute left position of the balloon panel in pixels.
		 *
		 * @observable
		 * @default 0
		 * @member {Number} #left
		 */
		this.set( 'left', 0 );

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
	 * Destroys the toolbar and removes the {@link #_elementPlaceholder}.
	 */
	destroy() {
		return super.destroy();
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

		const defaultPositions = FloatingToolbarView.defaultPositions;

		const { top, left } = getOptimalPosition( {
			element: this.element,
			target: this.targetElement,
			positions: [
				defaultPositions.nw,
				defaultPositions.sw,
				defaultPositions.ne,
				defaultPositions.se
			],
			limiter: document.body,
			fitInViewport: true
		} );

		Object.assign( this, { top, left } );
	}
}

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
