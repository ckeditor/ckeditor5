/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dialog/dialogview
 */

import {
	type EventInfo,
	type Locale,
	type CollectionChangeEvent,
	type DecoratedMethodEvent,
	KeystrokeHandler,
	FocusTracker,
	Rect,
	global,
	toUnit
} from '@ckeditor/ckeditor5-utils';
import ViewCollection from '../viewcollection';
import View from '../view';
import FormHeaderView from '../formheader/formheaderview';
import ButtonView from '../button/buttonview';
import FocusCycler, { isViewWithFocusCycler, type FocusCyclerBackwardCycleEvent, type FocusCyclerForwardCycleEvent } from '../focuscycler';
import DraggableViewMixin, { type DraggableView, type DraggableViewDragEvent } from '../bindings/draggableviewmixin';
import DialogActionsView, { type DialogActionButtonDefinition } from './dialogactionsview';

// @if CK_DEBUG_DIALOG // const RectDrawer = require( '@ckeditor/ckeditor5-utils/tests/_utils/rectdrawer' ).default;

import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';
import type EditorUI from '../editorui/editorui';
import DialogContentView from './dialogcontentview';

export enum DialogViewPosition {
	SCREEN_CENTER = 'screen-center',
	EDITOR_CENTER = 'editor-center',
	EDITOR_TOP_SIDE = 'editor-top-side',
	EDITOR_TOP_CENTER = 'editor-top-center',
	EDITOR_BOTTOM_CENTER = 'editor-bottom-center',
	EDITOR_ABOVE_CENTER = 'editor-above-center',
	EDITOR_BELOW_CENTER = 'editor-below-center'
}

const toPx = toUnit( 'px' );

/**
 * TODO
 */
export default class DialogView extends DraggableViewMixin( View ) implements DraggableView {
	/**
	 * TODO
	 */
	public readonly parts: ViewCollection;

	/**
	 * TODO
	 */
	public headerView?: FormHeaderView;

	/**
	 * TODO
	 */
	public closeButtonView?: ButtonView;

	/**
	 * TODO
	 */
	public actionsView?: DialogActionsView;

	/**
	 * TODO
	 */
	public static defaultOffset: number = 15;

	/**
	 * TODO
	 */
	public contentView?: DialogContentView;

	/**
	 * TODO
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * TODO
	 */
	private readonly _focusTracker: FocusTracker;

	/**
	 * TODO
	 */
	declare public isVisible: boolean;

	/**
	 * TODO
	 */
	declare public isTransparent: boolean;

	/**
	 * TODO
	 */
	declare public isModal: boolean;

	/**
	 * TODO
	 */
	declare public wasMoved: boolean;

	/**
	 * TODO
	 */
	declare public className: string | undefined;

	/**
	 * TODO
	 */
	declare public _top: number;

	/**
	 * TODO
	 */
	declare public _left: number;

	/**
	 * TODO
	 */
	private _getCurrentDomRoot: () => HTMLElement;

	/**
	 * TODO
	 */
	private _getViewportOffset: () => EditorUI[ 'viewportOffset' ];

	/**
	 * TODO
	 */
	declare public position: DialogViewPosition;

	/**
	 * TODO
	 */
	private readonly _focusables: ViewCollection;

	/**
	 * TODO
	 */
	private readonly _focusCycler: FocusCycler;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, getCurrentDomRoot: () => HTMLElement, getViewportOffset: () => EditorUI[ 'viewportOffset' ] ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isVisible', false );
		this.set( 'className', '' );
		this.set( 'isModal', false );
		this.set( 'isTransparent', false );
		this.set( 'wasMoved', false );
		this.set( 'position', DialogViewPosition.SCREEN_CENTER );
		this.set( '_top', 0 );
		this.set( '_left', 0 );
		this._getCurrentDomRoot = getCurrentDomRoot;
		this._getViewportOffset = getViewportOffset;

		this.decorate( 'moveTo' );

		this.parts = this.createCollection();
		this.parts.on<CollectionChangeEvent>( 'change', this._updateFocusCycleableItems.bind( this ) );

