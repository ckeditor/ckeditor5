/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/modal/modal
 */

import { type Editor, Plugin } from '@ckeditor/ckeditor5-core';
import { type EventInfo, type Locale, KeystrokeHandler, global } from '@ckeditor/ckeditor5-utils';
import type ViewCollection from '../viewcollection';
import View from '../view';
import FormHeaderView from '../formheader/formheaderview';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

import '../../theme/components/modal/modal.css';
import ButtonView from '../button/buttonview';
import type Button from '../button/button';

export default class Modal extends Plugin {
	public readonly view: ModalView;
	private _onHide: ( ( modal: Modal ) => void ) | undefined;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Modal' as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		/**
		 * TODO
		 */
		this.view = new ModalView( editor.locale );

		this.view.keystrokes.set( 'Esc', ( data, cancel ) => {
			this.hide();
			cancel();
		} );

		this.view.on( 'close', () => {
			this.hide();
		} );

		editor.ui.view.body.add( this.view );
		editor.ui.focusTracker.add( this.view.element! );
	}

	/**
	 * TODO
	 *
	 * @param childView
	 */
	public show( { onShow, onHide, className, isDraggable = false }: {
		onShow?: ( modal: Modal ) => void;
		onHide?: ( modal: Modal ) => void;
		className?: string;
		isDraggable: boolean;
	} ): void {
		this.hide();

		this.view.isVisible = true;

		this.view.addContentPart();

		if ( onShow ) {
			onShow( this );
		}

		this.view.className = className;
		this.view.isDraggable = isDraggable;

		this._onHide = onHide;
	}

	/**
	 * TODO
	 */
	public hide(): void {
		this.editor.editing.view.focus();

		this.view.isVisible = false;
		this.view.clear();

		if ( this._onHide ) {
			this._onHide( this );
		}
	}
}

/**
 * TODO
 */
class ModalView extends View {
	public readonly parts: ViewCollection;
	public readonly children: ViewCollection;
	public readonly headerView: FormHeaderView;
	public readonly contentView: View;
	public readonly closeButtonView: ButtonView;
	public readonly actionsView: ModalActionsView;
	public readonly keystrokes: KeystrokeHandler;
	private _transformDelta: { x: number; y: number };
	declare public isVisible: boolean;
	declare public isDraggable: boolean;
	declare public className: string | undefined;

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

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-modal-overlay',
					bind.if( 'isDraggable', 'ck-modal-overlay__transparent' ),
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				]
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

	public addContentPart() {
		this.parts.add( this.contentView );
	}
}

/**
 * TODO
 */
class ModalActionsView extends View {
	public readonly children: ViewCollection;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		/**
		 * TODO
		 */
		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-modal__actions'
				]
			},
			children: this.children
		} );
	}

	/**
	 * TODO
	 */
	public clear() {
		while ( this.children.length ) {
			this.children.remove( 0 );
		}
	}

	/**
	 * TODO
	 *
	 * @param definitions
	 */
	public setButtons( definitions: Array<ModalActionButtonDefinition> ): void {
		for ( const definition of definitions ) {
			const button = new ButtonView( this.locale );

			let property: keyof ModalActionButtonDefinition;

			for ( property in definition ) {
				if ( property == 'onExecute' ) {
					button.on( 'execute', () => definition.onExecute() );
				} else {
					button.set( property, definition[ property ] );
				}
			}

			this.children.add( button );
		}
	}
}

type ModalActionButtonDefinition =
	Pick<Button, 'label'> &
	Partial<Pick<Button, 'withText' | 'class' | 'icon'>> &
	{ onExecute: Function };
