/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dialog/dialog
 */

import type View from '../view';
import { type Editor, Plugin } from '@ckeditor/ckeditor5-core';
import DialogView, { type DialogViewCloseEvent, DialogViewPosition } from './dialogview';
import type { DialogActionButtonDefinition } from './dialogactionsview';
import type { DocumentChangeEvent } from '@ckeditor/ckeditor5-engine';

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
	public view?: DialogView;

	/**
	 * TODO
	 */
	public static visibleDialogPlugin?: Dialog;

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

		this._initShowHideListeners();
		this._initMultiRootIntegration();

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
	}

	/**
	 * Provides an integration between the root attaching and detaching and positioning of the view.
	 */
	private _initMultiRootIntegration() {
		const model = this.editor.model;

		model.document.on<DocumentChangeEvent>( 'change:data', () => {
			if ( !this.view ) {
				return;
			}

			const changedRoots = model.document.differ.getChangedRoots();

			for ( const changes of changedRoots ) {
				if ( changes.state ) {
					this.view.updatePosition();
				}
			}
		} );
	}

	/**
	 * TODO
	 */
	public show( dialogDefinition: DialogDefinition ): void {
		Dialog.visibleDialogPlugin?.hide();

		this.fire<DialogShowEvent>( dialogDefinition.id ? `show:${ dialogDefinition.id }` : 'show', dialogDefinition );
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
		const editor = this.editor;

		this.view = new DialogView( editor.locale, {
			getCurrentDomRoot: () => {
				return editor.editing.view.getDomRoot( editor.model.document.selection.anchor!.root.rootName )!;
			},
			getViewportOffset: () => {
				return editor.ui.viewportOffset;
			}
		} );

		this.view.on<DialogViewCloseEvent>( 'close', () => {
			this.hide();
		} );

		editor.ui.view.body.add( this.view );
		editor.ui.focusTracker.add( this.view.element! );

		// Unless the user specified a position, modals should always be centered on the screen.
		// Otherwise, let's keep dialogs centered in the editing root by default.
		if ( !position ) {
			position = isModal ? DialogViewPosition.SCREEN_CENTER : DialogViewPosition.EDITOR_CENTER;
		}

		this.view.set( {
			position,
			isVisible: true,
			className,
			isModal
		} );

		this.view.setupParts( {
			title,
			content,
			actionButtons
		} );

		if ( id ) {
			this.id = id;
		}

		this.isOpen = true;
		this._onHide = onHide;

		Dialog.visibleDialogPlugin = this;
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
		if ( !this.view ) {
			return;
		}

		const editor = this.editor;
		const view = this.view;

		// Reset the content view to prevent its children from being destroyed in the standard
		// View#destroy() (and collections) chain. If the content children were left in there,
		// they would have to be re-created by the feature using the dialog every time the dialog
		// shows up.
		if ( view.contentView ) {
			view.contentView.reset();
		}

		editor.ui.view.body.remove( view );
		editor.ui.focusTracker.remove( view.element! );

		view.destroy();
		editor.editing.view.focus();

		this.id = '';
		this.isOpen = false;
		this._onHide = undefined;
		Dialog.visibleDialogPlugin = undefined;
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
