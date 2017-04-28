/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/imageuploadengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from './filerepository';
import ImageUploadCommand from './imageuploadcommand';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import { isImageType } from './utils';

/**
 * Image upload engine plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FileRepository, Notification ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const doc = editor.document;
		const schema = doc.schema;
		const fileRepository = editor.plugins.get( FileRepository );

		// Setup schema to allow uploadId for images.
		schema.allow( { name: 'image', attributes: [ 'uploadId' ], inside: '$root' } );
		schema.allow( { name: 'image', attributes: [ 'uploadStatus' ], inside: '$root' } );
		schema.requireAttributes( 'image', [ 'uploadId' ] );

		// Register imageUpload command.
		editor.commands.set( 'imageUpload', new ImageUploadCommand( editor ) );

		// Execute imageUpload command when image is dropped or pasted.
		editor.editing.view.on( 'clipboardInput', ( evt, data ) => {
			for ( const file of data.dataTransfer.files ) {
				if ( isImageType( file ) ) {
					editor.execute( 'imageUpload', { file } );
					evt.stop();
				}
			}
		} );

		doc.on( 'change', ( evt, type, data, batch ) => {
			// Listen on document changes and:
			// * start upload process when image with `uploadId` attribute is inserted,
			// * abort upload process when image `uploadId` attribute is removed.
			if ( type === 'insert' || type === 'remove' ) {
				for ( const value of data.range ) {
					if ( value.type === 'elementStart' && value.item.name === 'image' ) {
						const imageElement = value.item;
						const uploadId = imageElement.getAttribute( 'uploadId' );

						if ( uploadId ) {
							const loader = fileRepository.loaders.get( uploadId );

							if ( loader ) {
								if ( type === 'insert' && loader.status == 'idle' ) {
									this.load( loader, batch, imageElement );
								}

								if ( type === 'remove' ) {
									loader.abort();
								}
							}
						}
					}
				}
			}
		} );
	}

	/**
	 * Performs image loading. Image is read from the disk and temporary data is displayed, after uploading process
	 * is complete we replace temporary data with target image from the server.
	 *
	 * @protected
	 * @param {module:upload/filerepository~FileLoader} loader
	 * @param {module:engine/model/batch~Batch} batch
	 * @param {module:engine/model/element~Element} imageElement
	 */
	load( loader, batch, imageElement ) {
		const editor = this.editor;
		const doc = editor.document;
		const fileRepository = editor.plugins.get( FileRepository );
		const notification = editor.plugins.get( Notification );

		doc.enqueueChanges( () => {
			batch.setAttribute( imageElement, 'uploadStatus', 'reading' );
		} );

		loader.read()
			.then( data => {
				const viewFigure = editor.editing.mapper.toViewElement( imageElement );
				const viewImg = viewFigure.getChild( 0 );
				const promise = loader.upload();

				viewImg.setAttribute( 'src', data );
				editor.editing.view.render();

				doc.enqueueChanges( () => {
					batch.setAttribute( imageElement, 'uploadStatus', 'uploading' );
				} );

				return promise;
			} )
			.then( data => {
				doc.enqueueChanges( () => {
					batch.setAttribute( imageElement, 'uploadStatus', 'complete' );
					batch.setAttribute( imageElement, 'src', data.original );
				} );

				clean();
			} )
			.catch( msg => {
				// Might be 'aborted'.
				if ( loader.status == 'error' ) {
					notification.showWarning( msg, { namespace: 'upload' } );
				}

				// Remove Image if not in graveyard already.
				// Abort is called on image removal too so prevent from removing image twice.
				if ( imageElement.root.rootName !== '$graveyard' ) {
					doc.enqueueChanges( () => {
						batch.remove( imageElement );
					} );
				}

				clean();
			} );

		function clean() {
			doc.enqueueChanges( () => {
				batch.removeAttribute( imageElement, 'uploadId' );
				batch.removeAttribute( imageElement, 'uploadStatus' );
			} );

			fileRepository.destroyLoader( loader );
		}
	}
}
