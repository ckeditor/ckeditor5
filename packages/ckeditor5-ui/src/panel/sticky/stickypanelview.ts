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
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

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
	declare public _isStickyToTheLimiter: boolean;

	/**
	 * Set `true` if the sticky panel uses the {@link #viewportTopOffset},
	 * i.e. not {@link #_isStickyToTheLimiter} and the {@link #viewportTopOffset}
	 * is not `0`.
	 *
	 * @private
	 * @readonly
	 * @observable
	 */
	declare public _hasViewportTopOffset: boolean;

	/**
	 * The DOM bounding client rect of the {@link module:ui/view~View#element} of the panel.
	 */
	private _panelRect?: DOMRect;

	/**
	 * The DOM bounding client rect of the {@link #limiterElement}
	 * of the panel.
	 */
	private _limiterRect?: DOMRect;

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
		this.set( '_isStickyToTheLimiter', false );
		this.set( '_hasViewportTopOffset', false );

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
					bind.if( '_isStickyToTheLimiter', 'ck-sticky-panel__content_sticky_bottom-limit' )
				],
				style: {
					width: bind.to( 'isSticky', isSticky => {
						return isSticky ? toPx( this._contentPanelPlaceholder.getBoundingClientRect().width ) : null;
					} ),

					top: bind.to( '_hasViewportTopOffset', _hasViewportTopOffset => {
						return _hasViewportTopOffset ? toPx( this.viewportTopOffset ) : null;
					} ),

					bottom: bind.to( '_isStickyToTheLimiter', _isStickyToTheLimiter => {
						return _isStickyToTheLimiter ? toPx( this.limiterBottomOffset ) : null;
					} ),

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

		// Update sticky state of the panel as the window is being scrolled.
		this.listenTo( global.window, 'scroll', () => {
			this._checkIfShouldBeSticky();
		} );

		// Synchronize with `model.isActive` because sticking an inactive panel is pointless.
		this.listenTo<ObservableChangeEvent>( this, 'change:isActive', () => {
			this._checkIfShouldBeSticky();
		} );
	}

	/**
	 * Analyzes the environment to decide whether the panel should
	 * be sticky or not.
	 */
	private _checkIfShouldBeSticky(): void {
		const panelRect = this._panelRect = this._contentPanel.getBoundingClientRect();
		let limiterRect: DOMRect;

		if ( !this.limiterElement ) {
			this.isSticky = false;
		} else {
			limiterRect = this._limiterRect = this.limiterElement.getBoundingClientRect();

			// The panel must be active to become sticky.
			this.isSticky = this.isActive &&
				// The limiter's top edge must be beyond the upper edge of the visible viewport (+the viewportTopOffset).
				limiterRect.top < this.viewportTopOffset &&
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
				limiterRect!.bottom < panelRect.height + this.limiterBottomOffset + this.viewportTopOffset;
			this._hasViewportTopOffset = !this._isStickyToTheLimiter && !!this.viewportTopOffset;
			this._marginLeft = this._isStickyToTheLimiter ? null : toPx( -global.window.scrollX );
		}
		// Detach the panel from the top edge of the viewport.
		else {
			this._isStickyToTheLimiter = false;
			this._hasViewportTopOffset = false;
			this._marginLeft = null;
		}
	}
}
