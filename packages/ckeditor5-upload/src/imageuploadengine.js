/**
 * Copyright (c) 2016, CKSource - Frederico Knabben. All rights reserved.
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { eventNameToConsumableType } from '@ckeditor/ckeditor5-engine/src/conversion/model-to-view-converters';
import FileRepository from './filerepository';
import ImageUploadCommand from './imageuploadcommand';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import uploadingPlaceholder from '../theme/images/image_placeholder.svg';
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

		// Setup schema to allow uploadId for images.
		schema.allow( { name: 'image', attributes: [ 'uploadId' ], inside: '$root' } );
		schema.requireAttributes( 'image', [ 'uploadId' ] );

		// Register imageUpload command.
		editor.commands.set( 'imageUpload', new ImageUploadCommand( editor ) );

		// Execute imageUpload command when image is dropped or pasted.
		editor.editing.view.on( 'input', ( evt, data ) => {
			for ( const file of data.dataTransfer.files ) {
				if ( isImageType( file ) ) {
					editor.execute( 'imageUpload', { file: file } );
					evt.stop();
				}
			}
		} );

		doc.on( 'change', ( evt, type, data, batch ) => {
			if ( type === 'insert' ) {
				for ( const value of data.range ) {
					if ( value.type === 'elementStart' && value.item.name === 'image' ) {
						const imageElement = value.item;
						const uploadId = imageElement.getAttribute( 'uploadId' );
						const fileRepository = editor.plugins.get( FileRepository );

						if ( uploadId ) {
							const loader = fileRepository.loaders.get( uploadId );

							if ( loader && loader.status == 'idle' ) {
								this.load( loader, batch, imageElement );
							}
						}
					}
				}
			}
		} );

		editor.editing.modelToView.on( 'addAttribute:uploadId:image', ( evt, data, consumable ) => {
			if ( !consumable.consume( data.item, eventNameToConsumableType( evt.name ) ) ) {
				return;
			}

			const modelImage = data.item;
			const viewFigure = editor.editing.mapper.toViewElement( modelImage );
			const viewImg = viewFigure.getChild( 0 );
			viewImg.setAttribute( 'src', uploadingPlaceholder );

			// TODO: if there are data -> show data
		} );
	}

	load( loader, batch, imageElement ) {
		const editor = this.editor;
		const doc = editor.document;
		const fileRepository = editor.plugins.get( FileRepository );
		const notification = editor.plugins.get( Notification );

		loader.read()
			.then( data => {
				const viewFigure = editor.editing.mapper.toViewElement( imageElement );
				const viewImg = viewFigure.getChild( 0 );
				viewImg.setAttribute( 'src', data );
				editor.editing.view.render();

				return loader.upload();
			} )
			.then( data => {
				doc.enqueueChanges( () => {
					batch.setAttribute( imageElement, 'src', data.original );
				} );

				clean();
			} )
			.catch( msg => {
				// Might be 'aborted'
				if ( loader.status == 'error' ) {
					notification.showWarning( msg, { namespace: 'upload' } );
				}

				clean();

				// TODO: delete image
			} );

		function clean() {
			doc.enqueueChanges( () => {
				batch.removeAttribute( imageElement, 'uploadId' );
			} );

			fileRepository.destroyLoader( loader );
		}
	}
}
