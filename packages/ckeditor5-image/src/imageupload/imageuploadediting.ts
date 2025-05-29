/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageupload/imageuploadediting
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';

import {
	UpcastWriter,
	type Element,
	type Item,
	type Writer,
	type DataTransfer,
	type ViewElement,
	type NodeAttributes,
	type DowncastAttributeEvent,
	type UpcastElementEvent
} from 'ckeditor5/src/engine.js';

import { Notification } from 'ckeditor5/src/ui.js';
import { ClipboardPipeline, type ViewDocumentClipboardInputEvent } from 'ckeditor5/src/clipboard.js';
import { FileRepository, type UploadResponse, type FileLoader } from 'ckeditor5/src/upload.js';
import { env } from 'ckeditor5/src/utils.js';

import ImageUtils from '../imageutils.js';
import UploadImageCommand from './uploadimagecommand.js';
import { fetchLocalImage, isLocalImage } from '../../src/imageupload/utils.js';
import { createImageTypeRegExp } from './utils.js';

/**
 * The editing part of the image upload feature. It registers the `'uploadImage'` command
 * and the `imageUpload` command as an aliased name.
 *
 * When an image is uploaded, it fires the {@link ~ImageUploadEditing#event:uploadComplete `uploadComplete`} event
 * that allows adding custom attributes to the {@link module:engine/model/element~Element image element}.
 */
