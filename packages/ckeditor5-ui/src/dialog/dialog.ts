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
import type { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

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
		this._initFocusToggler();
		this._initMultiRootIntegration();

		this.set( 'isOpen', false );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		this._initSourceEditingIntegration();
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
	 * Initiates keystroke handler for toggling the focus between the editor and dialog view.
	 */
	private _initFocusToggler() {
		const editor = this.editor;

		editor.keystrokes.set( 'Ctrl+F6', ( data, cancel ) => {
			if ( !this.isOpen || this.view!.isModal ) {
				return;
			}

			if ( this.view!.focusTracker.isFocused ) {
				editor.editing.view.focus();
			} else {
				this.view!.focus();
			}

			cancel();
		} );
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
	 * Provides an integration with the {@link module:source-editing/sourceediting~SourceEditing} plugin.
	 * Depending on the dialog configuration, it will either be hidden or stuck in the current position.
	 */
	private _initSourceEditingIntegration() {
		const editor = this.editor;

		if ( editor.plugins.has( 'SourceEditing' ) ) {
			const sourceEditing: SourceEditing = editor.plugins.get( 'SourceEditing' );

			this.listenTo( sourceEditing, 'change:isSourceEditingMode', ( evt, name, isSourceEditingMode ) => {
				if ( this.isOpen && isSourceEditingMode && !this.view!.isVisibleInSourceMode ) {
					this.hide();
				}
				// Don't reposition the dialog while switching between source and WYSIWYG modes,
				// no matter in which one it was opened.
				else if ( this.isOpen ) {
					this.view!.isStuck = true;
				}
			} );
		}
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
		icon,
		title,
		content,
		actionButtons,
		className,
		isModal,
		isVisibleInSourceMode,
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

		const view = this.view;

		view.on<DialogViewCloseEvent>( 'close', () => {
			this.hide();
		} );

		editor.ui.view.body.add( view );
		editor.ui.focusTracker.add( view.element! );
		editor.keystrokes.listenTo( view.element! );

		// Unless the user specified a position, modals should always be centered on the screen.
		// Otherwise, let's keep dialogs centered in the editing root by default.
		if ( !position ) {
			position = isModal ? DialogViewPosition.SCREEN_CENTER : DialogViewPosition.EDITOR_CENTER;
		}

		view.set( {
			position,
			isVisible: true,
			className,
			isModal
		} );

		view.isVisibleInSourceMode = isVisibleInSourceMode;

		view.setupParts( {
			icon,
			title,
			content,
			actionButtons
		} );

		if ( id ) {
			this.id = id;
		}

		if ( onHide ) {
			this._onHide = onHide;
		}

		this.isOpen = true;
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
		editor.keystrokes.stopListening( view.element! );

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
	icon?: string;
	className?: string;
	isModal?: boolean;
	isVisibleInSourceMode?: boolean;
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
