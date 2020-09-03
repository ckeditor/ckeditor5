/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/imageuploadui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import { createImageTypeRegExp } from './utils';

import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

/**
 * The image upload button plugin.
 *
 * For a detailed overview, check the {@glink features/image-upload/image-upload Image upload feature} documentation.
 *
 * Adds the `'imageUpload'` dropdown to the {@link module:ui/componentfactory~ComponentFactory UI component factory}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageUploadUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'imageUpload', locale => {
			return this._createFileDialogButtonView( locale );
		} );
	}

	/**
	 * Creates and sets up the file dialog button view.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 *
	 * @private
	 * @returns {module:upload/ui/filedialogbuttonview~FileDialogButtonView}
	 */
	_createFileDialogButtonView( locale ) {
		const editor = this.editor;
		const t = locale.t;
		const imageTypes = editor.config.get( 'image.upload.types' );
		const fileDialogButtonView = new FileDialogButtonView( locale );
		const imageTypesRegExp = createImageTypeRegExp( imageTypes );
		const command = editor.commands.get( 'imageUpload' );

		fileDialogButtonView.set( {
			acceptedType: imageTypes.map( type => `image/${ type }` ).join( ',' ),
			allowMultipleFiles: true
		} );

		fileDialogButtonView.buttonView.set( {
			label: t( 'Upload image' ),
			icon: imageIcon,
			tooltip: true
		} );

		fileDialogButtonView.buttonView.bind( 'isEnabled' ).to( command );

		fileDialogButtonView.on( 'done', ( evt, files ) => {
			const imagesToUpload = Array.from( files ).filter( file => imageTypesRegExp.test( file.type ) );

			if ( imagesToUpload.length ) {
				editor.execute( 'imageUpload', { file: imagesToUpload } );
			}
		} );

		return fileDialogButtonView;
	}
}
