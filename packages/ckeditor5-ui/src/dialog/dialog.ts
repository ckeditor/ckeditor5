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
 * The dialog controller class. It is used to show and hide the {@link module:ui/dialog/dialogview~DialogView}.
 */
export default class Dialog extends Plugin {
	/**
	 * The name of the currently visible dialog view instance.
	 */
	public id: string = '';

	/**
	 * The currently visible dialog view instance.
	 */
	public view?: DialogView;

	/**
	 * The currently dialog plugin instance controlling the currently visible dialog view.
	 */
	public static visibleDialogPlugin?: Dialog;

	/**
	 * A flag indicating whether the dialog is currently visible.
	 */
	declare public isOpen: boolean;

	/**
	 * A configurable callback called when the dialog is hidden.
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
	 * Initiates listeners for the `show` and `hide` events emitted by this plugin.
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
			this._onHide = undefined;
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
	 * Shows the dialog. If another dialog is currently visible, it will be hidden.
	 * This method is decorated to enable interacting on the `show` event.
	 */
	public show( dialogDefinition: DialogDefinition ): void {
		Dialog.visibleDialogPlugin?.hide();

		this.fire<DialogShowEvent>( dialogDefinition.id ? `show:${ dialogDefinition.id }` : 'show', dialogDefinition );
	}

	/**
	 * Handles creating the {@link module:ui/dialog/dialogview~DialogView} instance and making it visible.
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
	 * Hides the dialog. This method is decorated to enable interacting on the `hide` event.
	 */
	public hide(): void {
		this.fire<DialogHideEvent>( this.id ? `hide:${ this.id }` : 'hide' );
	}

	/**
	 * Destroys the {@link module:ui/dialog/dialogview~DialogView} and cleans up the stored dialog state.
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
		Dialog.visibleDialogPlugin = undefined;
	}
}

/**
 * The definition needed to create a {@link module:ui/dialog/dialogview~DialogView}.
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
 * An event fired after {@link module:ui/dialog/dialog~Dialog#show} is called.
 *
 * @eventName ~Dialog#show
 */
export type DialogShowEvent = {
	name: 'show' | `show:${ string }`;
	args: [ dialogDefinition: DialogDefinition ];
};

/**
 * An event fired after {@link module:ui/dialog/dialog~Dialog#hide} is called.
 *
 * @eventName ~Dialog#hide
 */
export type DialogHideEvent = {
	name: 'hide' | `hide:${ string }`;
	args: [];
};
