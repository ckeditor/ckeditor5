/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/imageinsertviaurlui
 */

import { icons, Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

import ImageInsertUI from './imageinsertui.js';
import type InsertImageCommand from '../image/insertimagecommand.js';
import type ReplaceImageSourceCommand from '../image/replaceimagesourcecommand.js';
import ImageInsertUrlView from './ui/imageinserturlview.js';

/**
 * The image insert via URL plugin (UI part).
 *
 * For a detailed overview, check the {@glink features/images/images-inserting
 * Insert images via source URL} documentation.
 *
 * This plugin registers the {@link module:image/imageinsert/imageinsertui~ImageInsertUI} integration for `url`.
 */
export default class ImageInsertViaUrlUI extends Plugin {
	private _imageInsertUI!: ImageInsertUI;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageInsertViaUrlUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageInsertUI ] as const;
	}

	public init(): void {
		this.editor.ui.componentFactory.add( 'menuBar:uploadUrl', locale => {
			const t = locale.t;
			const button = this._createInsertUrlButton( MenuBarMenuListItemButtonView );

			return button;
		} );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		this._imageInsertUI = this.editor.plugins.get( 'ImageInsertUI' );

		this._imageInsertUI.registerIntegration( {
			name: 'url',
			observable: () => this.editor.commands.get( 'insertImage' )!,
			requiresForm: true,
			buttonViewCreator: () => this._createInsertUrlButton( ButtonView ),
			formViewCreator: () => this._createInsertUrlView(),
			menuBarButtonViewCreator: () => this._createInsertUrlButton( MenuBarMenuListItemButtonView )
		} );
	}

	/**
	 * Creates the view displayed in the dropdown.
	 */
	private _createInsertUrlView(): ImageInsertUrlView {
		const editor = this.editor;
		const locale = editor.locale;

		const replaceImageSourceCommand: ReplaceImageSourceCommand = editor.commands.get( 'replaceImageSource' )!;
		const insertImageCommand: InsertImageCommand = editor.commands.get( 'insertImage' )!;

		const imageInsertUrlView = new ImageInsertUrlView( locale );

		imageInsertUrlView.bind( 'isImageSelected' ).to( this._imageInsertUI );
		imageInsertUrlView.bind( 'isEnabled' ).toMany( [ insertImageCommand, replaceImageSourceCommand ], 'isEnabled', ( ...isEnabled ) => (
			isEnabled.some( isCommandEnabled => isCommandEnabled )
		) );

		// Set initial value because integrations are created on first dropdown open.
		imageInsertUrlView.imageURLInputValue = replaceImageSourceCommand.value || '';

		return imageInsertUrlView;
	}

	/**
	 * Creates the toolbar button.
	 */
	private _createInsertUrlButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>(
		ButtonClass: T
	): InstanceType<T> {
		// const ButtonClass = isOnlyOne ? DropdownButtonView : ButtonView;

		const editor = this.editor;
		const button = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = editor.locale.t;

		button.set( {
			label: t( 'Set image url' ),
			icon: icons.imageUpload
		} );

		button.on( 'execute', () => {
			this._showModal();
		} );

		button.set( {
			icon: icons.imageUrl,
			tooltip: true
		} );

		button.bind( 'label' ).to( this._imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ?
			t( 'Update image URL' ) :
			t( 'Insert image via URL' )
		);

		return button;
	}

	/**
	 *
	 */
	private _showModal() {
		const editor = this.editor;
		const locale = editor.locale;
		const t = locale.t;
		const dialog = editor.plugins.get( 'Dialog' );

		const form = this._createInsertUrlView();

		function handleSave( form: ImageInsertUrlView ) {
			const replaceImageSourceCommand: ReplaceImageSourceCommand = editor.commands.get( 'replaceImageSource' )!;

			if ( replaceImageSourceCommand.isEnabled ) {
				editor.execute( 'replaceImageSource', { source: form.imageURLInputValue } );
			} else {
				editor.execute( 'insertImage', { source: form.imageURLInputValue } );
			}

			dialog.hide();
		}

		dialog.show( {
			id: 'insertUrl',
			title: this._imageInsertUI.isImageSelected ?
				t( 'Update image URL' ) :
				t( 'Insert image via URL' ),
			isModal: true,
			content: form,
			actionButtons: [
				{
					label: t( 'Cancel' ),
					withText: true,
					onExecute: () => dialog.hide()
				},
				{
					label: t( 'Accept' ),
					class: 'ck-button-action',
					withText: true,
					onExecute: () => handleSave( form as ImageInsertUrlView )
				}
			]
		} );
	}
}
