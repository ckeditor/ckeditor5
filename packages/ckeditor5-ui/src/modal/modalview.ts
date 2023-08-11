/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { type EventInfo, type Locale, KeystrokeHandler, global, FocusTracker, type CollectionChangeEvent } from '@ckeditor/ckeditor5-utils';
import ViewCollection from '../viewcollection';
import View from '../view';
import FormHeaderView from '../formheader/formheaderview';
import ButtonView from '../button/buttonview';
import FocusCycler from '../focuscycler';

import ModalActionsView, { type ModalActionButtonDefinition } from './modalactionsview';

import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

/**
 * TODO
 */
export default class ModalView extends View {
	public readonly parts: ViewCollection;
	public readonly children: ViewCollection;
	public readonly headerView: FormHeaderView;
	public readonly contentView: View;
	public readonly closeButtonView: ButtonView;
	public readonly actionsView: ModalActionsView;
	private _transformDelta: { x: number; y: number };
	declare public isVisible: boolean;
	declare public isDraggable: boolean;
	declare public className: string | undefined;

	public readonly keystrokes: KeystrokeHandler;
	public readonly focusTracker: FocusTracker;
	private readonly _focusables: ViewCollection;
	private readonly _focusCycler: FocusCycler;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;
		const t = locale.t;

		this._transformDelta = { x: 0, y: 0 };

		/**
		 * TODO
		 */
		this.set( 'isVisible', false );

		/**
		 * TODO
		 */
		this.set( 'className', '' );

		/**
		 * TODO
		 */
		this.set( 'isDraggable', false );

		/**
		 * TODO
		 */
		this.children = this.createCollection();

		this.children.on<CollectionChangeEvent>( 'change', this._updateFocusCycleableItems.bind( this ) );

		/**
		 * TODO
		 */
		this.parts = this.createCollection();

		/**
		 * TODO
		 */
		this.headerView = new FormHeaderView( locale );
		this.headerView.bind( 'class' ).to( this, 'isDraggable', isDraggable => isDraggable ? 'ck-form__header_draggable' : '' );

		this.closeButtonView = new ButtonView( locale );

		this.closeButtonView.set( {
			label: t( 'Close' ),
			tooltip: true,
			icon: cancelIcon
		} );

		this.closeButtonView.on( 'execute', () => this.fire( 'close' ) );

		this.headerView.children.add( this.closeButtonView );

		/**
		 * TODO
		 */
		this.actionsView = new ModalActionsView( locale );
		this.actionsView.focusCycler.on( 'forwardCycle', () => this._focusCycler.focusNext() );
		this.actionsView.focusCycler.on( 'backwardCycle', () => this._focusCycler.focusPrevious() );

		/**
		 * TODO
		 */
		this.contentView = new View( locale );

		this.contentView.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-modal__content' ]
			},
			children: this.children
		} );

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * TODO
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * TODO
		 */
		this._focusables = new ViewCollection();

		/**
		 * TODO
		 */
		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
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
					'ck-modal-overlay',
					bind.if( 'isDraggable', 'ck-modal-overlay__transparent' ),
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
							'ck-modal',
							bind.to( 'className' )
						]
					},
					children: this.parts
				}
			]
		} );
	}

	public override render(): void {
		super.render();

		this._updateFocusCycleableItems();

		this.keystrokes.listenTo( this.element! );

		const headerView = this.headerView;

		// Support for dragging the modal.
		// TODO: Don't allow dragging beyond the edge of the viewport.
		// TODO: Disable dragging when the mobile view is on.
		headerView.on( 'render', () => {
			let isDragging = false;
			let startCoordinates: { x: number; y: number } = { x: 0, y: 0 };

			const onDragStart = ( evt: EventInfo, domEvt: MouseEvent | TouchEvent ) => {
				if ( !this.isDraggable ) {
					return;
				}

				const x = ( domEvt instanceof TouchEvent ? domEvt.touches[ 0 ] : domEvt ).clientX;
				const y = ( domEvt instanceof TouchEvent ? domEvt.touches[ 0 ] : domEvt ).clientY;

				startCoordinates = {
					x: x - this._transformDelta.x,
					y: y - this._transformDelta.y
				};

				isDragging = true;
			};

			const onDragEnd = () => {
				if ( !this.isDraggable ) {
					return;
				}

				isDragging = false;
			};

			const onDrag = ( evt: EventInfo, domEvt: MouseEvent | TouchEvent ) => {
				if ( !this.isDraggable || !isDragging ) {
					return;
				}

				const x = ( domEvt instanceof TouchEvent ? domEvt.touches[ 0 ] : domEvt ).clientX;
				const y = ( domEvt instanceof TouchEvent ? domEvt.touches[ 0 ] : domEvt ).clientY;

				this._transformDelta = {
					x: Math.round( x - startCoordinates.x ),
					y: Math.round( y - startCoordinates.y )
				};

				( this.element!.querySelector( '.ck-modal' )! as HTMLElement ).style.transform =
					`translate3d( ${ this._transformDelta.x }px, ${ this._transformDelta.y }px, 0)`;
			};

			this.listenTo( headerView.element!, 'mousedown', onDragStart );
			this.listenTo( global.document!, 'mouseup', onDragEnd );
			this.listenTo( global.document!, 'mousemove', onDrag );

			this.listenTo( headerView.element!, 'touchstart', onDragStart );
			this.listenTo( global.document!, 'touchend', onDragEnd );
			this.listenTo( global.document!, 'touchmove', onDrag );
		} );
	}

	/**
	 * TODO
	 */
	public clear(): void {
		while ( this.children.length ) {
			this.children.remove( 0 );
		}

		while ( this.parts.length ) {
			this.parts.remove( 0 );
		}

		this.actionsView.clear();

		( this.element!.querySelector( '.ck-modal' )! as HTMLElement ).style.transform = '';
		this._transformDelta = { x: 0, y: 0 };
	}

	/**
	 * TODO
	 */
	public showHeader( label: string ): void {
		this.parts.add( this.headerView, 0 );
		this.headerView.label = label;
	}

	public setActionButtons( definitions: Array<ModalActionButtonDefinition> ): void {
		this.parts.add( this.actionsView );

		this.actionsView.setButtons( definitions );
	}

	public addContentPart(): void {
		this.parts.add( this.contentView );
	}

	public focus(): void {
		this._focusCycler.focusFirst();
	}

	public focusNext(): void {
		this._focusCycler.focusNext();
	}

	public focusPrevious(): void {
		this._focusCycler.focusPrevious();
	}

	/**
	 * TODO
	 */
	private _updateFocusCycleableItems() {
		for ( const focusable of this._focusables ) {
			this.focusTracker.remove( focusable.element! );
		}

		this._focusables.clear();

		[ ...this.children, this.actionsView, this.closeButtonView ].forEach( v => {
			this._focusables.add( v );
			this.focusTracker.add( v.element! );
		} );
	}
}
