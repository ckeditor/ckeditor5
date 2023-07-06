/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/panel/sticky/stickypanelview
 */

import View from '../../view';
import Template from '../../template';

import type ViewCollection from '../../viewcollection';

import {
	global,
	toUnit,
	type Locale,
	type ObservableChangeEvent,
	findClosestScrollableAncestor,
	Rect
} from '@ckeditor/ckeditor5-utils';

// @if CK_DEBUG_STICKYPANEL // const RectDrawer = require( '@ckeditor/ckeditor5-utils/tests/_utils/rectdrawer' ).default

import '../../../theme/components/panel/stickypanel.css';

const toPx = toUnit( 'px' );

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
	 * The DOM bounding client rect of the {@link module:ui/view~View#element} of the panel.
	 */
	private _panelRect?: Rect;

	/**
	 * TODO
	 */
	declare public _stickyTopOffset: number | null;

	/**
	 * TODO
	 */
	declare public _stickyBottomOffset: number | null;

	/**
	 * A dummy element which visually fills the space as long as the
	 * actual panel is sticky. It prevents flickering of the UI.
	 */
	private _contentPanelPlaceholder: HTMLElement;

	/**
	 * The panel which accepts children into {@link #content} collection.
	 * Also an element which is positioned when {@link #isSticky}.
	 */
	private _contentPanel: HTMLElement;

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
						return isSticky ? toPx( this._panelRect!.height ) : null;
					} )
				}
			}
		} ).render() as HTMLElement;

		this._contentPanel = new Template( {
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
				this._contentPanel
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		// Check if the panel should go into the sticky state immediately.
		this._checkIfShouldBeSticky();

		// Update sticky state of the panel as the window and ancestors are being scrolled.
		this.listenTo( global.document, 'scroll', ( evt, data ) => {
			this._checkIfShouldBeSticky( data.target as HTMLElement | Document );
		}, { useCapture: true } );

		// Synchronize with `model.isActive` because sticking an inactive panel is pointless.
		this.listenTo<ObservableChangeEvent>( this, 'change:isActive', () => {
			this._checkIfShouldBeSticky();
		} );
	}

	/**
	 * Analyzes the environment to decide whether the panel should
	 * be sticky or not.
	 */
	private _checkIfShouldBeSticky( scrollTarget?: HTMLElement | Document ): void {
		// @if CK_DEBUG_STICKYPANEL // RectDrawer.clear();

		if ( !this.limiterElement ) {
			this._unstick();

			return;
		}

		const scrollableAncestors = getScrollableAncestors( this.limiterElement );

		if ( scrollTarget && !scrollableAncestors.includes( scrollTarget ) ) {
			console.log( 'Something else was scrolled' );

			return;
		}

		const visibleAncestorsRect = getVisibleAncestorsRect( scrollableAncestors, this.viewportTopOffset );
		const limiterRect = new Rect( this.limiterElement );

		// @if CK_DEBUG_STICKYPANEL // if ( visibleAncestorsRect ) {
		// @if CK_DEBUG_STICKYPANEL // 	RectDrawer.draw( visibleAncestorsRect,
		// @if CK_DEBUG_STICKYPANEL // 		{ outlineWidth: '3px', opacity: '.8', outlineColor: 'red', outlineOffset: '-3px' },
		// @if CK_DEBUG_STICKYPANEL // 		'Visible anc'
		// @if CK_DEBUG_STICKYPANEL // 	);
		// @if CK_DEBUG_STICKYPANEL // }
		// @if CK_DEBUG_STICKYPANEL //
		// @if CK_DEBUG_STICKYPANEL // RectDrawer.draw( limiterRect,
		// @if CK_DEBUG_STICKYPANEL // 	{ outlineWidth: '3px', opacity: '.8', outlineColor: 'green', outlineOffset: '-3px' },
		// @if CK_DEBUG_STICKYPANEL // 	'Limiter'
		// @if CK_DEBUG_STICKYPANEL // );

		if ( visibleAncestorsRect && limiterRect.top < visibleAncestorsRect.top ) {
			const visibleLimiterRect = limiterRect.getIntersection( visibleAncestorsRect );

			if ( visibleLimiterRect ) {
				// @if CK_DEBUG_STICKYPANEL // RectDrawer.draw( visibleLimiterRect,
				// @if CK_DEBUG_STICKYPANEL // 	{ outlineWidth: '3px', opacity: '.8', outlineColor: 'fuchsia', outlineOffset: '-3px',
				// @if CK_DEBUG_STICKYPANEL // 		backgroundColor: 'rgba(255, 0, 255, .3)' },
				// @if CK_DEBUG_STICKYPANEL // 	'Visible limiter'
				// @if CK_DEBUG_STICKYPANEL // );

				const visibleAncestorsTop = visibleAncestorsRect.top;

				this._panelRect = new Rect( this._contentPanel );

				if ( visibleAncestorsTop + this._panelRect.height + this.limiterBottomOffset > visibleLimiterRect.bottom ) {
					this._stickToBottomOfLimiter( limiterRect, visibleAncestorsRect );
				} else {
					this._stickToTopOfAncestors( visibleAncestorsTop );
				}
			} else {
				this._unstick();
			}
		} else {
			this._unstick();
		}
	}

	/**
	 *
	 * @param limiterRect
	 * @param visibleAncestorsRect
	 */
	private _stickToBottomOfLimiter( limiterRect: Rect, visibleAncestorsRect: Rect ) {
		this.isSticky = true;
		this._isStickyToTheBottomOfLimiter = true;
		this._stickyTopOffset = null;
		this._stickyBottomOffset =
			Math.max( limiterRect.bottom - visibleAncestorsRect.bottom, 0 ) + this.limiterBottomOffset;
		this._marginLeft = toPx( -global.window.scrollX );
	}

	/**
	 *
	 * @param topOffset
	 */
	private _stickToTopOfAncestors( topOffset: number ) {
		this.isSticky = true;
		this._isStickyToTheBottomOfLimiter = false;
		this._stickyTopOffset = topOffset;
		this._stickyBottomOffset = null;
		this._marginLeft = null;
	}

	/**
	 * TODO
	 */
	private _unstick() {
		this.isSticky = false;
		this._isStickyToTheBottomOfLimiter = false;
		this._stickyTopOffset = null;
		this._stickyBottomOffset = null;
		this._marginLeft = null;
	}
}

