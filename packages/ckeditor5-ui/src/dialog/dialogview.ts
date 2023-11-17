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
import FocusCycler, { type FocusCyclerBackwardCycleEvent, type FocusCyclerForwardCycleEvent } from '../focuscycler';
import DraggableViewMixin, { type DraggableView, type DraggableViewDragEvent } from '../bindings/draggableviewmixin';
import DialogActionsView, { type DialogActionButtonDefinition } from './dialogactionsview';

// @if CK_DEBUG_DIALOG // const RectDrawer = require( '@ckeditor/ckeditor5-utils/tests/_utils/rectdrawer' ).default;

import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';
import type EditorUI from '../editorui/editorui';

export enum DialogViewPosition {
	SCREEN_CENTER = 'screen-center',
	CURRENT_ROOT_CENTER = 'current-root-center',
	CURRENT_ROOT_NE = 'current-root-ne',
	CURRENT_ROOT_NW = 'current-root-nw'
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
	public readonly children: ViewCollection;

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
	public readonly contentView: View;

	/**
	 * TODO
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * TODO
	 */
	public readonly focusTracker: FocusTracker;

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
	declare public isDraggable: boolean;

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
	private readonly focusables: ViewCollection;

	/**
	 * TODO
	 */
	private readonly focusCycler: FocusCycler;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, getCurrentDomRoot: () => HTMLElement, getViewportOffset: () => EditorUI[ 'viewportOffset' ] ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isVisible', false );
		this.set( 'className', '' );
		this.set( 'isDraggable', false );
		this.set( 'isTransparent', false );
		this.set( 'wasMoved', false );
		this.set( 'position', DialogViewPosition.SCREEN_CENTER );
		this.set( '_top', 0 );
		this.set( '_left', 0 );
		this._getCurrentDomRoot = getCurrentDomRoot;
		this._getViewportOffset = getViewportOffset;

		this.decorate( 'moveTo' );

		this.children = this.createCollection();
		this.children.on<CollectionChangeEvent>( 'change', this._updateFocusCycleableItems.bind( this ) );

		this.parts = this.createCollection();
		this.contentView = this._createContentView();

		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();
		this.focusables = new ViewCollection();
		this.focusCycler = new FocusCycler( {
			focusables: this.focusables,
			focusTracker: this.focusTracker,
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
					bind.if( 'isDraggable', 'ck-dialog-overlay__transparent' ),
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
							bind.if( 'isDraggable', 'ck-dialog_draggable' ),
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
		// TODO: Don't allow dragging beyond the edge of the viewport.
		// TODO: Disable dragging when the mobile view is on.
		this.on<DraggableViewDragEvent>( 'drag', ( evt: EventInfo, { x, y } ) => {
			this.moveBy( x, y );
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
				}, 10 );
			}
		} );

		this.keystrokes.listenTo( this.element! );
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
	public reset(): void {
		while ( this.children.length ) {
			this.children.remove( 0 );
		}

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
			this._updateFocusCycleableItems();
		}

		if ( !this.parts.has( this.headerView ) ) {
			this.parts.add( this.headerView, 0 );
		}

		this.headerView.label = label;
	}

	/**
	 * TODO
	 */
	public setActionButtons( definitions: Array<DialogActionButtonDefinition> ): void {
		if ( !this.actionsView ) {
			this.actionsView = this._createActionsView();
			this._updateFocusCycleableItems();
		}

		this.parts.add( this.actionsView );
		this.actionsView.setButtons( definitions );
	}

	/**
	 * TODO
	 */
	public addContentPart(): void {
		this.parts.add( this.contentView );
	}

	/**
	 * TODO
	 */
	public focus(): void {
		this.focusCycler.focusFirst();
	}

	/**
	 * TODO
	 */
	public focusNext(): void {
		this.focusCycler.focusNext();
	}

	/**
	 * TODO
	 */
	public focusPrevious(): void {
		this.focusCycler.focusPrevious();
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
			case DialogViewPosition.CURRENT_ROOT_NE: {
				const domRootRect = this._getVisibleDomRootRect( viewportRect );
				const dialogRect = this._getDialogRect();

				// @if CK_DEBUG_DIALOG // if ( domRootRect ) {
				// @if CK_DEBUG_DIALOG // 	RectDrawer.draw( domRootRect, { outlineColor: 'red', zIndex: 9999999 }, 'DOM ROOT' );
				// @if CK_DEBUG_DIALOG // }

				if ( domRootRect ) {
					this.moveTo( domRootRect.right - dialogRect.width - defaultOffset, domRootRect.top + defaultOffset );
				} else {
					this._moveOffScreen();
				}

				break;
			}
			case DialogViewPosition.CURRENT_ROOT_NW: {
				const domRootRect = this._getVisibleDomRootRect( viewportRect );

				if ( domRootRect ) {
					this.moveTo( domRootRect.left + defaultOffset, domRootRect.top + defaultOffset );
				} else {
					this._moveOffScreen();
				}

				break;
			}
			case DialogViewPosition.CURRENT_ROOT_CENTER: {
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
		for ( const focusable of this.focusables ) {
			this.focusTracker.remove( focusable.element! );
		}

		this.focusables.clear();

		const focusables = [ ...this.children ];

		if ( this.actionsView ) {
			focusables.push( this.actionsView );
		}

		if ( this.closeButtonView ) {
			focusables.push( this.closeButtonView );
		}

		focusables.forEach( v => {
			this.focusables.add( v );
			this.focusTracker.add( v.element! );
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
	private _createActionsView(): DialogActionsView {
		const actionsView = new DialogActionsView( this.locale );

		actionsView.focusCycler.on<FocusCyclerForwardCycleEvent>( 'forwardCycle', evt => {
			this.focusCycler.focusNext();
			evt.stop();
		} );

		actionsView.focusCycler.on<FocusCyclerBackwardCycleEvent>( 'backwardCycle', evt => {
			this.focusCycler.focusPrevious();
			evt.stop();
		} );

		return actionsView;
	}

	/**
	 * TODO
	 */
	private _createContentView(): View {
		const contentView = new View( this.locale );

		contentView.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-dialog__content' ]
			},
			children: this.children
		} );

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
