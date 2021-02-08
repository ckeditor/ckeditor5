
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

import { fetchLocalFile, isLocalFile } from './utils';
import { createFileTypeRegExp } from './utils';
import FileUploadCommand from "./fileuploadcommand";

/**
 * The editing part of the file upload feature. It registers the `'fileUpload'` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FileUploadEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FileRepository, Notification, Clipboard ];
	}

	static get pluginName() {
		return 'FileUploadEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
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

		const fileTypes = createFileTypeRegExp(editor.config.get( 'simpleFileUpload.fileTypes' ));

		// Setup schema to allow uploadId and uploadStatus for files.
		schema.extend( '$text', {
			allowAttributes: [
				'uploadId',
				'uploadStatus'
			]
		} );

		// Register fileUpload command.
		editor.commands.add( 'fileUpload', new FileUploadCommand( editor ) );

		// Register upcast converter for uploadId.
		conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'a',
					key: 'uploadId'
				},
				model: 'uploadId'
			} );

		this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
			// Skip if non empty HTML data is included.
			// https://github.com/ckeditor/ckeditor5-upload/issues/68
			if ( isHtmlIncluded( data.dataTransfer ) ) {
				return;
			}

			const files = Array.from( data.dataTransfer.files ).filter( file => {
				if ( !file ) {
					return false;
				}
				return fileTypes.test( file.type );
			} );

			const ranges = data.targetRanges.map( viewRange => editor.editing.mapper.toModelRange( viewRange ) );

			editor.model.change( writer => {
				// Set selection to paste target.
				writer.setSelection( ranges );

				if ( files.length ) {
					evt.stop();

					// Upload files after the selection has changed in order to ensure the command's state is refreshed.
					editor.model.enqueueChange( 'default', () => {
						editor.execute( 'fileUpload', { file: files } );
					} );
				}
			} );
		} );

		this.listenTo( editor.plugins.get( Clipboard ), 'inputTransformation', ( evt, data ) => {
			const fetchableFiles = Array.from( editor.editing.view.createRangeIn( data.content ) )
				.filter( value => isLocalFile( value.item ) && !value.item.getAttribute( 'uploadProcessed' ) )
				.map( value => { return { promise: fetchLocalFile( value.item ), fileElement: value.item }; } );

			if ( !fetchableFiles.length ) {
				return;
			}

			const writer = new UpcastWriter();

			for ( const fetchableFile of fetchableFiles ) {
				// Set attribute marking that the file was processed already.
				writer.setAttribute( 'uploadProcessed', true, fetchableFile.fileElement );

				const loader = fileRepository.createLoader( fetchableFile.promise );

				if ( loader ) {
					writer.setAttribute( 'href', '', fetchableFile.fileElement );
					writer.setAttribute( 'uploadId', loader.id, fetchableFile.fileElement );
				}
			}
		} );

		// Prevents from the browser redirecting to the dropped file.
		editor.editing.view.document.on( 'dragover', ( evt, data ) => {
			data.preventDefault();
		} );

		// Upload placeholder files that appeared in the model.
		doc.on( 'change', () => {
			const changes = doc.differ.getChanges( { includeChangesInGraveyard: true } );
			for ( const entry of changes ) {
				if ( entry.type == 'insert') {
					const item = entry.position.nodeAfter;
					if (item) {
						const isInGraveyard = entry.position.root.rootName == '$graveyard';
						for ( const file of getFileLinksFromChangeItem( editor, item ) ) {
							// Check if the file element still has upload id.
							const uploadId = file.getAttribute( 'uploadId' );
							if ( !uploadId ) {
								continue;
							}

							// Check if the file is loaded on this client.
							const loader = fileRepository.loaders.get( uploadId );

							if ( !loader ) {
								continue;
							}

							if ( isInGraveyard ) {
								// If the file was inserted to the graveyard - abort the loading process.
								loader.abort();
							} else if ( loader.status == 'idle' ) {
								// If the file was inserted into content and has not been loaded yet, start loading it.
								this._readAndUpload( loader, file );
							}
						}
					}

				}
			}
		} );
	}

	/**
	 * Reads and uploads a file.
	 *
	 * @protected
	 * @param {module:upload/filerepository~FileLoader} loader
	 * @param {module:engine/model/element~Element} fileElement
	 * @returns {Promise}
	 */
	_readAndUpload( loader, fileElement ) {
		const editor = this.editor;
		const model = editor.model;
		const t = editor.locale.t;
		const fileRepository = editor.plugins.get( FileRepository );
		const notification = editor.plugins.get( Notification );

		model.enqueueChange( 'transparent', writer => {
			writer.setAttribute( 'uploadStatus', 'reading', fileElement );
		} );

		return loader.read()
			.then( () => {
				const promise = loader.upload();

				model.enqueueChange( 'transparent', writer => {
					writer.setAttribute( 'uploadStatus', 'uploading', fileElement );
				} );

				return promise;
			} )
			.then( data => {
				model.enqueueChange( 'transparent', writer => {
					writer.setAttributes( { uploadStatus: 'complete', linkHref: data.resourceUrl }, fileElement );
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

				// Permanently remove file from insertion batch.
				model.enqueueChange( 'transparent', writer => {
					writer.remove( fileElement );
				} );
			} );

		function clean() {
			model.enqueueChange( 'transparent', writer => {
				writer.removeAttribute( 'uploadId', fileElement );
				writer.removeAttribute( 'uploadStatus', fileElement );
			} );

			fileRepository.destroyLoader( loader );
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

function getFileLinksFromChangeItem( editor, item ) {
	return Array.from( editor.model.createRangeOn( item ) )
		.filter( value => value.item.hasAttribute('linkHref'))
		.map( value => value.item );
}
