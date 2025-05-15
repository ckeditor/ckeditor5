/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/panel/sticky/stickypanelview
 */

import View from '../../view.js';
import Template from '../../template.js';

import type ViewCollection from '../../viewcollection.js';

import {
	type Locale,
	type ObservableChangeEvent,
	Rect,
	toUnit,
	getVisualViewportOffset,
	global
} from '@ckeditor/ckeditor5-utils';

// @if CK_DEBUG_STICKYPANEL // const {
// @if CK_DEBUG_STICKYPANEL // 	default: RectDrawer,
// @if CK_DEBUG_STICKYPANEL // 	diagonalStylesBlack
// @if CK_DEBUG_STICKYPANEL // } = require( '@ckeditor/ckeditor5-utils/tests/_utils/rectdrawer' );

import '../../../theme/components/panel/stickypanel.css';

const toPx = /* #__PURE__ */ toUnit( 'px' );

/**
 * The sticky panel view class.
 */
export default class StickyPanelView extends View {
	/**
	 * Collection of the child views which creates balloon panel contents.
	 */
	public readonly content: ViewCollection;

	/**
	 * Controls whether the sticky panel should be active.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isActive: boolean;

	/**
	 * Controls whether the sticky panel is in the "sticky" state.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isSticky: boolean;

	/**
	 * The limiter element for the sticky panel instance. Its bounding rect limits
	 * the "stickyness" of the panel, i.e. when the panel reaches the bottom
	 * edge of the limiter, it becomes sticky to that edge and does not float
	 * off the limiter. It is mandatory for the panel to work properly and once
	 * set, it cannot be changed.
	 *
	 * @readonly
	 * @observable
	 */
	declare public limiterElement: HTMLElement | null;

	/**
	 * The offset from the bottom edge of {@link #limiterElement}
	 * which stops the panel from stickying any further to prevent limiter's content
	 * from being completely covered.
	 *
	 * @readonly
	 * @observable
	 * @default 50
	 */
	declare public limiterBottomOffset: number;

	/**
	 * The offset from the top edge of the web browser's viewport which makes the
	 * panel become sticky. The default value is `0`, which means the panel becomes
	 * sticky when it's upper edge touches the top of the page viewport.
	 *
	 * This attribute is useful when the web page has UI elements positioned to the top
	 * either using `position: fixed` or `position: sticky`, which would cover the
	 * sticky panel or vice–versa (depending on the `z-index` hierarchy).
	 *
	 * Bound to {@link module:ui/editorui/editorui~EditorUI#viewportOffset `EditorUI#viewportOffset`}.
	 *
	 * If {@link module:core/editor/editorconfig~EditorConfig#ui `EditorConfig#ui.viewportOffset.top`} is defined, then
	 * it will override the default value.
	 *
	 * @observable
	 * @default 0
	 */
	declare public viewportTopOffset: number;

	/**
	 * The panel which accepts children into {@link #content} collection.
	 * Also an element which is positioned when {@link #isSticky}.
	 */
	public contentPanelElement: HTMLElement;

	/**
	 * Controls the `margin-left` CSS style of the panel.
	 *
	 * @private
	 * @readonly
	 * @observable
	 */
	declare public _marginLeft: string | null;

	/**
	 * Set `true` if the sticky panel reached the bottom edge of the
	 * {@link #limiterElement}.
	 *
	 * @private
	 * @readonly
	 * @observable
	 */
	declare public _isStickyToTheBottomOfLimiter: boolean;

	/**
	 * The `top` CSS position of the panel when it is sticky to the top of the viewport or scrollable
	 * ancestors of the {@link #limiterElement}.
	 *
	 * @private
	 * @readonly
	 * @observable
	 */
	declare public _stickyTopOffset: number | null;

	/**
	 * The `bottom` CSS position of the panel when it is sticky to the bottom of the {@link #limiterElement}.
	 *
	 * @private
	 * @readonly
	 * @observable
	 */
	declare public _stickyBottomOffset: number | null;

	/**
	 * A dummy element which visually fills the space as long as the
	 * actual panel is sticky. It prevents flickering of the UI.
	 */
	private _contentPanelPlaceholder: HTMLElement;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isActive', false );
		this.set( 'isSticky', false );
		this.set( 'limiterElement', null );
		this.set( 'limiterBottomOffset', 50 );
		this.set( 'viewportTopOffset', 0 );

