/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/imageuploadui
 */

import { Plugin, icons } from 'ckeditor5/src/core.js';
import {
	FileDialogButtonView, MenuBarMenuListItemFileDialogButtonView,
	type ButtonView, type MenuBarMenuListItemButtonView
} from 'ckeditor5/src/ui.js';
import { createImageTypeRegExp } from './utils.js';
import type ImageInsertUI from '../imageinsert/imageinsertui.js';

/**
 * The image upload button plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature} documentation.
 *
 * Adds the `'uploadImage'` button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageUpload` button as an alias for backward compatibility.
 *
 * Adds the `'menuBar:uploadImage'` menu button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}.
 *
 * It also integrates with the `insertImage` toolbar component and `menuBar:insertImage` menu component, which are the default components
 * through which image upload is available.
 */
export default class ImageUploadUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageUploadUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Setup `uploadImage` button and add `imageUpload` button as an alias for backward compatibility.
		editor.ui.componentFactory.add( 'uploadImage', () => this._createToolbarButton() );
		editor.ui.componentFactory.add( 'imageUpload', () => this._createToolbarButton() );

		editor.ui.componentFactory.add( 'menuBar:uploadImage', () => this._createMenuBarButton( 'standalone' ) );

		if ( editor.plugins.has( 'ImageInsertUI' ) ) {
			editor.plugins.get( 'ImageInsertUI' ).registerIntegration( {
				name: 'upload',
				observable: () => editor.commands.get( 'uploadImage' )!,
				buttonViewCreator: () => this._createToolbarButton(),
				formViewCreator: () => this._createDropdownButton(),
				menuBarButtonViewCreator: isOnly => this._createMenuBarButton( isOnly ? 'insertOnly' : 'insertNested' )
			} );
		}
	}

	/**
	 * Creates the base for various kinds of the button component provided by this feature.
	 */
	private _createButton<T extends typeof FileDialogButtonView | typeof MenuBarMenuListItemFileDialogButtonView>(
		ButtonClass: T
	): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = editor.commands.get( 'uploadImage' )!;
		const imageTypes = editor.config.get( 'image.upload.types' )!;
		const imageTypesRegExp = createImageTypeRegExp( imageTypes );

		const view = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			acceptedType: imageTypes.map( type => `image/${ type }` ).join( ',' ),
			allowMultipleFiles: true,
			label: t( 'Upload from computer' ),
			icon: icons.imageUpload
		} );

		view.bind( 'isEnabled' ).to( command );

		view.on( 'done', ( evt, files: FileList ) => {
			const imagesToUpload = Array.from( files ).filter( file => imageTypesRegExp.test( file.type ) );

			if ( imagesToUpload.length ) {
				editor.execute( 'uploadImage', { file: imagesToUpload } );

				editor.editing.view.focus();
			}
		} );

		return view;
	}

	/**
	 * Creates a simple toolbar button, with an icon and a tooltip.
	 */
	private _createToolbarButton(): ButtonView {
		const t = this.editor.locale.t;
		const imageInsertUI: ImageInsertUI = this.editor.plugins.get( 'ImageInsertUI' );
		const uploadImageCommand = this.editor.commands.get( 'uploadImage' )!;

		const button = this._createButton( FileDialogButtonView );

		button.tooltip = true;
		button.bind( 'label' ).to(
			imageInsertUI,
			'isImageSelected',
			uploadImageCommand,
			'isAccessAllowed',
			( isImageSelected, isAccessAllowed ) => {
				if ( !isAccessAllowed ) {
					return t( 'No permission to upload from computer. Try using the file manager or contact your administrator.' );
				}

				return isImageSelected ? t( 'Replace image from computer' ) : t( 'Upload image from computer' );
			}
		);

		return button;
	}

	/**
	 * Creates a button for the dropdown view, with an icon, text and no tooltip.
	 */
	private _createDropdownButton(): ButtonView {
		const t = this.editor.locale.t;
		const imageInsertUI: ImageInsertUI = this.editor.plugins.get( 'ImageInsertUI' );

		const button = this._createButton( FileDialogButtonView );

		button.withText = true;

		button.bind( 'label' ).to(
			imageInsertUI,
			'isImageSelected',
			isImageSelected => isImageSelected ? t( 'Replace from computer' ) : t( 'Upload from computer' )
		);

		button.on( 'execute', () => {
			imageInsertUI.dropdownView!.isOpen = false;
		} );

		return button;
	}

	/**
	 * Creates a button for the menu bar.
	 */
	private _createMenuBarButton( type: 'standalone' | 'insertOnly' | 'insertNested' ): MenuBarMenuListItemButtonView {
		const t = this.editor.locale.t;
		const button = this._createButton( MenuBarMenuListItemFileDialogButtonView );

		button.withText = true;

		switch ( type ) {
			case 'standalone':
				button.label = t( 'Image from computer' );
				break;
			case 'insertOnly':
				button.label = t( 'Image' );
				break;
			case 'insertNested':
				button.label = t( 'From computer' );
				break;
		}

		return button;
	}
}
