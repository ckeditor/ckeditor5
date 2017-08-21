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
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import { isImageType, findOptimalInsertionPosition } from './utils';

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
		editor.commands.add( 'imageUpload', new ImageUploadCommand( editor ) );

		// Execute imageUpload command when image is dropped or pasted.
		editor.editing.view.on( 'clipboardInput', ( evt, data ) => {
			let targetModelSelection = new ModelSelection(
				data.targetRanges.map( viewRange => editor.editing.mapper.toModelRange( viewRange ) )
			);

			for ( const file of data.dataTransfer.files ) {
				const insertAt = findOptimalInsertionPosition( targetModelSelection );

				if ( isImageType( file ) ) {
					editor.execute( 'imageUpload', { file, insertAt } );
					evt.stop();
				}

				// Use target ranges only for the first image. Then, use that image position
				// so we keep adding the next ones after the previous one.
				targetModelSelection = doc.selection;
			}
		} );

		// Prevents from browser redirecting to drag-end-dropped image.
		editor.editing.view.on( 'dragover', ( evt, data ) => {
			data.preventDefault();
		} );

		doc.on( 'change', ( evt, type, data ) => {
			// Listen on document changes and:
			// * start upload process when image with `uploadId` attribute is inserted,
			// * abort upload process when image `uploadId` attribute is removed.
			if ( type === 'insert' || type === 'reinsert' || type === 'remove' ) {
				for ( const value of data.range ) {
					if ( value.type === 'elementStart' && value.item.name === 'image' ) {
						const imageElement = value.item;
						const uploadId = imageElement.getAttribute( 'uploadId' );

						if ( uploadId ) {
							const loader = fileRepository.loaders.get( uploadId );

							if ( loader ) {
								if ( type === 'insert' && loader.status == 'idle' ) {
									this.load( loader, imageElement );
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
	 * @param {module:engine/model/element~Element} imageElement
	 */
	load( loader, imageElement ) {
		const editor = this.editor;
		const t = editor.locale.t;
		const doc = editor.document;
		const fileRepository = editor.plugins.get( FileRepository );
		const notification = editor.plugins.get( Notification );

		doc.enqueueChanges( () => {
			doc.batch( 'transparent' ).setAttribute( imageElement, 'uploadStatus', 'reading' );
		} );

		loader.read()
			.then( data => {
				const viewFigure = editor.editing.mapper.toViewElement( imageElement );
				const viewImg = viewFigure.getChild( 0 );
				const promise = loader.upload();

				viewImg.setAttribute( 'src', data );
				editor.editing.view.render();

				doc.enqueueChanges( () => {
					doc.batch( 'transparent' ).setAttribute( imageElement, 'uploadStatus', 'uploading' );
				} );

				return promise;
			} )
			.then( data => {
				doc.enqueueChanges( () => {
					doc.batch( 'transparent' ).setAttribute( imageElement, 'uploadStatus', 'complete' );
					doc.batch( 'transparent' ).setAttribute( imageElement, 'src', data.default );

					// Srcset attribute for responsive images support.
					const srcsetAttribute = Object.keys( data )
						// Filter out keys that are not integers.
						.filter( key => !isNaN( parseInt( key, 10 ) ) )

						// Convert each key to srcset entry.
						.map( key => `${ data[ key ] } ${ key }w` )

						// Join all entries.
						.join( ', ' );

					if ( srcsetAttribute != '' ) {
						doc.batch( 'transparent' ).setAttribute( imageElement, 'srcset', srcsetAttribute );
					}
				} );

				clean();
			} )
			.catch( msg => {
				// Might be 'aborted'.
				if ( loader.status == 'error' ) {
					notification.showWarning( msg, {
						title: t( 'Upload failed' ),
						namespace: 'upload'
					} );
				}

				clean();

				// Permanently remove image from insertion batch.
				doc.enqueueChanges( () => {
					doc.batch( 'transparent' ).remove( imageElement );
				} );
			} );

		function clean() {
			doc.enqueueChanges( () => {
				doc.batch( 'transparent' ).removeAttribute( imageElement, 'uploadId' );
				doc.batch( 'transparent' ).removeAttribute( imageElement, 'uploadStatus' );
			} );

			fileRepository.destroyLoader( loader );
		}
	}
}
