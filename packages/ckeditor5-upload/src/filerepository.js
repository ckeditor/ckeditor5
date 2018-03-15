/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/filerepository
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import log from '@ckeditor/ckeditor5-utils/src/log';

import FileReader from './filereader.js';

import uid from '@ckeditor/ckeditor5-utils/src/uid.js';

/**
 * File repository plugin. A central point for managing file upload.
 *
 * To use it, first you need an upload adapter. Upload adapter's job is to handle communication with the server
 * (sending the file and handling server's response). You can use one of the existing plugins introducing upload adapters
 * (e.g. {@link module:easy-image/cloudservicesuploadadapter~CloudServicesUploadAdapter} or
 * {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter}) or write your own one
 * (which boils down to setting the {@link ~FileRepository#createUploadAdapter} factory function – see
 * {@link module:upload/filerepository~UploadAdapter `UploadAdapter` interface} documentation).
 *
 * Then, you can use {@link module:upload/filerepository~FileRepository#createLoader `createLoader()`} and the returned
 * {@link module:upload/filerepository~FileLoader} instance to load and upload files.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FileRepository extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FileRepository';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		/**
		 * Collection of loaders associated with this repository.
		 *
		 * @member {module:utils/collection~Collection} #loaders
		 */
		this.loaders = new Collection();

		/**
		 * A factory function which should be defined before using `FileRepository`.
		 *
		 * It should return a new instance of {@link module:upload/filerepository~UploadAdapter} that will be used to upload files.
		 * {@link module:upload/filerepository~FileLoader} instance associated with the adapter
		 * will be passed to that function.
		 *
		 * For more information and example see {@link module:upload/filerepository~UploadAdapter}.
		 *
		 * @member {Function} #createUploadAdapter
		 */

		/**
		 * Number of bytes uploaded.
		 *
		 * @readonly
		 * @observable
		 * @member {Number} #uploaded
		 */
		this.set( 'uploaded', 0 );

		/**
		 * Number of total bytes to upload.
		 *
		 * It might be different than the file size because of headers and additional data.
		 * It contains `null` if value is not available yet, so it's better to use {@link #uploadedPercent} to monitor
		 * the progress.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #uploadTotal
		 */
		this.set( 'uploadTotal', null );

		/**
		 * Upload progress in percents.
		 *
		 * @readonly
		 * @observable
		 * @member {Number} #uploadedPercent
		 */
		this.bind( 'uploadedPercent' ).to( this, 'uploaded', this, 'uploadTotal', ( uploaded, total ) => {
			return total ? ( uploaded / total * 100 ) : 0;
		} );
	}

	/**
	 * Returns the loader associated with specified file.
	 *
	 * To get loader by id use `fileRepository.loaders.get( id )`.
	 *
	 * @param {File} file Native file handle.
	 * @returns {module:upload/filerepository~FileLoader|null}
	 */
	getLoader( file ) {
		for ( const loader of this.loaders ) {
			if ( loader.file == file ) {
				return loader;
			}
		}

		return null;
	}

	/**
	 * Creates a loader instance for the given file.
	 *
	 * Requires {@link #createUploadAdapter} factory to be defined.
	 *
	 * @param {File} file Native File object.
	 * @returns {module:upload/filerepository~FileLoader|null}
	 */
	createLoader( file ) {
		if ( !this.createUploadAdapter ) {
			/**
			 * You need to enable an upload adapter in order to be able to upload files.
			 *
			 * This warning shows up when {@link module:upload/filerepository~FileRepository} is being used
			 * without {@link #createUploadAdapter definining an upload adapter}.
			 *
			 * **If you see this warning when using one of the {@glink builds/index CKEditor 5 Builds}**
			 * it means that you did not configure any of the upload adapters available by default in those builds.
			 * See:
			 *
			 * * {@link module:core/editor/editorconfig~EditorConfig#cloudServices `config.cloudServices`} for
			 * Easy Image with Cloud Services integration,
			 * * {@link module:core/editor/editorconfig~EditorConfig#ckfinder `config.ckfinder`} for CKFinder
			 * file upload integration.
			 *
			 * **If you see this warning when using a custom build** there is a chance that you enabled
			 * a feature like {@link module:image/imageupload~ImageUpload},
			 * or {@link module:image/imageupload/imageuploadui~ImageUploadUI} but you did not enable any upload adapter.
			 * You can choose one of the existing upload adapters:
			 *
			 * * {@link module:easy-image/cloudservicesuploadadapter~CloudServicesUploadAdapter}
			 * (remember to {@link module:core/editor/editorconfig~EditorConfig#cloudServices configure it})
			 * * {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter}
			 * (remember to {@link module:core/editor/editorconfig~EditorConfig#ckfinder configure it})
			 *
			 * You can also implement your own upload adapter (in which case, please refer
			 * to the {@link module:upload/filerepository~UploadAdapter `UploadAdapter` interface} documentation).
			 *
			 * @error filerepository-no-upload-adapter
			 */
			log.error( 'filerepository-no-upload-adapter: Upload adapter is not defined.' );

			return null;
		}

		const loader = new FileLoader( file );
		loader._adapter = this.createUploadAdapter( loader );

		this.loaders.add( loader );

		loader.on( 'change:uploaded', () => {
			let aggregatedUploaded = 0;

			for ( const loader of this.loaders ) {
				aggregatedUploaded += loader.uploaded;
			}

			this.uploaded = aggregatedUploaded;
		} );

		loader.on( 'change:uploadTotal', () => {
			let aggregatedTotal = 0;

			for ( const loader of this.loaders ) {
				if ( loader.uploadTotal ) {
					aggregatedTotal += loader.uploadTotal;
				}
			}

			this.uploadTotal = aggregatedTotal;
		} );

		return loader;
	}

	/**
	 * Destroys the given loader.
	 *
	 * @param {File|module:upload/filerepository~FileLoader} fileOrLoader File associated with that loader or loader
	 * itself.
	 */
	destroyLoader( fileOrLoader ) {
		const loader = fileOrLoader instanceof FileLoader ? fileOrLoader : this.getLoader( fileOrLoader );

		loader._destroy();

		this.loaders.remove( loader );
	}
}

