/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/imageuploadbutton
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageUploadEngine from './imageuploadengine';
import FileDialogButtonView from './ui/filedialogbuttonview';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import { isImageType, findOptimalInsertionPosition } from './utils';

/**
 * Image upload button plugin.
 * Adds `insertImage` button to UI component factory.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadButton extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageUploadEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Setup `insertImage` button.
		editor.ui.componentFactory.add( 'insertImage', locale => {
			const view = new FileDialogButtonView( locale );
			const command = editor.commands.get( 'imageUpload' );

			view.set( {
				label: t( 'Insert image' ),
				icon: imageIcon,
				tooltip: true,
				acceptedType: 'image/*',
				allowMultipleFiles: true
			} );

			view.bind( 'isEnabled' ).to( command );

			view.on( 'done', ( evt, files ) => {
				for ( const file of Array.from( files ) ) {
					const insertAt = findOptimalInsertionPosition( editor.document.selection );

					if ( isImageType( file ) ) {
						editor.execute( 'imageUpload', { file, insertAt } );
					}
				}
			} );

			return view;
		} );
	}
}