export default class ImageUploadEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FileRepository, Notification, ClipboardPipeline, ImageUtils ] as const;
	}

	public static get pluginName() {
		return 'ImageUploadEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * An internal mapping of {@link module:upload/filerepository~FileLoader#id file loader UIDs} and
	 * model elements during the upload.
	 *
	 * Model element of the uploaded image can change, for instance, when {@link module:image/image/imagetypecommand~ImageTypeCommand}
	 * is executed as a result of adding caption or changing image style. As a result, the upload logic must keep track of the model
	 * element (reference) and resolve the upload for the correct model element (instead of the one that landed in the `$graveyard`
	 * after image type changed).
	 */
	private readonly _uploadImageElements: Map<string, Set<Element>>;

	/**
	 * An internal mapping of {@link module:upload/filerepository~FileLoader#id file loader UIDs} and
	 * upload responses for handling images dragged during their upload process. When such images are later
	 * dropped, their original upload IDs no longer exist in the registry (as the original upload completed).
	 * This map preserves the upload responses to properly handle such cases.
	 */
	private readonly _uploadedImages = new Map<string, UploadResponse>();

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'image', {
			upload: {
				types: [ 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff' ]
			}
		} );

		this._uploadImageElements = new Map();
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const doc = editor.model.document;
		const conversion = editor.conversion;
		const fileRepository = editor.plugins.get( FileRepository );
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const clipboardPipeline: ClipboardPipeline = editor.plugins.get( 'ClipboardPipeline' );
		const imageTypes = createImageTypeRegExp( editor.config.get( 'image.upload.types' )! );
		const uploadImageCommand = new UploadImageCommand( editor );

		// Register `uploadImage` command and add `imageUpload` command as an alias for backward compatibility.
		editor.commands.add( 'uploadImage', uploadImageCommand );
		editor.commands.add( 'imageUpload', uploadImageCommand );

		// Register upcast converter for uploadId.
		conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'img',
					key: 'uploadId'
				},
				model: 'uploadId'
			} )

			// Handle the case when the image is not fully uploaded yet but it's being moved.
			// See more: https://github.com/ckeditor/ckeditor5/pull/17327
			.add( dispatcher => dispatcher.on<UpcastElementEvent>( 'element:img', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.test( data.viewItem, { attributes: [ 'data-ck-upload-id' ] } ) ) {
					return;
				}

				const uploadId = data.viewItem.getAttribute( 'data-ck-upload-id' );

				if ( !uploadId ) {
					return;
				}

				const [ modelElement ] = Array.from( data.modelRange!.getItems( { shallow: true } ) );
				const loader = fileRepository.loaders.get( uploadId as string );

				if ( modelElement ) {
					// Handle case when `uploadId` is set on the image element but the loader is not present in the registry.
					// It may happen when the image was successfully uploaded and the loader was removed from the registry.
					// It's still present in the `_uploadedImages` map though. It's why we do not place this line in the condition below.
					conversionApi.writer.setAttribute( 'uploadId', uploadId, modelElement );
					conversionApi.consumable.consume( data.viewItem, { attributes: [ 'data-ck-upload-id' ] } );

					if ( loader && loader.data ) {
						conversionApi.writer.setAttribute( 'uploadStatus', loader.status, modelElement );
					}
				}
			}, { priority: 'low' } ) );

		// Handle pasted images.
		// For every image file, a new file loader is created and a placeholder image is
		// inserted into the content. Then, those images are uploaded once they appear in the model
		// (see Document#change listener below).
		this.listenTo<ViewDocumentClipboardInputEvent>( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
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

			if ( !images.length ) {
				return;
			}

			evt.stop();

			editor.model.change( writer => {
				// Set selection to paste target.
				if ( data.targetRanges ) {
					writer.setSelection( data.targetRanges.map( viewRange => editor.editing.mapper.toModelRange( viewRange ) ) );
				}

				editor.execute( 'uploadImage', { file: images } );
			} );

			const uploadImageCommand = editor.commands.get( 'uploadImage' )!;

			if ( !uploadImageCommand.isAccessAllowed ) {
				const notification: Notification = editor.plugins.get( 'Notification' );
				const t = editor.locale.t;

				notification.showWarning( t( 'You have no image upload permissions.' ), {
					namespace: 'image'
				} );
			}
		} );

		// Handle HTML pasted with images with base64 or blob sources.
		// For every image file, a new file loader is created and a placeholder image is
		// inserted into the content. Then, those images are uploaded once they appear in the model
		// (see Document#change listener below).
		this.listenTo( clipboardPipeline, 'inputTransformation', ( evt, data ) => {
			const fetchableImages = Array.from( editor.editing.view.createRangeIn( data.content ) )
				.map( value => value.item as ViewElement )
				.filter( viewElement =>
					isLocalImage( imageUtils, viewElement ) &&
					!viewElement.getAttribute( 'uploadProcessed' ) )
				.map( viewElement => { return { promise: fetchLocalImage( viewElement ), imageElement: viewElement }; } );

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
			// Note: Reversing changes to start with insertions and only then handle removals. If it was the other way around,
			// loaders for **all** images that land in the $graveyard would abort while in fact only those that were **not** replaced
			// by other images should be aborted.
			const changes = doc.differ.getChanges( { includeChangesInGraveyard: true } ).reverse();
			const insertedImagesIds = new Set();

			for ( const entry of changes ) {
				if ( entry.type == 'insert' && entry.name != '$text' ) {
					const item = entry.position.nodeAfter!;
					const isInsertedInGraveyard = entry.position.root.rootName == '$graveyard';

					for ( const imageElement of getImagesFromChangeItem( editor, item ) ) {
						// Check if the image element still has upload id.
						const uploadId = imageElement.getAttribute( 'uploadId' ) as string;

						if ( !uploadId ) {
							continue;
						}

						// Check if the image is loaded on this client.
						const loader = fileRepository.loaders.get( uploadId );

						if ( !loader ) {
							// If the loader does not exist, it means that the image was already uploaded
							// and the loader promise was removed from the registry. In that scenario we need
							// to restore response object from the internal map.
							if ( !isInsertedInGraveyard && this._uploadedImages.has( uploadId ) ) {
								// Fire `uploadComplete` to set proper attributes on the image element.
								editor.model.enqueueChange( { isUndoable: false }, writer => {
									writer.setAttribute( 'uploadStatus', 'complete', imageElement );

									this.fire<ImageUploadCompleteEvent>( 'uploadComplete', {
										data: this._uploadedImages.get( uploadId )!,
										imageElement: imageElement as Element
									} );
								} );

								// While it makes sense to remove the image from the `_uploadedImages` map here,
								// it's counterintuitive for the user that pastes image in uploading several times.
								// It'll work the first time, but the next time the image will be empty because the
								// `_uploadedImages` no longer contain the response.
							}

							continue;
						}

						if ( isInsertedInGraveyard ) {
							// If the image was inserted to the graveyard for good (**not** replaced by another image),
							// only then abort the loading process.
							if ( !insertedImagesIds.has( uploadId ) ) {
								// ... but abort it only if all remain images that share the same loader are in the graveyard too.
								// This is to prevent situation when we have two images in uploading state and one of them is being
								// placed in the graveyard (e.g. using undo). The other one should not be aborted.
								const allImagesThatShareUploaderInGraveyard = Array
									.from( this._uploadImageElements.get( uploadId )! )
									.every( element => element.root.rootName == '$graveyard' );

								if ( allImagesThatShareUploaderInGraveyard ) {
									loader.abort();
								}
							}
						} else {
							// Remember the upload id of the inserted image. If it acted as a replacement for another
							// image (which landed in the $graveyard), the related loader will not be aborted because
							// this is still the same image upload.
							insertedImagesIds.add( uploadId );

							// Keep the mapping between the upload ID and the image model element so the upload
							// can later resolve in the context of the correct model element. The model element could
							// change for the same upload if one image was replaced by another (e.g. image type was changed),
							// so this may also replace an existing mapping.
							if ( !this._uploadImageElements.has( uploadId ) ) {
								this._uploadImageElements.set( uploadId, new Set( [ imageElement as Element ] ) );
							} else {
								this._uploadImageElements.get( uploadId )!.add( imageElement as Element );
							}

							if ( loader.status == 'idle' ) {
								// If the image was inserted into content and has not been loaded yet, start loading it.
								this._readAndUpload( loader );
							}
						}
					}
				}
			}
		} );

		// Set the default handler for feeding the image element with `src` and `srcset` attributes.
		// Also set the natural `width` and `height` attributes (if not already set).
		this.on<ImageUploadCompleteEvent>( 'uploadComplete', ( evt, { imageElement, data } ) => {
			const urls = data.urls ? data.urls as Record<string, unknown> : data;

			this.editor.model.change( writer => {
				writer.setAttribute( 'src', urls.default, imageElement );
				this._parseAndSetSrcsetAttributeOnImage( urls, imageElement, writer );
				imageUtils.setImageNaturalSizeAttributes( imageElement );
			} );
		}, { priority: 'low' } );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const schema = this.editor.model.schema;

		// Setup schema to allow uploadId and uploadStatus for images.
		// Wait for ImageBlockEditing or ImageInlineEditing to register their elements first,
		// that's why doing this in afterInit() instead of init().
		if ( this.editor.plugins.has( 'ImageBlockEditing' ) ) {
			schema.extend( 'imageBlock', {
				allowAttributes: [ 'uploadId', 'uploadStatus' ]
			} );

			this._registerConverters( 'imageBlock' );
		}

		if ( this.editor.plugins.has( 'ImageInlineEditing' ) ) {
			schema.extend( 'imageInline', {
				allowAttributes: [ 'uploadId', 'uploadStatus' ]
			} );

			this._registerConverters( 'imageInline' );
		}
	}

	/**
	 * Reads and uploads an image.
	 *
	 * The image is read from the disk and as a Base64-encoded string it is set temporarily to
	 * `image[src]`. When the image is successfully uploaded, the temporary data is replaced with the target
	 * image's URL (the URL to the uploaded image on the server).
	 */
	protected _readAndUpload( loader: FileLoader ): Promise<void> {
		const editor = this.editor;
		const model = editor.model;
		const t = editor.locale.t;
		const fileRepository = editor.plugins.get( FileRepository );
		const notification = editor.plugins.get( Notification );
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const imageUploadElements = this._uploadImageElements;

		model.enqueueChange( { isUndoable: false }, writer => {
			const elements = imageUploadElements.get( loader.id )!;

			for ( const element of elements ) {
				writer.setAttribute( 'uploadStatus', 'reading', element );
			}
		} );

		return loader.read()
			.then( () => {
				const promise = loader.upload();

				if ( editor.ui ) {
					editor.ui.ariaLiveAnnouncer.announce( t( 'Uploading image' ) );
				}

				for ( const imageElement of imageUploadElements.get( loader.id )! ) {
					// Force re–paint in Safari. Without it, the image will display with a wrong size.
					// https://github.com/ckeditor/ckeditor5/issues/1975
					/* istanbul ignore next -- @preserve */
					if ( env.isSafari ) {
						const viewFigure = editor.editing.mapper.toViewElement( imageElement )!;
						const viewImg = imageUtils.findViewImgElement( viewFigure )!;

						editor.editing.view.once( 'render', () => {
							// Early returns just to be safe. There might be some code ran
							// in between the outer scope and this callback.
							if ( !viewImg.parent ) {
								return;
							}

							const domFigure = editor.editing.view.domConverter.mapViewToDom( viewImg.parent ) as HTMLElement | undefined;

							if ( !domFigure ) {
								return;
							}

							const originalDisplay = domFigure.style.display;

							domFigure.style.display = 'none';

							// Make sure this line will never be removed during minification for having "no effect".
							( domFigure as any )._ckHack = domFigure.offsetHeight;

							domFigure.style.display = originalDisplay;
						} );
					}

					model.enqueueChange( { isUndoable: false }, writer => {
						writer.setAttribute( 'uploadStatus', 'uploading', imageElement );
					} );
				}

				return promise;
			} )
			.then( data => {
				model.enqueueChange( { isUndoable: false }, writer => {
					for ( const imageElement of imageUploadElements.get( loader.id )! ) {
						writer.setAttribute( 'uploadStatus', 'complete', imageElement );
						this.fire<ImageUploadCompleteEvent>( 'uploadComplete', { data, imageElement } );
					}

					if ( editor.ui ) {
						editor.ui.ariaLiveAnnouncer.announce( t( 'Image upload complete' ) );
					}

					this._uploadedImages.set( loader.id, data );
				} );

				clean();
			} )
			.catch( error => {
				if ( editor.ui ) {
					editor.ui.ariaLiveAnnouncer.announce( t( 'Error during image upload' ) );
				}

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

				// Permanently remove image from insertion batch.
				model.enqueueChange( { isUndoable: false }, writer => {
					for ( const imageElement of imageUploadElements.get( loader.id )! ) {
						// Handle situation when the image has been removed and then `abort` exception was thrown.
						// See: https://github.com/cksource/ckeditor5-commercial/issues/6817
						if ( imageElement.root.rootName !== '$graveyard' ) {
							writer.remove( imageElement );
						}
					}
				} );

				clean();
			} );

		function clean() {
			model.enqueueChange( { isUndoable: false }, writer => {
				for ( const imageElement of imageUploadElements.get( loader.id )! ) {
					writer.removeAttribute( 'uploadId', imageElement );
					writer.removeAttribute( 'uploadStatus', imageElement );
				}

				imageUploadElements.delete( loader.id );
			} );

			fileRepository.destroyLoader( loader );
		}
	}

	/**
	 * Creates the `srcset` attribute based on a given file upload response and sets it as an attribute to a specific image element.
	 *
	 * @param data Data object from which `srcset` will be created.
	 * @param image The image element on which the `srcset` attribute will be set.
	 */
	protected _parseAndSetSrcsetAttributeOnImage( data: Record<string, unknown>, image: Element, writer: Writer ): void {
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
			const attributes: NodeAttributes = {
				srcset: srcsetAttribute
			};

			if ( !image.hasAttribute( 'width' ) && !image.hasAttribute( 'height' ) ) {
				attributes.width = maxWidth;
			}

			writer.setAttributes( attributes, image );
		}
	}

	/**
	 * Registers image upload converters.
	 *
	 * @param imageType The type of the image.
	 */
	private _registerConverters( imageType: 'imageBlock' | 'imageInline' ) {
		const { conversion, plugins } = this.editor;

		const fileRepository = plugins.get( FileRepository );
		const imageUtils = plugins.get( ImageUtils );

		// It sets `data-ck-upload-id` attribute on the view image elements that are not fully uploaded.
		// It avoids the situation when image disappears when it's being moved and upload is not finished yet.
		// See more: https://github.com/ckeditor/ckeditor5/issues/16967
		conversion.for( 'dataDowncast' ).add( dispatcher => {
			dispatcher.on<DowncastAttributeEvent>( `attribute:uploadId:${ imageType }`, ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.test( data.item, evt.name ) ) {
					return;
				}

				const loader = fileRepository.loaders.get( data.attributeNewValue as string );

				if ( !loader || !loader.data ) {
					return null;
				}

				const viewElement = conversionApi.mapper.toViewElement( data.item as Element )!;
				const img = imageUtils.findViewImgElement( viewElement );

				if ( img ) {
					conversionApi.consumable.consume( data.item, evt.name );
					conversionApi.writer.setAttribute( 'data-ck-upload-id', loader.id, img );
				}
			} );
		} );
	}
}