mix( FileRepository, ObservableMixin );

/**
 * File loader class.
 * It is used to control the process of file reading and uploading using specified adapter.
 */
class FileLoader {
	/**
	 * Creates a new instance of `FileLoader`.
	 *
	 * @param {File} file A native file instance.
	 * @param {module:upload/filerepository~UploadAdapter} adapter
	 */
	constructor( file, adapter ) {
		/**
		 * Unique id of FileLoader instance.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.id = uid();

		/**
		 * A `File` instance associated with this file loader.
		 *
		 * @readonly
		 * @member {File}
		 */
		this.file = file;

		/**
		 * Adapter instance associated with this file loader.
		 *
		 * @private
		 * @member {module:upload/filerepository~UploadAdapter}
		 */
		this._adapter = adapter;

		/**
		 * FileReader used by FileLoader.
		 *
		 * @protected
		 * @member {module:upload/filereader~FileReader}
		 */
		this._reader = new FileReader();

		/**
		 * Current status of FileLoader. It can be one of the following:
		 *
		 * * 'idle',
		 * * 'reading',
		 * * 'uploading',
		 * * 'aborted',
		 * * 'error'.
		 *
		 * When reading status can change in a following way:
		 *
		 * `idle` -> `reading` -> `idle`
		 * `idle` -> `reading -> `aborted`
		 * `idle` -> `reading -> `error`
		 *
		 * When uploading status can change in a following way:
		 *
		 * `idle` -> `uploading` -> `idle`
		 * `idle` -> `uploading` -> `aborted`
		 * `idle` -> `uploading` -> `error`
		 *
		 * @readonly
		 * @observable
		 * @member {String} #status
		 */
		this.set( 'status', 'idle' );

		/**
		 * Number of bytes uploaded.
		 *
		 * @readonly
		 * @observable
		 * @member {Number} #uploaded
		 */
		this.set( 'uploaded', 0 );

		/**
		 * Number of total bytes to upload.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #uploadTotal
		 */
		this.set( 'uploadTotal', null );

		/**
		 * Upload progress in percents.
		 *
		 * @readonly
		 * @observable
		 * @member {Number} #uploadedPercent
		 */
		this.bind( 'uploadedPercent' ).to( this, 'uploaded', this, 'uploadTotal', ( uploaded, total ) => {
			return total ? ( uploaded / total * 100 ) : 0;
		} );

		/**
		 * Response of the upload.
		 *
		 * @readonly
		 * @observable
		 * @member {Object|null} #uploadResponse
		 */
		this.set( 'uploadResponse', null );
	}

	/**
	 * Reads file using {@link module:upload/filereader~FileReader}.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `filerepository-read-wrong-status` when status
	 * is different than `idle`.
	 *
	 * Example usage:
	 *
	 *	fileLoader.read()
	 *		.then( data => { ... } )
	 *		.catch( err => {
	 *			if ( err === 'aborted' ) {
	 *				console.log( 'Reading aborted.' );
	 *			} else {
	 *				console.log( 'Reading error.', err );
	 *			}
	 *		} );
	 *
	 * @returns {Promise} Returns promise that will be resolved with read data. Promise will be rejected if error
	 * occurs or if read process is aborted.
	 */
	read() {
		if ( this.status != 'idle' ) {
			throw new CKEditorError( 'filerepository-read-wrong-status: You cannot call read if the status is different than idle.' );
		}

		this.status = 'reading';

		return this._reader.read( this.file )
			.then( data => {
				this.status = 'idle';

				return data;
			} )
			.catch( err => {
				if ( err === 'aborted' ) {
					this.status = 'aborted';
					throw 'aborted';
				}

				this.status = 'error';
				throw this._reader.error;
			} );
	}

