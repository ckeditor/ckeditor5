/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/imageuploadui
 */

import type { Locale } from 'ckeditor5/src/utils';
import { Plugin, icons } from 'ckeditor5/src/core';
import { FileDialogButtonView } from 'ckeditor5/src/upload';
import { createImageTypeRegExp } from './utils';
import type UploadImageCommand from './uploadimagecommand';

import '../imageconfig';

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
	public static get pluginName(): 'ImageUploadUI' {
		return 'ImageUploadUI';
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
				allowMultipleFiles: true
			} );

			view.buttonView.set( {
				label: t( 'Insert image' ),
				icon: icons.image,
				tooltip: true
			} );

			view.buttonView.bind( 'isEnabled' ).to( command );

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
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ ImageUploadUI.pluginName ]: ImageUploadUI;
	}
}