/**
 * Returns `true` if non-empty `text/html` is included in the data transfer.
 */
export function isHtmlIncluded( dataTransfer: DataTransfer ): boolean {
	return Array.from( dataTransfer.types ).includes( 'text/html' ) && dataTransfer.getData( 'text/html' ) !== '';
}

function getImagesFromChangeItem( editor: Editor, item: Item ): Array<Item> {
	const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

	return Array.from( editor.model.createRangeOn( item ) )
		.filter( value => imageUtils.isImage( value.item as Element ) )
		.map( value => value.item );
}

/**
 * An event fired when an image is uploaded. You can hook into this event to provide
 * custom attributes to the {@link module:engine/model/element~Element image element} based on the data from
 * the server.
 *
 * ```ts
 * const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );
 *
 * imageUploadEditing.on( 'uploadComplete', ( evt, { data, imageElement } ) => {
 * 	editor.model.change( writer => {
 * 		writer.setAttribute( 'someAttribute', 'foo', imageElement );
 * 	} );
 * } );
 * ```
 *
 * You can also stop the default handler that sets the `src` and `srcset` attributes
 * if you want to provide custom values for these attributes.
 *
 * ```ts
 * imageUploadEditing.on( 'uploadComplete', ( evt, { data, imageElement } ) => {
 * 	evt.stop();
 * } );
 * ```
 *
 * **Note**: This event is fired by the {@link module:image/imageupload/imageuploadediting~ImageUploadEditing} plugin.
 *
 * @eventName ~ImageUploadEditing#uploadComplete
 * @param data The `uploadComplete` event data.
 */
export type ImageUploadCompleteEvent = {
	name: 'uploadComplete';
	args: [ data: ImageUploadCompleteData];
};

export type ImageUploadCompleteData = {

	/**
	 * The data coming from the upload adapter.
	 */
	data: UploadResponse;

	/**
	 * The model {@link module:engine/model/element~Element image element} that can be customized.
	 */
	imageElement: Element;
};
