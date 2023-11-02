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
	KeystrokeHandler,
	FocusTracker
} from '@ckeditor/ckeditor5-utils';
import ViewCollection from '../viewcollection';
import View from '../view';
import FormHeaderView from '../formheader/formheaderview';
import ButtonView from '../button/buttonview';
import FocusCycler, { type FocusCyclerBackwardCycleEvent, type FocusCyclerForwardCycleEvent } from '../focuscycler';
import DraggableViewMixin, { type DraggableView, type DraggableViewDragEvent } from '../bindings/draggableviewmixin';
import DialogActionsView, { type DialogActionButtonDefinition } from './dialogactionsview';

import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

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
	declare public isDraggable: boolean;

	/**
	 * TODO
	 */
	declare public className: string | undefined;

	/**
	 * TODO
	 */
	private readonly focusables: ViewCollection;

	/**
	 * TODO
	 */
	private readonly focusCycler: FocusCycler;

	/**
	 * TODO
	 */
	declare public _transform: string;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isVisible', false );
		this.set( 'className', '' );
		this.set( 'isDraggable', false );
		this.set( '_transform', '' );

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
							transform: bind.to( '_transform' )
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
		this.on<DraggableViewDragEvent>( 'drag', ( evt: EventInfo, { transformDelta } ) => {
			this._transform = `translate3d( ${ transformDelta.x }px, ${ transformDelta.y }px, 0)`;
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

		if ( this.headerView ) {
			this.resetDrag();
		}

		this._transform = '';
	}

	/**
	 * TODO
	 */
	public showHeader( label: string ): void {
		if ( !this.headerView ) {
			this.headerView = this._createHeaderView();
			this._updateFocusCycleableItems();
		}

		this.parts.add( this.headerView, 0 );
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

export type DialogViewCloseEvent = {
	name: 'close';
	args: [];
};
