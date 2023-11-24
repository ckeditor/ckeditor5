/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dialog/dialog
 */

import View from '../view';
import { type Editor, Plugin } from '@ckeditor/ckeditor5-core';
import DialogView, { type DialogViewCloseEvent, DialogViewPosition } from './dialogview';
import type { DialogActionButtonDefinition } from './dialogactionsview';

import '../../theme/components/dialog/dialog.css';

/**
 * TODO
 */
export default class Dialog extends Plugin {
	/**
	 * TODO
	 */
	public id: string = '';

	/**
	 * TODO
	 */
	public static view: DialogView;

	/**
	 * TODO
	 */
	declare public isOpen: boolean;

	/**
	 * TODO
	 */
	private _onHide: ( ( dialog: Dialog ) => void ) | undefined;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Dialog' as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.set( 'isOpen', false );
	}

	/**
	 * TODO
	 */
	private _initShowHideListeners() {
		this.on<DialogShowEvent>( 'show', ( evt, args ) => {
			this._show( args );
		} );

		// 'low' priority allows to add custom callback between `_show()` and `onShow()`.
		this.on<DialogShowEvent>( 'show', ( evt, args ) => {
			args.onShow?.( this );
		}, { priority: 'low' } );

		this.on<DialogHideEvent>( 'hide', () => {
			this._hide();
		} );

		// 'low' priority allows to add custom callback between `_hide()` and `onHide()`.
		this.on<DialogHideEvent>( 'hide', () => {
			this._onHide?.( this );
		}, { priority: 'low' } );

		Dialog.view.on<DialogViewCloseEvent>( 'close', () => {
			this.hide();
		} );
	}

	/**
	 * TODO
	 */
	public show( dialogDefinition: DialogDefinition ): void {
		if ( this.isOpen || Dialog.view ) {
			this.hide();
		}

		const editor = this.editor;

		Dialog.view = new DialogView( editor.locale, () => {
			return editor.editing.view.getDomRoot( editor.model.document.selection.anchor!.root.rootName )!;
		}, () => {
			return editor.ui.viewportOffset;
		} );

		this._initShowHideListeners();

		editor.ui.view.body.add( Dialog.view );
		editor.ui.focusTracker.add( Dialog.view.element! );

		this.fire( dialogDefinition.id ? `show:${ dialogDefinition.id }` : 'show', dialogDefinition );
	}

	/**
	 * TODO
	 */
	private _show( {
		id,
		title,
		content,
		actionButtons,
		className,
		isModal,
		position,
		onHide
	}: DialogDefinition ) {
		// Unless the user specified a position, modals should always be centered on the screen.
		// Otherwise, let's keep dialogs centered in the editing root by default.
		if ( !position ) {
			position = isModal ? DialogViewPosition.SCREEN_CENTER : DialogViewPosition.EDITOR_CENTER;
		}

		Dialog.view.set( {
			position,
			isVisible: true,
			className,
			isModal
		} );

		if ( id ) {
			this.id = id;
		}

		if ( title ) {
			Dialog.view.showHeader( title );
		}

		if ( content ) {
			// Normalize the content specified in the arguments.
			if ( content instanceof View ) {
				content = [ content ];
			}

			Dialog.view.addContentPart( content );
		}

		if ( actionButtons ) {
			Dialog.view.setActionButtons( actionButtons );
		}

		this.isOpen = true;

		Dialog.view.focus();

		this._onHide = onHide;
	}

	/**
	 * TODO
	 */
	public hide(): void {
		this.fire<DialogHideEvent>( this.id ? `hide:${ this.id }` : 'hide' );
	}

	/**
	 * TODO
	 */
	private _hide(): void {
		Dialog.view.destroy();

		this.editor.editing.view.focus();

		this.id = '';

		this.isOpen = false;
	}
}

/**
 * TODO
 */
export type DialogDefinition = {
	id?: string;
	content?: View | Array<View>;
	actionButtons?: Array<DialogActionButtonDefinition>;
	title?: string;
	className?: string;
	isModal?: boolean;
	position?: DialogViewPosition;
	onShow?: ( dialog: Dialog ) => void;
	onHide?: ( dialog: Dialog ) => void;
};

/**
 * TODO
 */
export type DialogShowEvent = {
	name: 'show' | `show:${ string }`;
	args: [ dialogDefinition: DialogDefinition ];
};

/**
 * TODO
 */
export type DialogHideEvent = {
	name: 'hide' | `hide:${ string }`;
	args: [];
};
