/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dialog/dialogview
 */

import {
	KeystrokeHandler,
	FocusTracker,
	Rect,
	global,
	toUnit,
	type EventInfo,
	type Locale,
	type DecoratedMethodEvent,
	type KeystrokeHandlerOptions
} from '@ckeditor/ckeditor5-utils';
import { IconCancel } from '@ckeditor/ckeditor5-icons';
import ViewCollection from '../viewcollection.js';
import View from '../view.js';
import FormHeaderView from '../formheader/formheaderview.js';
import ButtonView from '../button/buttonview.js';
import { type ButtonExecuteEvent } from '../button/button.js';
import FocusCycler, { isViewWithFocusCycler,
	type FocusableView,
	isFocusable
}
	from '../focuscycler.js';
import DraggableViewMixin, { type DraggableView, type DraggableViewDragEvent } from '../bindings/draggableviewmixin.js';
import DialogActionsView, { type DialogActionButtonDefinition } from './dialogactionsview.js';
import DialogContentView from './dialogcontentview.js';
import type EditorUI from '../editorui/editorui.js';

import '../../theme/components/dialog/dialog.css';
// @if CK_DEBUG_DIALOG // const RectDrawer = require( '@ckeditor/ckeditor5-utils/tests/_utils/rectdrawer' ).default;

/**
 * Available dialog view positions:
 *
 * * `DialogViewPosition.SCREEN_CENTER` &ndash; A fixed position in the center of the screen.
 * * `DialogViewPosition.EDITOR_CENTER` &ndash; A dynamic position in the center of the editor editable area.
 * * `DialogViewPosition.EDITOR_TOP_SIDE` &ndash; A dynamic position at the top-right (for the left-to-right languages)
 * or top-left (for right-to-left languages) corner of the editor editable area.
 * * `DialogViewPosition.EDITOR_TOP_CENTER` &ndash; A dynamic position at the top-center of the editor editable area.
 * * `DialogViewPosition.EDITOR_BOTTOM_CENTER` &ndash; A dynamic position at the bottom-center of the editor editable area.
 * * `DialogViewPosition.EDITOR_ABOVE_CENTER` &ndash; A dynamic position centered above the editor editable area.
 * * `DialogViewPosition.EDITOR_BELOW_CENTER` &ndash; A dynamic position centered below the editor editable area.
 *
 * The position of a dialog is specified by a {@link module:ui/dialog/dialog~DialogDefinition#position `position` property} of a
 * definition passed to the {@link module:ui/dialog/dialog~Dialog#show} method.
 */
export const DialogViewPosition = {
	SCREEN_CENTER: 'screen-center',
	EDITOR_CENTER: 'editor-center',
	EDITOR_TOP_SIDE: 'editor-top-side',
	EDITOR_TOP_CENTER: 'editor-top-center',
	EDITOR_BOTTOM_CENTER: 'editor-bottom-center',
	EDITOR_ABOVE_CENTER: 'editor-above-center',
	EDITOR_BELOW_CENTER: 'editor-below-center'
} as const;

const toPx = /* #__PURE__ */ toUnit( 'px' );

/**
 * A dialog view class.
 */
export default class DialogView extends /* #__PURE__ */ DraggableViewMixin( View ) implements DraggableView {
	/**
	 * A collection of the child views inside of the dialog.
	 * A dialog can have 3 optional parts: header, content, and actions.
	 */
	public readonly parts: ViewCollection;

	/**
	 * A header view of the dialog. It is also a drag handle of the dialog.
	 */
	public headerView?: FormHeaderView;

	/**
	 * A close button view. It is automatically added to the header view if present.
	 */
	public closeButtonView?: ButtonView;

	/**
	 * A view with the action buttons available to the user.
	 */
	public actionsView?: DialogActionsView;

	/**
	 * A default dialog element offset from the reference element (e.g. editor editable area).
	 */
	public static defaultOffset: number = 15;

	/**
	 * A view with the dialog content.
	 */
	public contentView?: DialogContentView;

	/**
	 * A keystroke handler instance.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * A focus tracker instance.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * A flag indicating if the dialog was moved manually. If so, its position
	 * will not be updated automatically upon window resize or document scroll.
	 */
	public wasMoved: boolean = false;

	/**
	 * A flag indicating if this dialog view is a modal.
	 *
	 * @observable
	 */
	declare public isModal: boolean;

