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
	public readonly view: DialogView;

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

		this.view = new DialogView( editor.locale, () => {
			return editor.editing.view.getDomRoot( editor.model.document.selection.anchor!.root.rootName )!;
		}, () => {
			return this.editor.ui.viewportOffset;
		} );

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

		this.view.on<DialogViewCloseEvent>( 'close', () => {
			this.hide();
		} );

		editor.ui.view.body.add( this.view );
		editor.ui.focusTracker.add( this.view.element! );
	}

	/**
	 * TODO
	 */
	public show( {
		title,
		content,
		actionButtons,
		className,
		isModal = false,
		position,
		onShow,
		onHide
	}: DialogDefinition ): void {
		if ( this.view.isVisible ) {
			this.hide();
		}

		this.fire( 'show', {
			title,
			content,
			actionButtons,
			className,
			isModal,
			position,
			onShow,
			onHide
		} );
	}

	/**
	 * TODO
	 */
	private _show( {
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
			position = isModal ? DialogViewPosition.SCREEN_CENTER : DialogViewPosition.CURRENT_ROOT_CENTER;
		}

		this.view.set( {
			position,
			isVisible: true,
			className,
			isModal
		} );

		if ( title ) {
			this.setTitle( title );
		}

		this.view.addContentPart();

		if ( content ) {
			// Normalize the content specified in the arguments.
			if ( content instanceof View ) {
				content = [ content ];
			}

			this.view.children.addMany( content );
		}

		if ( actionButtons ) {
			this.view.setActionButtons( actionButtons );
		}

		this.view.focus();

		this._onHide = onHide;
	}

	/**
	 * TODO
	 */
	public hide(): void {
		this.fire<DialogHideEvent>( 'hide' );
	}

	/**
	 * TODO
	 */
	private _hide(): void {
		this.editor.editing.view.focus();

		this.view.isVisible = false;
		this.view.reset();
	}

	/**
	 * TODO
	 */
	public setTitle( title: string ): void {
		this.view.showHeader( title );
	}
}

/**
 * TODO
 */
export type DialogDefinition = {
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
	name: 'show';
	args: [ dialogDefinition: DialogDefinition ];
};

/**
 * TODO
 */
export type DialogHideEvent = {
	name: 'hide';
	args: [];
};
