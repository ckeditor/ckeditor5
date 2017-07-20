/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/sticky/stickytoolbarview
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Template from '../../template';
import ToolbarView from '../toolbarview';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';

const toPx = toUnit( 'px' );

/**
 * The sticky toolbar view class.
 *
 * @extends module:ui/toolbar/toolbarview~ToolbarView
 */
export default class StickyToolbarView extends ToolbarView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Controls whether the sticky toolbar should be active. When any editable
		 * is focused in the editor, toolbar becomes active.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isActive
		 */
		this.set( 'isActive', false );

		/**
		 * Controls whether the sticky toolbar is in the "sticky" state.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isSticky
		 */
		this.set( 'isSticky', false );

		/**
		 * The limiter element for the sticky toolbar instance. Its bounding rect limits
		 * the "stickyness" of the toolbar, i.e. when the toolbar reaches the bottom
		 * edge of the limiter, it becomes sticky to that edge and does not float
		 * off the limiter. It is mandatory for the toolbar to work properly and once
		 * set, it cannot be changed.
		 *
		 * @readonly
		 * @observable
		 * @member {HTMLElement} #limiterElement
		 */
		this.set( 'limiterElement', null );

		/**
		 * The offset from the bottom edge of {@link #limiterElement}
		 * which stops the toolbar from stickying any further to prevent limiter's content
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
		 * toolbar become sticky. The default value is `0`, which means the toolbar becomes
		 * sticky when it's upper edge touches the top of the page viewport.
		 *
		 * This attribute is useful when the web page has UI elements positioned to the top
		 * either using `position: fixed` or `position: sticky`, which would cover the
		 * sticky toolbar or vice–versa (depending on the `z-index` hierarchy).
		 *
		 * @readonly
		 * @observable
		 * @default 0
		 * @member {Number} #viewportTopOffset
		 */
		this.set( 'viewportTopOffset', 0 );

		/**
		 * Controls the `margin-left` CSS style of the toolbar.
		 *
		 * @protected
		 * @readonly
		 * @observable
		 * @member {String} #_marginLeft
		 */
		this.set( '_marginLeft', null );

		/**
		 * Set `true` if the sticky toolbar reached the bottom edge of the
		 * {@link #limiterElement}.
		 *
		 * @protected
		 * @readonly
		 * @observable
		 * @member {Boolean} #_isStickyToTheLimiter
		 */
		this.set( '_isStickyToTheLimiter', false );

		/**
		 * Set `true` if the sticky toolbar uses the {@link #viewportTopOffset},
		 * i.e. not {@link #_isStickyToTheLimiter} and the {@link #viewportTopOffset}
		 * is not `0`.
		 *
		 * @protected
		 * @readonly
		 * @observable
		 * @member {Boolean} #_hasViewportTopOffset
		 */
		this.set( '_hasViewportTopOffset', false );

		/**
		 * The DOM bounding client rect of the {@link module:ui/view~View#element} of the toolbar.
		 *
		 * @protected
		 * @member {Object} #_toolbarRect
		 */

		/**
		 * The DOM bounding client rect of the {@link #limiterElement}
		 * of the toolbar.
		 *
		 * @protected
		 * @member {Object} #_limiterRect
		 */

		Template.extend( this.template, {
			attributes: {
				class: [
					// Toggle class of the toolbar when "sticky" state changes in the view.
					bind.if( 'isSticky', 'ck-toolbar_sticky' ),
					bind.if( '_isStickyToTheLimiter', 'ck-toolbar_sticky_bottom-limit' ),
				],
				style: {
					width: bind.to( 'isSticky', isSticky => {
						return isSticky ? toPx( this._elementPlaceholder.getBoundingClientRect().width ) : null;
					} ),

					top: bind.to( '_hasViewportTopOffset', _hasViewportTopOffset => {
						return _hasViewportTopOffset ? toPx( this.viewportTopOffset ) : null;
					} ),

					bottom: bind.to( '_isStickyToTheLimiter', _isStickyToTheLimiter => {
						return _isStickyToTheLimiter ? toPx( this.limiterBottomOffset ) : null;
					} ),

					marginLeft: bind.to( '_marginLeft' )
				}
			}
		} );

		/**
		 * A dummy element which visually fills the space as long as the
		 * actual toolbar is sticky. It prevents flickering of the UI.
		 *
		 * @private
		 * @property {HTMLElement}
		 */
		this._elementPlaceholder = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck-toolbar__placeholder'
				],
				style: {
					display: bind.to( 'isSticky', isSticky => isSticky ? 'block' : 'none' ),
					height: bind.to( 'isSticky', isSticky => {
						return isSticky ? toPx( this._toolbarRect.height ) : null;
					} )
				}
			}
		} ).render();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		super.init();

		this.element.parentNode.insertBefore( this._elementPlaceholder, this.element );

		// Check if the toolbar should go into the sticky state immediately.
		this._checkIfShouldBeSticky();

		// Update sticky state of the toolbar as the window is being scrolled.
		this.listenTo( global.window, 'scroll', () => {
			this._checkIfShouldBeSticky();
		} );

		// Synchronize with `model.isActive` because sticking an inactive toolbar is pointless.
		this.listenTo( this, 'change:isActive', () => {
			this._checkIfShouldBeSticky();
		} );
	}

	/**
	 * Destroys the toolbar and removes the {@link #_elementPlaceholder}.
	 */
	destroy() {
		super.destroy();
		this._elementPlaceholder.remove();
	}

	/**
	 * Analyzes the environment to decide whether the toolbar should
	 * be sticky or not.
	 *
	 * @protected
	 */
	_checkIfShouldBeSticky() {
		const limiterRect = this._limiterRect = this.limiterElement.getBoundingClientRect();
		const toolbarRect = this._toolbarRect = this.element.getBoundingClientRect();

		// The toolbar must be active to become sticky.
		this.isSticky = this.isActive &&
			// The limiter's top edge must be beyond the upper edge of the visible viewport (+the viewportTopOffset).
			limiterRect.top < this.viewportTopOffset &&
			// The model#limiterElement's height mustn't be smaller than the toolbar's height and model#limiterBottomOffset.
			// There's no point in entering the sticky mode if the model#limiterElement is very, very small, because
			// it would immediately set model#_isStickyToTheLimiter true and, given model#limiterBottomOffset, the toolbar
			// would be positioned before the model#limiterElement.
			this._toolbarRect.height + this.limiterBottomOffset < limiterRect.height;

		// Stick the toolbar to the top edge of the viewport simulating CSS position:sticky.
		// TODO: Possibly replaced by CSS in the future http://caniuse.com/#feat=css-sticky
		if ( this.isSticky ) {
			this._isStickyToTheLimiter =
				limiterRect.bottom < toolbarRect.height + this.limiterBottomOffset + this.viewportTopOffset;
			this._hasViewportTopOffset = !this._isStickyToTheLimiter && !!this.viewportTopOffset;
			this._marginLeft = this._isStickyToTheLimiter ? null : toPx( -global.window.scrollX );
		}
		// Detach the toolbar from the top edge of the viewport.
		else {
			this._isStickyToTheLimiter = false;
			this._hasViewportTopOffset = false;
			this._marginLeft = null;
		}
	}
}
