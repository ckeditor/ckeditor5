/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/panel/sticky/stickypanelview
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import View from '../../view';
import Template from '../../template';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import { throttle } from 'lodash-es';

import '../../../theme/components/panel/stickypanel.css';

const toPx = toUnit( 'px' );

/**
 * The sticky panel view class.
 */
export default class StickyPanelView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Controls whether the sticky panel should be active.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isActive
		 */
		this.set( 'isActive', false );

		/**
		 * Controls whether the sticky panel is in the "sticky" state.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isSticky
		 */
		this.set( 'isSticky', false );

		/**
		 * The limiter element for the sticky panel instance. Its bounding rect limits
		 * the "stickyness" of the panel, i.e. when the panel reaches the bottom
		 * edge of the limiter, it becomes sticky to that edge and does not float
		 * off the limiter. It is mandatory for the panel to work properly and once
		 * set, it cannot be changed.
		 *
		 * @readonly
		 * @observable
		 * @member {HTMLElement} #limiterElement
		 */
		this.set( 'limiterElement', null );

		/**
		 * The offset from the bottom edge of {@link #limiterElement}
		 * which stops the panel from stickying any further to prevent limiter's content
		 * from being completely covered.
		 *
		 * @readonly
		 * @observable
		 * @default 50
		 * @member {Number} #limiterBottomOffset
		 */
		this.set( 'limiterBottomOffset', 50 );

		/**
		 * The offset from the top edge of the web browser's viewport which makes the
		 * panel become sticky. The default value is `0`, which means the panel becomes
		 * sticky when it's upper edge touches the top of the page viewport.
		 *
		 * This attribute is useful when the web page has UI elements positioned to the top
		 * either using `position: fixed` or `position: sticky`, which would cover the
		 * sticky panel or vice–versa (depending on the `z-index` hierarchy).
		 *
		 * Bound to {@link module:core/editor/editorui~EditorUI#viewportOffset `EditorUI#viewportOffset`}.
		 *
		 * If {@link module:core/editor/editorconfig~EditorConfig#ui `EditorConfig#ui.viewportOffset.top`} is defined, then
		 * it will override the default value.
		 *
		 * @observable
		 * @default 0
		 * @member {Number} #viewportTopOffset
		 */
		this.set( 'viewportTopOffset', 0 );

		/**
		 * Controls the `top` CSS style of the panel.
		 *
		 * @protected
		 * @readonly
		 * @observable
		 * @member {String} #_top
		 */
		this.set( '_top', null );

		/**
		 * Controls the `bottom` CSS style of the panel.
		 *
		 * @protected
		 * @readonly
		 * @observable
		 * @member {String} #_bottom
		 */
		this.set( '_bottom', null );

		/**
		 * Controls the `margin-left` CSS style of the panel.
		 *
		 * @protected
		 * @readonly
		 * @observable
		 * @member {String} #_marginLeft
		 */
		this.set( '_marginLeft', null );

		/**
		 * Set `true` if the sticky panel reached the bottom edge of the
		 * {@link #limiterElement}.
		 *
		 * @protected
		 * @readonly
		 * @observable
		 * @member {Boolean} #_isStickyToTheLimiter
		 */
		this.set( '_isStickyToTheLimiter', false );

		/**
		 * Collection of the child views which creates balloon panel contents.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.content = this.createCollection();

		/**
		 * The DOM bounding client rect of the {@link module:ui/view~View#element} of the panel.
		 *
		 * @protected
		 * @member {Object} #_panelRect
		 */

		/**
		 * The DOM bounding client rect of the {@link #limiterElement}
		 * of the panel.
		 *
		 * @protected
		 * @member {Object} #_limiterRect
		 */

		/**
		 * A dummy element which visually fills the space as long as the
		 * actual panel is sticky. It prevents flickering of the UI.
		 *
		 * @protected
		 * @property {HTMLElement}
		 */
		this._contentPanelPlaceholder = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-sticky-panel__placeholder'
				],
				style: {
					display: bind.to( 'isSticky', isSticky => isSticky ? 'block' : 'none' ),
					height: bind.to( 'isSticky', isSticky => {
						return isSticky ? toPx( this._panelRect.height ) : null;
					} )
				}
			}
		} ).render();

		/**
		 * The panel which accepts children into {@link #content} collection.
		 * Also an element which is positioned when {@link #isSticky}.
		 *
		 * @protected
		 * @property {HTMLElement}
		 */
		this._contentPanel = new Template( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-sticky-panel__content',
					// Toggle class of the panel when "sticky" state changes in the view.
					bind.if( 'isSticky', 'ck-sticky-panel__content_sticky' ),
					bind.if( '_isStickyToTheLimiter', 'ck-sticky-panel__content_sticky_bottom-limit' )
				],
				style: {
					width: bind.to( 'isSticky', isSticky => {
						return isSticky ? toPx( new Rect( this._contentPanelPlaceholder ).width ) : null;
					} ),

					top: bind.to( '_top' ),
					bottom: bind.to( '_bottom' ),

					marginLeft: bind.to( '_marginLeft' )
				}
			},

			children: this.content
		} ).render();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-sticky-panel'
				]
			},
			children: [
				this._contentPanelPlaceholder,
				this._contentPanel
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this._checkIfShouldBeStickyDebounced = throttle( this._checkIfShouldBeSticky.bind( this ), 50 );

		// Check if the panel should go into the sticky state immediately.
		this._checkIfShouldBeStickyDebounced();

		// Update sticky state of the panel as the window is being scrolled.
		this.listenTo( global.window, 'scroll', this._checkIfShouldBeStickyDebounced );

		if ( global.window.visualViewport ) {
			this.listenTo( global.window.visualViewport, 'resize', this._checkIfShouldBeStickyDebounced );
			this.listenTo( global.window.visualViewport, 'scroll', this._checkIfShouldBeStickyDebounced );
		}

		// Synchronize with `model.isActive` because sticking an inactive panel is pointless.
		this.listenTo( this, 'change:isActive', this._checkIfShouldBeStickyDebounced );
	}

	destroy() {
		this._checkIfShouldBeStickyDebounced.cancel();
	}

	/**
	 * Analyzes the environment to decide whether the panel should
	 * be sticky or not.
	 *
	 * @protected
	 */
	_checkIfShouldBeSticky() {
		// The panel must be active to become sticky.
		if ( !this.isActive ) {
			this.isSticky = false;
			this._isStickyToTheLimiter = false;
			this._marginLeft = null;

			return;
		}

		const panelRect = this._panelRect = new Rect( this._contentPanel );
		const visualViewport = global.window.visualViewport;
		let limiterRect;

		if ( !this.limiterElement ) {
			this.isSticky = false;
		} else {
			limiterRect = this._limiterRect = new Rect( this.limiterElement );

			// The limiter's top edge must be beyond the upper edge of the visible viewport (+the viewportTopOffset).
			this.isSticky = limiterRect.top < this.viewportTopOffset &&
				// The model#limiterElement's height mustn't be smaller than the panel's height and model#limiterBottomOffset.
				// There's no point in entering the sticky mode if the model#limiterElement is very, very small, because
				// it would immediately set model#_isStickyToTheLimiter true and, given model#limiterBottomOffset, the panel
				// would be positioned before the model#limiterElement.
				this._panelRect.height + this.limiterBottomOffset < limiterRect.height;
		}

		// Stick the panel to the top edge of the viewport simulating CSS position:sticky.
		// TODO: Possibly replaced by CSS in the future http://caniuse.com/#feat=css-sticky
		if ( this.isSticky ) {
			this._isStickyToTheLimiter =
				limiterRect.bottom < panelRect.height + this.limiterBottomOffset + this.viewportTopOffset;

			this._marginLeft = this._isStickyToTheLimiter ? null : toPx( -global.window.scrollX + visualViewport.offsetLeft );

			if ( !this._isStickyToTheLimiter ) {
				this._top = toPx( this.viewportTopOffset + visualViewport.offsetTop );
				this._bottom = 'auto';
			} else {
				this._top = 'auto';
				this._bottom = toPx( this.limiterBottomOffset );
			}
		}
		// Detach the panel from the top edge of the viewport.
		else {
			this._isStickyToTheLimiter = false;
			this._marginLeft = null;
		}
	}
}