		this.keystrokes = new KeystrokeHandler();
		this._focusTracker = new FocusTracker();
		this._focusables = new ViewCollection();
		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this._focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-dialog-overlay',
					bind.if( 'isModal', 'ck-dialog-overlay__transparent', isModal => !isModal ),
					bind.if( 'isVisible', 'ck-hidden', value => !value )
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
							'ck-dialog_draggable',
							bind.to( 'className' )
						],
						style: {
							top: bind.to( '_top', top => toPx( top ) ),
							left: bind.to( '_left', left => toPx( left ) ),
							visibility: bind.if( 'isTransparent', 'hidden' )
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

		this._updateFocusCycleableItems();

		this.keystrokes.set( 'Esc', ( data, cancel ) => {
			this.fire<DialogViewCloseEvent>( 'close' );
			cancel();
		} );

		// Support for dragging the modal.
		this.on<DraggableViewDragEvent>( 'drag', ( evt: EventInfo, { deltaX, deltaY } ) => {
			this.moveBy( deltaX, deltaY );
			this.wasMoved = true;
		} );

		// Update dialog position upon window resize, if the position was not changed manually.
		this.listenTo( global.window, 'resize', () => {
			if ( this.isVisible && !this.wasMoved ) {
				this._moveToConfiguredPosition();
			}
		} );

		// Update dialog position upon document scroll, if the position was not changed manually.
		this.listenTo( global.document, 'scroll', () => {
			if ( this.isVisible && !this.wasMoved ) {
				this._moveToConfiguredPosition();
			}
		} );

		this.on( 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				// Let the content render first, then apply the position. Otherwise, the calculated DOM Rects
				// will not reflect the final look of the dialog. Note that we're not using #_moveOffScreen() here because
				// it causes a violent movement of the viewport on iOS (because the dialog still keeps the DOM focus).
				this.isTransparent = true;

				// FYI: RAF is too short. We need to wait a bit longer.
				setTimeout( () => {
					this._moveToConfiguredPosition();

					this.isTransparent = false;

					// The view must get the focus after it gets visible. But this is only possible
					// after the dialog is no longer transparent.
					this.focus();
				}, 10 );
			}
		} );

		this.keystrokes.listenTo( this.element! );

		// When a dialog is closed by opening a dialog in another editor instance,
		// the original editor instance is not aware of that.
		// That is why we need to listen to the destroy event.
		this.decorate( 'destroy' );
	}

	/**
	 * TODO
	 */
	public override get dragHandleElement(): HTMLElement | null {
		if ( this.headerView ) {
			return this.headerView.element;
		} else {
			return null;
		}
	}

	/**
	 * TODO
	 */
	public override destroy(): void {
		this.element?.remove();

		super.destroy();
	}

	/**
	 * TODO
	 */
	public reset(): void {
		while ( this.parts.length ) {
			this.parts.remove( 0 );
		}

		if ( this.actionsView ) {
			this.actionsView.reset();
		}

		this.wasMoved = false;
	}

	/**
	 * TODO
	 */
	public showHeader( label: string ): void {
		if ( !this.headerView ) {
			this.headerView = this._createHeaderView();
		}

		if ( !this.parts.has( this.headerView ) ) {
			this.parts.add( this.headerView, 0 );
		}

		this.headerView.label = label;
	}

	/**
	 * TODO
	 */
	public addContentPart( content: Array<View> ): void {
		if ( !this.contentView ) {
			this.contentView = this._createContentView();
			this.parts.add( this.contentView );
		} else {
			this.contentView.reset();
		}

		this.contentView.children.addMany( content );
		this._updateFocusCycleableItems();
	}

	/**
	 * TODO
	 */
	public setActionButtons( definitions: Array<DialogActionButtonDefinition> ): void {
		if ( !this.actionsView ) {
			this.actionsView = new DialogActionsView( this.locale );
			this.parts.add( this.actionsView );
		}

		this.actionsView.setButtons( definitions );
	}

	/**
	 * TODO
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * TODO
	 */
	public focusNext(): void {
		this._focusCycler.focusNext();
	}

	/**
	 * TODO
	 */
	public focusPrevious(): void {
		this._focusCycler.focusPrevious();
	}

	/**
	 * TODO
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

		// TODO: The same for the bottom edge?

		this._moveTo( left, top );
	}

	/**
	 * TODO
	 */
	private _moveTo( left: number, top: number ): void {
		this._left = left;
		this._top = top;
	}

	/**
	 * TODO
	 */
	public moveBy( left: number, top: number ): void {
		this.moveTo( this._left + left, this._top + top );
	}

	/**
	 * TODO
	 */
	private _moveOffScreen(): void {
		this._moveTo( -9999, -9999 );
	}

	/**
	 * TODO
	 */
	private _moveToConfiguredPosition(): void {
		const viewportRect = this._getViewportRect();
		const defaultOffset = DialogView.defaultOffset;

		// @if CK_DEBUG_DIALOG // RectDrawer.clear();
		// @if CK_DEBUG_DIALOG // RectDrawer.draw( viewportRect, { outlineColor: 'blue' }, 'Viewport' );

		switch ( this.position ) {
			case DialogViewPosition.EDITOR_TOP_SIDE: {
				const domRootRect = this._getVisibleDomRootRect( viewportRect );
				const dialogRect = this._getDialogRect();

				// @if CK_DEBUG_DIALOG // if ( domRootRect ) {
				// @if CK_DEBUG_DIALOG // 	RectDrawer.draw( domRootRect, { outlineColor: 'red', zIndex: 9999999 }, 'DOM ROOT' );
				// @if CK_DEBUG_DIALOG // }

				if ( domRootRect ) {
					const leftCoordinate = this.locale?.contentLanguageDirection === 'ltr' ?
						domRootRect.right - dialogRect.width - defaultOffset :
						domRootRect.left + defaultOffset;

					this.moveTo( leftCoordinate, domRootRect.top + defaultOffset );
				} else {
					this._moveOffScreen();
				}

				break;
			}
			case DialogViewPosition.EDITOR_CENTER: {
				const domRootRect = this._getVisibleDomRootRect( viewportRect );
				const dialogRect = this._getDialogRect();

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
				const dialogRect = this._getDialogRect();

				this.moveTo(
					Math.round( ( viewportRect.width - dialogRect.width ) / 2 ),
					Math.round( ( viewportRect.height - dialogRect.height ) / 2 )
				);

				break;
			}
			case DialogViewPosition.EDITOR_TOP_CENTER: {
				const domRootRect = this._getVisibleDomRootRect( viewportRect );
				const dialogRect = this._getDialogRect();

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
				const domRootRect = this._getVisibleDomRootRect( viewportRect );
				const dialogRect = this._getDialogRect();

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
				const domRootRect = this._getVisibleDomRootRect( viewportRect );
				const dialogRect = this._getDialogRect();

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
				const domRootRect = this._getVisibleDomRootRect( viewportRect );
				const dialogRect = this._getDialogRect();

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
	 * TODO
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
	 * TODO
	 */
	private _getDialogRect() {
		return new Rect( this.element!.firstElementChild as HTMLElement );
	}

	/**
	 * TODO
	 */
	private _getViewportRect() {
		return getConstrainedViewportRect( this._getViewportOffset() );
	}

	/**
	 * TODO
	 */
	private _updateFocusCycleableItems() {
		for ( const focusable of this._focusables ) {
			this._focusTracker.remove( focusable.element! );

			if ( isViewWithFocusCycler( focusable ) ) {
				this.stopListening( focusable.focusCycler, 'forwardCycle' );
				this.stopListening( focusable.focusCycler, 'backwardCycle' );
			}
		}

		this._focusables.clear();

		const focusables = [];

		if ( this.contentView ) {
			focusables.push( ...this.contentView.children );
		}

		if ( this.actionsView ) {
			focusables.push( this.actionsView );
		}

		if ( this.closeButtonView ) {
			focusables.push( this.closeButtonView );
		}

		focusables.forEach( focusable => {
			this._focusables.add( focusable );
			this._focusTracker.add( focusable.element! );

			if ( isViewWithFocusCycler( focusable ) ) {
				this.listenTo<FocusCyclerForwardCycleEvent>( focusable.focusCycler, 'forwardCycle', evt => {
					this.focusNext();
					evt.stop();
				} );

				this.listenTo<FocusCyclerBackwardCycleEvent>( focusable.focusCycler, 'backwardCycle', evt => {
					this.focusPrevious();
					evt.stop();
				} );
			}
		} );
	}

	/**
	 * TODO
	 */
	private _createCloseButton(): ButtonView {
		const buttonView = new ButtonView( this.locale );
		const t = this.locale!.t;

		buttonView.set( {
			label: t( 'Close' ),
			tooltip: true,
			icon: cancelIcon
		} );

		buttonView.on( 'execute', () => this.fire<DialogViewCloseEvent>( 'close' ) );

		return buttonView;
	}

	/**
	 * TODO
	 */
	private _createHeaderView(): FormHeaderView {
		const headerView = new FormHeaderView( this.locale );

		this.closeButtonView = this._createCloseButton();

		headerView.children.add( this.closeButtonView );

		return headerView;
	}

	/**
	 * TODO
	 */
	private _createContentView(): DialogContentView {
		const contentView = new DialogContentView( this.locale );

		return contentView;
	}
}

/**
 * TODO
 */
export type DialogViewCloseEvent = {
	name: 'close';
	args: [];
};

/**
 * TODO
 */
export type DialogViewMoveToEvent = DecoratedMethodEvent<DialogView, 'moveTo'>;

// Returns a viewport `Rect` shrunk by the viewport offset config from all sides.
// TODO: This is a duplicate from position.ts module. It should either be exported there or land somewhere in utils.
function getConstrainedViewportRect( viewportOffset: EditorUI[ 'viewportOffset' ] ): Rect {
	viewportOffset = Object.assign( { top: 0, bottom: 0, left: 0, right: 0 }, viewportOffset );

	const viewportRect = new Rect( global.window );

	viewportRect.top += viewportOffset.top!;
	viewportRect.height -= viewportOffset.top!;
	viewportRect.bottom -= viewportOffset.bottom!;
	viewportRect.height -= viewportOffset.bottom!;

	return viewportRect;
}