		this.set( '_marginLeft', null );
		this.set( '_isStickyToTheBottomOfLimiter', false );

		this.set( '_stickyTopOffset', null );
		this.set( '_stickyBottomOffset', null );

		this.content = this.createCollection();

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
						return isSticky ? toPx( this._contentPanelRect.height ) : null;
					} )
				}
			}
		} ).render() as HTMLElement;

		this.contentPanelElement = new Template( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-sticky-panel__content',
					// Toggle class of the panel when "sticky" state changes in the view.
					bind.if( 'isSticky', 'ck-sticky-panel__content_sticky' ),
					bind.if( '_isStickyToTheBottomOfLimiter', 'ck-sticky-panel__content_sticky_bottom-limit' )
				],
				style: {
					width: bind.to( 'isSticky', isSticky => {
						return isSticky ? toPx( this._contentPanelPlaceholder.getBoundingClientRect().width ) : null;
					} ),

					top: bind.to( '_stickyTopOffset', value => value ? toPx( value ) : value ),
					bottom: bind.to( '_stickyBottomOffset', value => value ? toPx( value ) : value ),

					marginLeft: bind.to( '_marginLeft' )
				}
			},

			children: this.content
		} ).render() as HTMLElement;

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
				this.contentPanelElement
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		// Check if the panel should go into the sticky state immediately.
		this.checkIfShouldBeSticky();

		// Update sticky state of the panel as the window and ancestors are being scrolled.
		this.listenTo( global.document, 'scroll', () => {
			this.checkIfShouldBeSticky();
		}, { useCapture: true } );

		// Synchronize with `model.isActive` because sticking an inactive panel is pointless.
		this.listenTo<ObservableChangeEvent>( this, 'change:isActive', () => {
			this.checkIfShouldBeSticky();
		} );

		if ( global.window.visualViewport ) {
			this.listenTo( global.window.visualViewport, 'scroll', () => {
				this.checkIfShouldBeSticky();
			} );

			this.listenTo( global.window.visualViewport, 'resize', () => {
				this.checkIfShouldBeSticky();
			} );
		}
	}

	/**
	 * Analyzes the environment to decide whether the panel should be sticky or not.
	 * Then handles the positioning of the panel.
	 */
	public checkIfShouldBeSticky(): void {
		// @if CK_DEBUG_STICKYPANEL // RectDrawer.clear();

		if ( !this.limiterElement || !this.isActive ) {
			this._unstick();

			return;
		}

		const limiterRect = new Rect( this.limiterElement );
		let visibleLimiterRect = limiterRect.getVisible();

		if ( visibleLimiterRect ) {
			const windowRect = new Rect( global.window );

			windowRect.top += this.viewportTopOffset;
			windowRect.height -= this.viewportTopOffset;

			visibleLimiterRect = visibleLimiterRect.getIntersection( windowRect );
		}

		const {
			left: visualViewportOffsetLeft,
			top: visualViewportOffsetTop
		} = getVisualViewportOffset();

		limiterRect.moveBy( visualViewportOffsetLeft, visualViewportOffsetTop );

		if ( visibleLimiterRect ) {
			visibleLimiterRect.moveBy( visualViewportOffsetLeft, visualViewportOffsetTop );
		}

		// Stick the panel only if
		// * the limiter's ancestors are intersecting with each other so that some of their rects are visible,
		// * and the limiter's top edge is above the visible ancestors' top edge.
		if ( visibleLimiterRect && limiterRect.top < visibleLimiterRect.top ) {
			// Check if there's a change the panel can be sticky to the bottom of the limiter.
			if ( this._contentPanelRect.height + this.limiterBottomOffset > visibleLimiterRect.height ) {
				const stickyBottomOffset = Math.max( limiterRect.bottom - visibleLimiterRect.bottom, 0 ) + this.limiterBottomOffset;
				// @if CK_DEBUG_STICKYPANEL // const stickyBottomOffsetRect = new Rect( {
				// @if CK_DEBUG_STICKYPANEL // 	top: limiterRect.bottom - stickyBottomOffset, left: 0, right: 2000,
				// @if CK_DEBUG_STICKYPANEL // 	bottom: limiterRect.bottom - stickyBottomOffset, width: 2000, height: 1
				// @if CK_DEBUG_STICKYPANEL // } );
				// @if CK_DEBUG_STICKYPANEL // RectDrawer.draw( stickyBottomOffsetRect,
				// @if CK_DEBUG_STICKYPANEL // 	{ outlineWidth: '1px', opacity: '.8', outlineColor: 'black' },
				// @if CK_DEBUG_STICKYPANEL // 	'Sticky bottom offset',
				// @if CK_DEBUG_STICKYPANEL // 	{ visualViewportOrigin: true }
				// @if CK_DEBUG_STICKYPANEL // );

				// Check if sticking the panel to the bottom of the limiter does not cause it to suddenly
				// move upwards if there's not enough space for it.
				// To avoid toolbar flickering we are adding 1 for potential style change (sticky has all borders set,
				// non-sticky lacks bottom border).
				if ( this._contentPanelRect.height + stickyBottomOffset + 1 < limiterRect.height ) {
					this._stickToBottomOfLimiter( stickyBottomOffset );
				} else {
					this._unstick();
				}
			} else if ( this._contentPanelRect.height + this.limiterBottomOffset < limiterRect.height ) {
				this._stickToTopOfAncestors( visibleLimiterRect.top );
			} else {
				this._unstick();
			}
		} else {
			this._unstick();
		}

		// @if CK_DEBUG_STICKYPANEL // console.clear();
		// @if CK_DEBUG_STICKYPANEL // console.log( 'isSticky', this.isSticky );
		// @if CK_DEBUG_STICKYPANEL // console.log( '_isStickyToTheBottomOfLimiter', this._isStickyToTheBottomOfLimiter );
		// @if CK_DEBUG_STICKYPANEL // console.log( '_stickyTopOffset', this._stickyTopOffset );
		// @if CK_DEBUG_STICKYPANEL // console.log( '_stickyBottomOffset', this._stickyBottomOffset );
		// @if CK_DEBUG_STICKYPANEL // if ( visibleLimiterRect ) {
		// @if CK_DEBUG_STICKYPANEL // 	RectDrawer.draw( visibleLimiterRect,
		// @if CK_DEBUG_STICKYPANEL // 		{ ...diagonalStylesBlack,
		// @if CK_DEBUG_STICKYPANEL // 			outlineWidth: '3px', opacity: '.8', outlineColor: 'orange', outlineOffset: '-3px',
		// @if CK_DEBUG_STICKYPANEL // 			backgroundColor: 'rgba(0, 0, 255, .2)', zIndex: 2000 },
		// @if CK_DEBUG_STICKYPANEL // 		'visibleLimiterRect',
		// @if CK_DEBUG_STICKYPANEL // 		{ visualViewportOrigin: true }
		// @if CK_DEBUG_STICKYPANEL // 	);
		// @if CK_DEBUG_STICKYPANEL // }
	}

	/**
	 * Sticks the panel at the given CSS `top` offset.
	 *
	 * @private
	 * @param topOffset
	 */
	private _stickToTopOfAncestors( topOffset: number ) {
		this.isSticky = true;
		this._isStickyToTheBottomOfLimiter = false;
		this._stickyTopOffset = topOffset;
		this._stickyBottomOffset = null;
		this._marginLeft = toPx( -global.window.scrollX + getVisualViewportOffset().left );
	}

	/**
	 * Sticks the panel at the bottom of the limiter with a given CSS `bottom` offset.
	 *
	 * @private
	 * @param stickyBottomOffset
	 */
	private _stickToBottomOfLimiter( stickyBottomOffset: number ) {
		this.isSticky = true;
		this._isStickyToTheBottomOfLimiter = true;
		this._stickyTopOffset = null;
		this._stickyBottomOffset = stickyBottomOffset;
		this._marginLeft = toPx( -global.window.scrollX + getVisualViewportOffset().left );
	}

	/**
	 * Unsticks the panel putting it back to its original position.
	 *
	 * @private
	 */
	private _unstick() {
		this.isSticky = false;
		this._isStickyToTheBottomOfLimiter = false;
		this._stickyTopOffset = null;
		this._stickyBottomOffset = null;
		this._marginLeft = null;
	}

	/**
	 * Returns the bounding rect of the {@link #contentPanelElement}.
	 *
	 * @private
	 */
	private get _contentPanelRect(): Rect {
		return new Rect( this.contentPanelElement );
	}
}
