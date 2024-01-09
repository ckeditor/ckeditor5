/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/imageuploadui
 */

import type { Locale } from 'ckeditor5/src/utils.js';
import { Plugin, icons } from 'ckeditor5/src/core.js';
import { FileDialogButtonView } from 'ckeditor5/src/upload.js';
import { createImageTypeRegExp } from './utils.js';
import type UploadImageCommand from './uploadimagecommand.js';
import type ImageInsertUI from '../imageinsert/imageinsertui.js';

/**
 * The image upload button plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature} documentation.
 *
 * Adds the `'uploadImage'` button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageUpload` button as an alias for backward compatibility.
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
		const t = editor.t;

		const componentCreator = ( locale: Locale ) => {
			const view = new FileDialogButtonView( locale );
			const command: UploadImageCommand = editor.commands.get( 'uploadImage' )!;
			const imageTypes = editor.config.get( 'image.upload.types' )!;
			const imageTypesRegExp = createImageTypeRegExp( imageTypes );

			view.set( {
				acceptedType: imageTypes.map( type => `image/${ type }` ).join( ',' ),
				allowMultipleFiles: true,
				label: t( 'Upload image from computer' ),
				icon: icons.imageUpload,
				tooltip: true
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
		};

		// Setup `uploadImage` button and add `imageUpload` button as an alias for backward compatibility.
		editor.ui.componentFactory.add( 'uploadImage', componentCreator );
		editor.ui.componentFactory.add( 'imageUpload', componentCreator );

		if ( editor.plugins.has( 'ImageInsertUI' ) ) {
			const imageInsertUI: ImageInsertUI = editor.plugins.get( 'ImageInsertUI' );
			const command: UploadImageCommand = editor.commands.get( 'uploadImage' )!;

			imageInsertUI.registerIntegration( {
				name: 'upload',
				observable: command,

				buttonViewCreator: () => {
					const uploadImageButton = editor.ui.componentFactory.create( 'uploadImage' ) as FileDialogButtonView;

					uploadImageButton.bind( 'label' ).to( imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ?
						t( 'Replace image from computer' ) :
						t( 'Upload image from computer' )
					);

					return uploadImageButton;
				},

				formViewCreator: () => {
					const uploadImageButton = editor.ui.componentFactory.create( 'uploadImage' ) as FileDialogButtonView;

					uploadImageButton.withText = true;
					uploadImageButton.bind( 'label' ).to( imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ?
						t( 'Replace from computer' ) :
						t( 'Upload from computer' )
					);

					uploadImageButton.on( 'execute', () => {
						imageInsertUI.dropdownView!.isOpen = false;
					} );

					return uploadImageButton;
				}
			} );
		}
	}
}
