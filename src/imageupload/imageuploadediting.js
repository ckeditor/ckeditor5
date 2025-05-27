/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/imageuploadediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import env from '@ckeditor/ckeditor5-utils/src/env';

import ImageUploadCommand from '../../src/imageupload/imageuploadcommand';
import { fetchLocalImage, isLocalImage } from '../../src/imageupload/utils';
import { createImageTypeRegExp } from './utils';
import { getViewImgFromWidget } from '../image/utils';

/**
 * The editing part of the image upload feature. It registers the `'imageUpload'` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUploadEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FileRepository, Notification, Clipboard ];
	}

	static get pluginName() {
		return 'ImageUploadEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'image', {
			upload: {
				types: [ 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff' ]
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const doc = editor.model.document;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const fileRepository = editor.plugins.get( FileRepository );

		const imageTypes = createImageTypeRegExp( editor.config.get( 'image.upload.types' ) );

		// Setup schema to allow uploadId and uploadStatus for images.
		schema.extend( 'image', {
			allowAttributes: [ 'uploadId', 'uploadStatus' ]
		} );

		// Register imageUpload command.
		editor.commands.add( 'imageUpload', new ImageUploadCommand( editor ) );

		// Register upcast converter for uploadId.
		conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'img',
					key: 'uploadId'
				},
				model: 'uploadId'
			} );

		// Handle pasted images.
		// For every image file, a new file loader is created and a placeholder image is
		// inserted into the content. Then, those images are uploaded once they appear in the model
		// (see Document#change listener below).
		this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
			// Skip if non empty HTML data is included.
			// https://github.com/ckeditor/ckeditor5-upload/issues/68
			if ( isHtmlIncluded( data.dataTransfer ) ) {
				return;
			}

			const images = Array.from( data.dataTransfer.files ).filter( file => {
				// See https://github.com/ckeditor/ckeditor5-image/pull/254.
				if ( !file ) {
					return false;
				}

				return imageTypes.test( file.type );
			} );

			const ranges = data.targetRanges.map( viewRange => editor.editing.mapper.toModelRange( viewRange ) );

			editor.model.change( writer => {
				// Set selection to paste target.
				writer.setSelection( ranges );

				if ( images.length ) {
					evt.stop();

					// Upload images after the selection has changed in order to ensure the command's state is refreshed.
					editor.model.enqueueChange( 'default', () => {
						editor.execute( 'imageUpload', { file: images } );
					} );
				}
			} );
		} );

		// Handle HTML pasted with images with base64 or blob sources.
		// For every image file, a new file loader is created and a placeholder image is
		// inserted into the content. Then, those images are uploaded once they appear in the model
		// (see Document#change listener below).
		this.listenTo( editor.plugins.get( Clipboard ), 'inputTransformation', ( evt, data ) => {
			const fetchableImages = Array.from( editor.editing.view.createRangeIn( data.content ) )
				.filter( value => isLocalImage( value.item ) && !value.item.getAttribute( 'uploadProcessed' ) )
				.map( value => { return { promise: fetchLocalImage( value.item ), imageElement: value.item }; } );

			if ( !fetchableImages.length ) {
				return;
			}

			const writer = new UpcastWriter( editor.editing.view.document );

			for ( const fetchableImage of fetchableImages ) {
				// Set attribute marking that the image was processed already.
				writer.setAttribute( 'uploadProcessed', true, fetchableImage.imageElement );

				const loader = fileRepository.createLoader( fetchableImage.promise );

				if ( loader ) {
					writer.setAttribute( 'src', '', fetchableImage.imageElement );
					writer.setAttribute( 'uploadId', loader.id, fetchableImage.imageElement );
				}
			}
		} );

		// Prevents from the browser redirecting to the dropped image.
		editor.editing.view.document.on( 'dragover', ( evt, data ) => {
			data.preventDefault();
		} );

		// Upload placeholder images that appeared in the model.
		doc.on( 'change', () => {
			const changes = doc.differ.getChanges( { includeChangesInGraveyard: true } );

			for ( const entry of changes ) {
				if ( entry.type == 'insert' && entry.name != '$text' ) {
					const item = entry.position.nodeAfter;
					const isInGraveyard = entry.position.root.rootName == '$graveyard';

					for ( const image of getImagesFromChangeItem( editor, item ) ) {
						// Check if the image element still has upload id.
						const uploadId = image.getAttribute( 'uploadId' );

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
							// If the image was inserted into content and has not been loaded yet, start loading it.
							this._readAndUpload( loader, image );
						}
					}
				}
			}
		} );
	}

	/**
	 * Reads and uploads an image.
	 *
	 * The image is read from the disk and as a Base64-encoded string it is set temporarily to
	 * `image[src]`. When the image is successfully uploaded, the temporary data is replaced with the target
	 * image's URL (the URL to the uploaded image on the server).
	 *
	 * @protected
	 * @param {module:upload/filerepository~FileLoader} loader
	 * @param {module:engine/model/element~Element} imageElement
	 * @returns {Promise}
	 */
	_readAndUpload( loader, imageElement ) {
		const editor = this.editor;
		const model = editor.model;
		const t = editor.locale.t;
		const fileRepository = editor.plugins.get( FileRepository );
		const notification = editor.plugins.get( Notification );

		model.enqueueChange( 'transparent', writer => {
			writer.setAttribute( 'uploadStatus', 'reading', imageElement );
		} );

		return loader.read()
			.then( () => {
				const promise = loader.upload();

				// Force re–paint in Safari. Without it, the image will display with a wrong size.
				// https://github.com/ckeditor/ckeditor5/issues/1975
				/* istanbul ignore next */
				if ( env.isSafari ) {
					const viewFigure = editor.editing.mapper.toViewElement( imageElement );
					const viewImg = getViewImgFromWidget( viewFigure );

					editor.editing.view.once( 'render', () => {
						// Early returns just to be safe. There might be some code ran
						// in between the outer scope and this callback.
						if ( !viewImg.parent ) {
							return;
						}

						const domFigure = editor.editing.view.domConverter.mapViewToDom( viewImg.parent );

						if ( !domFigure ) {
							return;
						}

						const originalDisplay = domFigure.style.display;

						domFigure.style.display = 'none';

						// Make sure this line will never be removed during minification for having "no effect".
						domFigure._ckHack = domFigure.offsetHeight;

						domFigure.style.display = originalDisplay;
					} );
				}

				model.enqueueChange( 'transparent', writer => {
					writer.setAttribute( 'uploadStatus', 'uploading', imageElement );
				} );

				return promise;
			} )
			.then( data => {
				model.enqueueChange( 'transparent', writer => {
					writer.setAttributes( { uploadStatus: 'complete', src: data.default }, imageElement );
					this._parseAndSetSrcsetAttributeOnImage( data, imageElement, writer );
				} );

				clean();
			} )
			.catch( error => {
				// If status is not 'error' nor 'aborted' - throw error because it means that something else went wrong,
				// it might be generic error and it would be real pain to find what is going on.
				if ( loader.status !== 'error' && loader.status !== 'aborted' ) {
					throw error;
				}

				// Might be 'aborted'.
				if ( loader.status == 'error' && error ) {
					notification.showWarning( error, {
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

	/**
	 * Creates the `srcset` attribute based on a given file upload response and sets it as an attribute to a specific image element.
	 *
	 * @protected
	 * @param {Object} data Data object from which `srcset` will be created.
	 * @param {module:engine/model/element~Element} image The image element on which the `srcset` attribute will be set.
	 * @param {module:engine/model/writer~Writer} writer
	 */
	_parseAndSetSrcsetAttributeOnImage( data, image, writer ) {
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
			}, image );
		}
	}
}

// Returns `true` if non-empty `text/html` is included in the data transfer.
//
// @param {module:clipboard/datatransfer~DataTransfer} dataTransfer
// @returns {Boolean}
export function isHtmlIncluded( dataTransfer ) {
	return Array.from( dataTransfer.types ).includes( 'text/html' ) && dataTransfer.getData( 'text/html' ) !== '';
}

function getImagesFromChangeItem( editor, item ) {
	return Array.from( editor.model.createRangeOn( item ) )
		.filter( value => value.item.is( 'image' ) )
		.map( value => value.item );
}