	/**
	 * A label for the view dialog element to be used by the assistive technologies.
	 *
	 * @observable
	 */
	declare public ariaLabel: string;

	/**
	 * A custom class name to be added to the dialog element.
	 *
	 * @observable
	 */
	declare public className: string | undefined;

	/**
	 * The position of the dialog view.
	 *
	 * @observable
	 */
	declare public position: typeof DialogViewPosition[ keyof typeof DialogViewPosition ] | null;

	/**
	 * A flag indicating that the dialog should be shown. Once set to `true`, the dialog will be shown
	 * after its position is calculated. Until then, the dialog is transparent and not visible.
	 *
	 * See {@link #_isTransparent} property.
	 *
	 * @observable
	 * @internal
	 */
	declare public _isVisible: boolean;

	/**
	 * A flag indicating if a dialog is transparent. It is used to prevent the dialog from being visible
	 * before its position is calculated.
	 *
	 * @observable
	 * @internal
	 */
	declare public _isTransparent: boolean;

	/**
	 * The calculated dialog `top` CSS property used for positioning.
	 *
	 * @observable
	 * @internal
	 */
	declare public _top: number;

	/**
	 * The calculated dialog `left` CSS property used for positioning.
	 *
	 * @observable
	 * @internal
	 */
	declare public _left: number;

	/**
	 * A callback returning the DOM root that requested the dialog.
	 */
	private _getCurrentDomRoot: () => HTMLElement;

	/**
	 * A callback returning the configured editor viewport offset.
	 */
	private _getViewportOffset: () => EditorUI[ 'viewportOffset' ];

	/**
	 * The list of the focusable elements inside the dialog view.
	 */
	private readonly _focusables: ViewCollection<FocusableView>;