/**
 * TODO
 *
 * @param element
 * @returns
 */
function getScrollableAncestors( element: HTMLElement ) {
	const scrollableAncestors = [];
	let scrollableAncestor = findClosestScrollableAncestor( element );

	while ( scrollableAncestor && scrollableAncestor !== global.document.body ) {
		scrollableAncestors.push( scrollableAncestor );
		scrollableAncestor = findClosestScrollableAncestor( scrollableAncestor! );
	}

	scrollableAncestors.push( global.document );

	return scrollableAncestors;
}

/**
 * TODO
 *
 * @param scrollableAncestors
 * @param viewportTopOffset
 * @returns
 */
function getVisibleAncestorsRect( scrollableAncestors: Array<HTMLElement | Document>, viewportTopOffset: number ) {
	const scrollableAncestorsRects = scrollableAncestors.map( ancestor => {
		if ( ancestor instanceof Document ) {
			const windowRect = new Rect( global.window );

			windowRect.top += viewportTopOffset;
			windowRect.height -= viewportTopOffset;

			return windowRect;
		} else {
			return new Rect( ancestor );
		}
	} );

	let scrollableAncestorsIntersectionRect: Rect | null = scrollableAncestorsRects[ 0 ];

	// @if CK_DEBUG_STICKYPANEL // for ( const scrollableAncestorRect of scrollableAncestorsRects ) {
	// @if CK_DEBUG_STICKYPANEL // 	RectDrawer.draw( scrollableAncestorRect, {
	// @if CK_DEBUG_STICKYPANEL // 		outlineWidth: '1px', opacity: '.7', outlineStyle: 'dashed'
	// @if CK_DEBUG_STICKYPANEL // 	}, 'Scrollable ancestor' );
	// @if CK_DEBUG_STICKYPANEL // }

	for ( const scrollableAncestorRect of scrollableAncestorsRects.slice( 1 ) ) {
		if ( scrollableAncestorsIntersectionRect ) {
			scrollableAncestorsIntersectionRect = scrollableAncestorsIntersectionRect.getIntersection( scrollableAncestorRect );
		}
	}

	return scrollableAncestorsIntersectionRect;
}