	/**
	 * Reads file using the provided {@link module:upload/filerepository~UploadAdapter}.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `filerepository-upload-wrong-status` when status
	 * is different than `idle`.
	 * Example usage:
	 *
	 *	fileLoader.upload()
	 *		.then( data => { ... } )
	 *		.catch( e => {
	 *			if ( e === 'aborted' ) {
	 *				console.log( 'Uploading aborted.' );
	 *			} else {
	 *				console.log( 'Uploading error.', e );
	 *			}
	 *		} );
	 *
	 * @returns {Promise} Returns promise that will be resolved with response data. Promise will be rejected if error
	 * occurs or if read process is aborted.
	 */
	upload() {
		if ( this.status != 'idle' ) {
			throw new CKEditorError( 'filerepository-upload-wrong-status: You cannot call upload if the status is different than idle.' );
		}

		this.status = 'uploading';

		return this._adapter.upload()
			.then( data => {
				this.uploadResponse = data;
				this.status = 'idle';

				return data;
			} )
			.catch( err => {
				if ( this.status === 'aborted' ) {
					throw 'aborted';
				}

				this.status = 'error';
				throw err;
			} );
	}

	/**
	 * Aborts loading process.
	 */
	abort() {
		const status = this.status;
		this.status = 'aborted';

		if ( status == 'reading' ) {
			this._reader.abort();
		}

		if ( status == 'uploading' && this._adapter.abort ) {
			this._adapter.abort();
		}

		this._destroy();
	}

	/**
	 * Performs cleanup.
	 *
	 * @private
	 */
	_destroy() {
		this._reader = undefined;
		this._adapter = undefined;
		this.data = undefined;
		this.uploadResponse = undefined;
		this.file = undefined;
	}
}

mix( FileLoader, ObservableMixin );

/**
 * Upload adapter interface used by FileRepository to handle file upload. Upload adapter is a bridge between the editor and server that
 * handles file uploads. It should contain logic necessary to initiate upload process and monitor its progress.
 *
 * It should implement two methods:
 *
 * * {@link module:upload/filerepository~UploadAdapter#upload `upload()`},
 * * {@link module:upload/filerepository~UploadAdapter#abort `abort()`}.
 *
 * Example upload adapter implementation:
 *
 *		class UploadAdapter {
 *			constructor( loader ) {
 *				// Save Loader instance to update upload progress.
 *				this.loader = loader;
 *			}
 *
 *			upload() {
 *				// Update loader's progress.
 *				server.onUploadProgress( data => {
 *					loader.uploadTotal = data.total;
 *					loader.uploaded = data.uploaded;
 *				} ):
 *
 *				// Return promise that will be resolved when file is uploaded.
 *				return server.upload( loader.file );
 *			}
 *
 *			abort() {
 *				// Reject promise returned from upload() method.
 *				server.abortUpload();
 *			}
 *		}
 *
 * Then upload adapter can be set to be used by {@link module:upload/filerepository~FileRepository FileRepository}:
 *
 *		editor.plugins.get( 'FileRepository' ).createUploadAdapter = function( loader ) {
 *			return new UploadAdapter( loader );
 *		};
 *
 * @interface UploadAdapter
 */

/**
 * Executes the upload process.
 * This method should return a promise that will resolve when data will be uploaded to server. Promise should be
 * resolved with an object containing information about uploaded file:
 *
 *		{
 *			default: 'http://server/default-size.image.png'
 *		}
 *
 * Additionally, other image sizes can be provided:
 *
 *		{
 *			default: 'http://server/default-size.image.png',
 *			'160': 'http://server/size-160.image.png',
 *			'500': 'http://server/size-500.image.png',
 *			'1000': 'http://server/size-1000.image.png',
 *			'1052': 'http://server/default-size.image.png'
 *		}
 *
 * NOTE: When returning multiple images, the widest returned one should equal the default one. It is essential to
 * correctly set `width` attribute of the image. See this discussion:
 * https://github.com/ckeditor/ckeditor5-easy-image/issues/4 for more information.
 *
 * Take a look at {@link module:upload/filerepository~UploadAdapter example Adapter implementation} and
 * {@link module:upload/filerepository~FileRepository#createUploadAdapter createUploadAdapter method}.
 *
 * @method module:upload/filerepository~UploadAdapter#upload
 * @returns {Promise} Promise that should be resolved when data is uploaded.
 */

/**
 * Aborts the upload process.
 * After aborting it should reject promise returned from {@link #upload upload()}.
 *
 * Take a look at {@link module:upload/filerepository~UploadAdapter example Adapter implementation} and
 * {@link module:upload/filerepository~FileRepository#createUploadAdapter createUploadAdapter method}.
 *
 * @method module:upload/filerepository~UploadAdapter#abort
 */