	/**
	 * The focus cycler instance.
	 */
	private readonly _focusCycler: FocusCycler;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale,
		{
			getCurrentDomRoot,
			getViewportOffset,
			keystrokeHandlerOptions
		}: {
			getCurrentDomRoot: () => HTMLElement;
			getViewportOffset: () => EditorUI[ 'viewportOffset' ];
			keystrokeHandlerOptions?: KeystrokeHandlerOptions;
		}
	) {
		super( locale );

		const bind = this.bindTemplate;
		const t = locale.t;

		this.set( 'className', '' );
		this.set( 'ariaLabel', t( 'Editor dialog' ) );
		this.set( 'isModal', false );
		this.set( 'position', DialogViewPosition.SCREEN_CENTER );
		this.set( '_isVisible', false );
		this.set( '_isTransparent', false );
		this.set( '_top', 0 );
		this.set( '_left', 0 );
		this._getCurrentDomRoot = getCurrentDomRoot;
		this._getViewportOffset = getViewportOffset;

		this.decorate( 'moveTo' );

		this.parts = this.createCollection();

		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();
		this._focusables = new ViewCollection();
		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			},
			keystrokeHandlerOptions
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-dialog-overlay',
					bind.if( 'isModal', 'ck-dialog-overlay__transparent', isModal => !isModal ),
					bind.if( '_isVisible', 'ck-hidden', value => !value )
				],
				// Prevent from editor losing focus when clicking on the modal overlay.
				tabindex: '-1'
			},
			children: [
				{
					tag: 'div',
					attributes: {
						tabindex: '-1',
						class: [
							'ck',
							'ck-dialog',
							bind.if( 'isModal', 'ck-dialog_modal' ),
							bind.to( 'className' )
						],
						role: 'dialog',
						'aria-label': bind.to( 'ariaLabel' ),
						style: {
							top: bind.to( '_top', top => toPx( top ) ),
							left: bind.to( '_left', left => toPx( left ) ),
							visibility: bind.if( '_isTransparent', 'hidden' )
						}
					},
					children: this.parts
				}
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.keystrokes.set( 'Esc', ( data, cancel ) => {
			// Do not react to the Esc key if the event has already been handled and defaultPrevented
			// by some logic of the dialog guest (child) view (https://github.com/ckeditor/ckeditor5/issues/17343).
			if ( !data.defaultPrevented ) {
				this.fire<DialogViewCloseEvent>( 'close', { source: 'escKeyPress' } );
				cancel();
			}
		} );

		// Support for dragging the modal.
		this.on<DraggableViewDragEvent>( 'drag', ( evt: EventInfo, { deltaX, deltaY } ) => {
			this.wasMoved = true;
			this.moveBy( deltaX, deltaY );
		} );

		// Update dialog position upon window resize, if the position was not changed manually.
		this.listenTo( global.window, 'resize', () => {
			if ( this._isVisible && !this.wasMoved ) {
				this.updatePosition();
			}
		} );

		// Update dialog position upon document scroll, if the position was not changed manually.
		this.listenTo( global.document, 'scroll', () => {
			if ( this._isVisible && !this.wasMoved ) {
				this.updatePosition();
			}
		} );

		this.on( 'change:_isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				// Let the content render first, then apply the position. Otherwise, the calculated DOM Rects
				// will not reflect the final look of the dialog. Note that we're not using #_moveOffScreen() here because
				// it causes a violent movement of the viewport on iOS (because the dialog still keeps the DOM focus).
				this._isTransparent = true;

				// FYI: RAF is too short. We need to wait a bit longer.
				setTimeout( () => {
					this.updatePosition();

					this._isTransparent = false;

					// The view must get the focus after it gets visible. But this is only possible
					// after the dialog is no longer transparent.
					this.focus();
				}, 10 );
			}
		} );

		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * Returns the element that should be used as a drag handle.
	 */
	public override get dragHandleElement(): HTMLElement | null {
		// Modals should not be draggable.
		if ( this.headerView && !this.isModal ) {
			return this.headerView.element;
		} else {
			return null;
		}
	}

	/**
	 * Creates the dialog parts. Which of them are created depends on the arguments passed to the method.
	 * There are no rules regarding the dialog construction, that is, no part is mandatory.
	 * Each part can only be created once.
	 *
	 * @internal
	 */
	public setupParts( { icon, title, hasCloseButton = true, content, actionButtons }: {
		icon?: string;
		title?: string;
		hasCloseButton?: boolean;
		content?: View | Array<View>;
		actionButtons?: Array<DialogActionButtonDefinition>;
	} ): void {
		if ( title ) {
			this.headerView = new FormHeaderView( this.locale, { icon } );

			if ( hasCloseButton ) {
				this.closeButtonView = this._createCloseButton();
				this.headerView.children.add( this.closeButtonView );
			}

			this.headerView.label = title;
			this.ariaLabel = title;
			this.parts.add( this.headerView, 0 );
		}

		if ( content ) {
			// Normalize the content specified in the arguments.
			if ( content instanceof View ) {
				content = [ content ];
			}

			this.contentView = new DialogContentView( this.locale );
			this.contentView.children.addMany( content );
			this.parts.add( this.contentView );
		}

		if ( actionButtons ) {
			this.actionsView = new DialogActionsView( this.locale );
			this.actionsView.setButtons( actionButtons );
			this.parts.add( this.actionsView );
		}

		this._updateFocusCyclableItems();
	}

	/**
	 * Focuses the first focusable element inside the dialog.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Normalizes the passed coordinates to make sure the dialog view
	 * is displayed within the visible viewport and moves it there.
	 *
	 * @internal
	 */
	public moveTo( left: number, top: number ): void {
		const viewportRect = this._getViewportRect();
		const dialogRect = this._getDialogRect();

		// Don't let the dialog go beyond the right edge of the viewport.
		if ( left + dialogRect.width > viewportRect.right ) {
			left = viewportRect.right - dialogRect.width;
		}

		// Don't let the dialog go beyond the left edge of the viewport.
		if ( left < viewportRect.left ) {
			left = viewportRect.left;
		}

		// Don't let the dialog go beyond the top edge of the viewport.
		if ( top < viewportRect.top ) {
			top = viewportRect.top;
		}

		// Note: We don't do the same for the bottom edge to allow users to resize the window vertically
		// and let the dialog to stay put instead of covering the editing root.

		this._moveTo( left, top );
	}

	/**
	 * Moves the dialog to the specified coordinates.
	 */
	private _moveTo( left: number, top: number ): void {
		this._left = left;
		this._top = top;
	}

	/**
	 * Moves the dialog by the specified offset.
	 *
	 * @internal
	 */
	public moveBy( left: number, top: number ): void {
		this.moveTo( this._left + left, this._top + top );
	}

	/**
	 * Moves the dialog view to the off-screen position.
	 * Used when there is no space to display the dialog.
	 */
	private _moveOffScreen(): void {
		this._moveTo( -9999, -9999 );
	}

	/**
	 * Recalculates the dialog according to the set position and viewport,
	 * and moves it to the new position.
	 */
	public updatePosition(): void {
		if ( !this.element || !this.element.parentNode ) {
			return;
		}

		const viewportRect = this._getViewportRect();

		// Actual position may be different from the configured one if there's no DOM root.
		let configuredPosition = this.position;
		let domRootRect;

		if ( !this._getCurrentDomRoot() ) {
			configuredPosition = DialogViewPosition.SCREEN_CENTER;
		} else {
			domRootRect = this._getVisibleDomRootRect( viewportRect );
		}

		const defaultOffset = DialogView.defaultOffset;
		const dialogRect = this._getDialogRect();

		// @if CK_DEBUG_DIALOG // RectDrawer.clear();
		// @if CK_DEBUG_DIALOG // RectDrawer.draw( viewportRect, { outlineColor: 'blue' }, 'Viewport' );

		switch ( configuredPosition ) {
			case DialogViewPosition.EDITOR_TOP_SIDE: {
				// @if CK_DEBUG_DIALOG // if ( domRootRect ) {
				// @if CK_DEBUG_DIALOG // 	RectDrawer.draw( domRootRect, { outlineColor: 'red', zIndex: 9999999 }, 'DOM ROOT' );
				// @if CK_DEBUG_DIALOG // }

				if ( domRootRect ) {
					const leftCoordinate = this.locale!.contentLanguageDirection === 'ltr' ?
						domRootRect.right - dialogRect.width - defaultOffset :
						domRootRect.left + defaultOffset;

					this.moveTo( leftCoordinate, domRootRect.top + defaultOffset );
				} else {
					this._moveOffScreen();
				}

				break;
			}
			case DialogViewPosition.EDITOR_CENTER: {
				if ( domRootRect ) {
					this.moveTo(
						Math.round( domRootRect.left + domRootRect.width / 2 - dialogRect.width / 2 ),
						Math.round( domRootRect.top + domRootRect.height / 2 - dialogRect.height / 2 )
					);
				} else {
					this._moveOffScreen();
				}

				break;
			}
			case DialogViewPosition.SCREEN_CENTER: {
				this.moveTo(
					Math.round( ( viewportRect.width - dialogRect.width ) / 2 ),
					Math.round( ( viewportRect.height - dialogRect.height ) / 2 )
				);

				break;
			}
			case DialogViewPosition.EDITOR_TOP_CENTER: {
				// @if CK_DEBUG_DIALOG // if ( domRootRect ) {
				// @if CK_DEBUG_DIALOG // 	RectDrawer.draw( domRootRect, { outlineColor: 'red', zIndex: 9999999 }, 'DOM ROOT' );
				// @if CK_DEBUG_DIALOG // }

				if ( domRootRect ) {
					this.moveTo(
						Math.round( domRootRect.left + domRootRect.width / 2 - dialogRect.width / 2 ),
						domRootRect.top + defaultOffset
					);
				} else {
					this._moveOffScreen();
				}

				break;
			}
			case DialogViewPosition.EDITOR_BOTTOM_CENTER: {
				// @if CK_DEBUG_DIALOG // if ( domRootRect ) {
				// @if CK_DEBUG_DIALOG // 	RectDrawer.draw( domRootRect, { outlineColor: 'red', zIndex: 9999999 }, 'DOM ROOT' );
				// @if CK_DEBUG_DIALOG // }

				if ( domRootRect ) {
					this.moveTo(
						Math.round( domRootRect.left + domRootRect.width / 2 - dialogRect.width / 2 ),
						domRootRect.bottom - dialogRect.height - defaultOffset
					);
				} else {
					this._moveOffScreen();
				}

				break;
			}
			case DialogViewPosition.EDITOR_ABOVE_CENTER: {
				// @if CK_DEBUG_DIALOG // if ( domRootRect ) {
				// @if CK_DEBUG_DIALOG // 	RectDrawer.draw( domRootRect, { outlineColor: 'red', zIndex: 9999999 }, 'DOM ROOT' );
				// @if CK_DEBUG_DIALOG // }

				if ( domRootRect ) {
					this.moveTo(
						Math.round( domRootRect.left + domRootRect.width / 2 - dialogRect.width / 2 ),
						domRootRect.top - dialogRect.height - defaultOffset
					);
				} else {
					this._moveOffScreen();
				}

				break;
			}
			case DialogViewPosition.EDITOR_BELOW_CENTER: {
				// @if CK_DEBUG_DIALOG // if ( domRootRect ) {
				// @if CK_DEBUG_DIALOG // 	RectDrawer.draw( domRootRect, { outlineColor: 'red', zIndex: 9999999 }, 'DOM ROOT' );
				// @if CK_DEBUG_DIALOG // }

				if ( domRootRect ) {
					this.moveTo(
						Math.round( domRootRect.left + domRootRect.width / 2 - dialogRect.width / 2 ),
						domRootRect.bottom + defaultOffset
					);
				} else {
					this._moveOffScreen();
				}

				break;
			}
		}
	}

	/**
	 * Calculates the visible DOM root part.
	 */
	private _getVisibleDomRootRect( viewportRect: Rect ): Rect | null {
		let visibleDomRootRect = new Rect( this._getCurrentDomRoot() ).getVisible();

		if ( !visibleDomRootRect ) {
			return null;
		} else {
			visibleDomRootRect = viewportRect.getIntersection( visibleDomRootRect );

			if ( !visibleDomRootRect ) {
				return null;
			}
		}

		return visibleDomRootRect;
	}

	/**
	 * Calculates the dialog element rect.
	 */
	private _getDialogRect() {
		return new Rect( this.element!.firstElementChild as HTMLElement );
	}

	/**
	 * Returns a viewport `Rect` shrunk by the viewport offset config from all sides.
	 *
	 * TODO: This is a duplicate from position.ts module. It should either be exported there or land somewhere in utils.
	 */
	private _getViewportRect(): Rect {
		const viewportRect = new Rect( global.window );

		// Modals should not be restricted by the viewport offsets as they are always displayed on top of the page.
		if ( this.isModal ) {
			return viewportRect;
		}

		const viewportOffset = {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			...this._getViewportOffset()
		};

		viewportRect.top += viewportOffset.top!;
		viewportRect.height -= viewportOffset.top!;
		viewportRect.bottom -= viewportOffset.bottom!;
		viewportRect.height -= viewportOffset.bottom!;
		viewportRect.left += viewportOffset.left!;
		viewportRect.right -= viewportOffset.right!;
		viewportRect.width -= viewportOffset.left! + viewportOffset.right!;

		return viewportRect;
	}

	/**
	 * Collects all focusable elements inside the dialog parts
	 * and adds them to the focus tracker and focus cycler.
	 */
	private _updateFocusCyclableItems() {
		const focusables: Array<FocusableView> = [];

		if ( this.contentView ) {
			for ( const child of this.contentView.children ) {
				if ( isFocusable( child ) ) {
					focusables.push( child );
				}
			}
		}

		if ( this.actionsView ) {
			focusables.push( this.actionsView );
		}

		if ( this.closeButtonView ) {
			focusables.push( this.closeButtonView );
		}

		focusables.forEach( focusable => {
			this._focusables.add( focusable );
			this.focusTracker.add( focusable.element! );

			if ( isViewWithFocusCycler( focusable ) ) {
				this._focusCycler.chain( focusable.focusCycler );
			}
		} );
	}

	/**
	 * Creates the close button view that is displayed in the header view corner.
	 */
	private _createCloseButton(): ButtonView {
		const buttonView = new ButtonView( this.locale );
		const t = this.locale!.t;

		buttonView.set( {
			label: t( 'Close' ),
			tooltip: true,
			icon: IconCancel
		} );

		buttonView.on<ButtonExecuteEvent>( 'execute', () => this.fire<DialogViewCloseEvent>( 'close', { source: 'closeButton' } ) );

		return buttonView;
	}
}

/**
 * An event fired when the dialog is closed.
 *
 * @eventName ~DialogView#close
 */
export type DialogViewCloseEvent = {
	name: 'close';
	args: [ { source: 'closeButton' | 'escKeyPress' } ];
};

/**
 * An event fired when the dialog is moved.
 *
 * @eventName ~DialogView#moveTo
 */
export type DialogViewMoveToEvent = DecoratedMethodEvent<DialogView, 'moveTo'>;
