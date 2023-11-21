/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/imageuploadui
 */

import type { Locale } from 'ckeditor5/src/utils';
import { Plugin } from 'ckeditor5/src/core';
import { FileDialogButtonView } from 'ckeditor5/src/upload';
import { createFileTypeRegExp, createImageTypeRegExp, createVideoTypeRegExp, createAudioTypeRegExp } from './utils';
import type UploadImageCommand from './uploadimagecommand';
import mediaUploadIcon from '../../theme/icons/upload-media.svg';

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
			const videoTypes = editor.config.get( 'video.upload.types' ) as Array<string>;
			const audioTypes = editor.config.get( 'audio.upload.types' ) as Array<string>;
			const fileTypes = editor.config.get( 'file.upload.types' ) as Array<string>;
			const extraFileTypes = editor.config.get( 'extraFile.upload.types' ) as Array<string>;

			const imageTypesRegExp = createImageTypeRegExp( );
			const videoTypesRegExp = createVideoTypeRegExp( );
			const audioTypesRegExp = createAudioTypeRegExp( );
			const fileTypesRegExp = createFileTypeRegExp( );

			view.set( {
				acceptedType:
					imageTypes.map( type => `${ type }` ).join( ',' ) +
					',' +
					videoTypes.map( type => `${ type }` ).join( ',' ) +
					',' +
					audioTypes.map( type => `${ type }` ).join( ',' ) +
					',' +
					fileTypes.map( type => `${ type }` ).join( ',' ) +
					',' +
					extraFileTypes.map( type => `${ type }` ).join( ',' ),
				allowMultipleFiles: true
			} );

			view.buttonView.set( {
				label: t( 'Upload media' ),
				icon: mediaUploadIcon,
				tooltip: true
			} );

			view.buttonView.bind( 'isEnabled' ).to( command );

			view.on( 'done', ( evt, files: FileList ) => {
				const imagesToUpload = Array.from( files ).filter( file => imageTypesRegExp.test( file.type ) );
				const videosToUpload = Array.from( files ).filter( file => {
					return videoTypesRegExp.test( file.type ) || file.name.includes( '.mkv' );
				} );
				const audiosToUpload = Array.from( files ).filter( file => {
					return audioTypesRegExp.test( file.type );
				} );
				const filesToUpload = Array.from( files ).filter( file => {
					return fileTypesRegExp.test( file.type );
				} );
				const extraFilesToUpload = Array.from( files ).filter( file => {
					return extraFileTypes.some( type => file.name.includes( type ) );
				} );

				if ( imagesToUpload.length ) {
					editor.execute( 'uploadImage', { file: imagesToUpload } );

					editor.editing.view.focus();
				}
				if ( videosToUpload.length ) {
					editor.execute( 'uploadVideo', { file: videosToUpload } );
				}
				if ( audiosToUpload.length ) {
					editor.execute( 'uploadAudio', { files: audiosToUpload } );
				}
				if ( filesToUpload.length ) {
					editor.execute( 'fileUpload', { file: filesToUpload } );
				}
				if ( extraFilesToUpload.length ) {
					editor.execute( 'fileUpload', { file: extraFilesToUpload } );
				}
			} );

			return view;
		};

		// Setup `uploadImage` button and add `imageUpload` button as an alias for backward compatibility.
		editor.ui.componentFactory.add( 'uploadImage', componentCreator );
		editor.ui.componentFactory.add( 'imageUpload', componentCreator );
	}
}
