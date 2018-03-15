/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imageupload/imageuploadui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import { isImageType, findOptimalInsertionPosition } from './utils';

/**
 * Image upload button plugin.
 * Adds `imageUpload` button to UI component factory.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Setup `imageUpload` button.
		editor.ui.componentFactory.add( 'imageUpload', locale => {
			const view = new FileDialogButtonView( locale );
			const command = editor.commands.get( 'imageUpload' );

			view.set( {
				acceptedType: 'image/*',
				allowMultipleFiles: true
			} );

			view.buttonView.set( {
				label: t( 'Insert image' ),
				icon: imageIcon,
				tooltip: true
			} );

			view.buttonView.bind( 'isEnabled' ).to( command );

			view.on( 'done', ( evt, files ) => {
				for ( const file of Array.from( files ) ) {
					const insertAt = findOptimalInsertionPosition( editor.model.document.selection );

					if ( isImageType( file ) ) {
						editor.execute( 'imageUpload', { file, insertAt } );
					}
				}
			} );

			return view;
		} );
	}
}
