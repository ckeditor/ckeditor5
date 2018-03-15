/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imageupload/imageuploadediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import ImageUploadCommand from '../../src/imageupload/imageuploadcommand';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import { isImageType, findOptimalInsertionPosition } from '../../src/imageupload/utils';

/**
 * Image upload editing plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadEditing extends Plugin {
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
		const doc = editor.model.document;
		const schema = editor.model.schema;
		const fileRepository = editor.plugins.get( FileRepository );

		// Setup schema to allow uploadId and uploadStatus for images.
		schema.extend( 'image', {
			allowAttributes: [ 'uploadId', 'uploadStatus' ]
		} );

		// Register imageUpload command.
		editor.commands.add( 'imageUpload', new ImageUploadCommand( editor ) );

		// Execute imageUpload command when image is dropped or pasted.
		editor.editing.view.document.on( 'clipboardInput', ( evt, data ) => {
			// Skip if non empty HTML data is included.
			// https://github.com/ckeditor/ckeditor5-upload/issues/68
			if ( isHtmlIncluded( data.dataTransfer ) ) {
				return;
			}

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

		// Prevents from browser redirecting to the dropped image.
		editor.editing.view.document.on( 'dragover', ( evt, data ) => {
			data.preventDefault();
		} );

		doc.on( 'change', () => {
			const changes = doc.differ.getChanges( { includeChangesInGraveyard: true } );

			for ( const entry of changes ) {
				if ( entry.type == 'insert' && entry.name == 'image' ) {
					const item = entry.position.nodeAfter;
					const isInGraveyard = entry.position.root.rootName == '$graveyard';

					// Check if the image element still has upload id.
					const uploadId = item.getAttribute( 'uploadId' );

					if ( !uploadId ) {
						continue;
					}

					// Check if the image is loaded on this client.
					const loader = fileRepository.loaders.get( uploadId );

					if ( !loader ) {
						continue;
					}

					if ( isInGraveyard ) {
						// If the image was inserted to the graveyard - abort the loading process.
						loader.abort();
					} else if ( loader.status == 'idle' ) {
						// If the image was inserted into content and has not been loaded, start loading it.
						this._load( loader, item );
					}
				}
			}
		} );
	}

	/**
	 * Performs image loading. Image is read from the disk and temporary data is displayed, after uploading process
	 * is complete we replace temporary data with target image from the server.
	 *
	 * @private
	 * @param {module:upload/filerepository~FileLoader} loader
	 * @param {module:engine/model/element~Element} imageElement
	 */
	_load( loader, imageElement ) {
		const editor = this.editor;
		const model = editor.model;
		const t = editor.locale.t;
		const fileRepository = editor.plugins.get( FileRepository );
		const notification = editor.plugins.get( Notification );

		model.enqueueChange( 'transparent', writer => {
			writer.setAttribute( 'uploadStatus', 'reading', imageElement );
		} );

		loader.read()
			.then( data => {
				const viewFigure = editor.editing.mapper.toViewElement( imageElement );
				const viewImg = viewFigure.getChild( 0 );
				const promise = loader.upload();

				editor.editing.view.change( writer => {
					writer.setAttribute( 'src', data, viewImg );
				} );

				model.enqueueChange( 'transparent', writer => {
					writer.setAttribute( 'uploadStatus', 'uploading', imageElement );
				} );

				return promise;
			} )
			.then( data => {
				model.enqueueChange( 'transparent', writer => {
					writer.setAttributes( { uploadStatus: 'complete', src: data.default }, imageElement );

					// Srcset attribute for responsive images support.
					let maxWidth = 0;
					const srcsetAttribute = Object.keys( data )
						// Filter out keys that are not integers.
						.filter( key => {
							const width = parseInt( key, 10 );

							if ( !isNaN( width ) ) {
								maxWidth = Math.max( maxWidth, width );

								return true;
							}
						} )

						// Convert each key to srcset entry.
						.map( key => `${ data[ key ] } ${ key }w` )

						// Join all entries.
						.join( ', ' );

					if ( srcsetAttribute != '' ) {
						writer.setAttribute( 'srcset', {
							data: srcsetAttribute,
							width: maxWidth
						}, imageElement );
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
				model.enqueueChange( 'transparent', writer => {
					writer.remove( imageElement );
				} );
			} );

		function clean() {
			model.enqueueChange( 'transparent', writer => {
				writer.removeAttribute( 'uploadId', imageElement );
				writer.removeAttribute( 'uploadStatus', imageElement );
			} );

			fileRepository.destroyLoader( loader );
		}
	}
}

// Returns true if non-empty `text/html` is included in data transfer.
//
// @param {module:clipboard/datatransfer~DataTransfer} dataTransfer
// @returns {Boolean}
export function isHtmlIncluded( dataTransfer ) {
	return Array.from( dataTransfer.types ).includes( 'text/html' ) && dataTransfer.getData( 'text/html' ) !== '';
}
