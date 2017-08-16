/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
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
 * FileRepository plugin.
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
		 * Function that should be defined before using FileRepository. It should return new instance of
		 * {@link module:upload/filerepository~Adapter Adapter} that will be used to upload files.
		 * {@link module:upload/filerepository~FileLoader FileLoader} instance associated with the adapter
		 * will be passed to that function.
		 * For more information and example see {@link module:upload/filerepository~Adapter Adapter}.
		 *
		 * @abstract
		 * @function
		 * @name #createAdapter
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
	 * To get loader by id use `fileRepository.loaders.get( id )`.
	 *
	 * @param {File} file Native File object.
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
	 * Creates loader for specified file.
	 * Shows console warning and returns `null` if {@link #createAdapter} method is not defined.
	 *
	 * @param {File} file Native File object.
	 * @returns {module:upload/filerepository~FileLoader|null}
	 */
	createLoader( file ) {
		if ( !this.createAdapter ) {
			log.warn( 'FileRepository: no createAdapter method found. Please define it before creating a loader.' );

			return null;
		}

		const loader = new FileLoader( file );
		loader._adapter = this.createAdapter( loader );

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
	 * Destroys loader.
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
	 * Creates instance of FileLoader.
	 *
	 * @param {File} file
	 * @param {module:upload/filerepository~Adapter} adapter
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
		 * File instance associated with FileLoader.
		 *
		 * @readonly
		 * @member {File}
		 */
		this.file = file;

		/**
		 * Adapter instance associated with FileLoader.
		 *
		 * @private
		 * @member {module:upload/filerepository~Adapter}
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
		 * * 'idle',
		 * * 'reading',
		 * * 'uploading',
		 * * 'aborted',
		 * * 'error'.
		 *
		 * When reading status can change in a following way:
		 * `idle` -> `reading` -> `idle`
		 * `idle` -> `reading -> `aborted`
		 * `idle` -> `reading -> `error`
		 *
		 * When uploading status can change in a following way:
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
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `filerepository-read-wrong-status` when status
	 * is different than `idle`.
	 * Example usage:
	 *
	 *	fileLoader.read()
	 *		.then( data => { ... } )
	 *		.catch( e => {
	 *			if ( e === 'aborted' ) {
	 *				console.log( 'Reading aborted.' );
	 *			} else {
	 *				console.log( 'Reading error.', e );
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
	 * Reads file using provided {@link module:upload/filerepository~Adapter}.
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
 * Adapter interface used by FileRepository to handle file upload. Adapter is a bridge between the editor and server that
 * handles file uploads. It should contain logic necessary to initiate upload process and monitor its progress.
 *
 * It should implement two methods:
 * * {@link module:upload/filerepository~Adapter#upload upload()},
 * * {@link module:upload/filerepository~Adapter#abort abort()}.
 *
 * Example adapter implementation:
 *
 *	class Adapter {
 *		constructor( loader ) {
 *			// Save Loader instance to update upload progress.
 *			this.loader = loader;
 *		}
 *
 *		upload() {
 *			// Update loader's progress.
 *			server.onUploadProgress( data => {
 *				loader.uploadTotal = data.total;
 *				loader.uploaded = data.uploaded;
 *			} ):
 *
 *			// Return promise that will be resolved when file is uploaded.
 *			return server.upload( loader.file );
 *		}
 *
 *		abort() {
 *			// Reject promise returned from upload() method.
 *			server.abortUpload();
 *		}
 *	}
 *
 * Then adapter can be set to be used by {@link module:upload/filerepository~FileRepository FileRepository}:
 *
 *	editor.plugins.get( 'FileRepository' ).createAdapter = function( loader ) {
 *		return new Adapter( loader );
 *	};
 *
 * @interface Adapter
 */

/**
 * Executes the upload process.
 * This method should return a promise that will resolve when data will be uploaded to server. Promise should be
 * resolved with an object containing information about uploaded file:
 *
 *	{
 *		default: 'http://server/default-size.image.png'
 *	}
 *
 * Additionally, other image sizes can be provided:
 *
 *	{
 *		default: 'http://server/default-size.image.png',
 *		'160': 'http://server/size-160.image.png',
 *		'500': 'http://server/size-500.image.png',
 *		'1000': 'http://server/size-1000.image.png'
 *	}
 *
 * Take a look at {@link module:upload/filerepository~Adapter example Adapter implementation} and
 * {@link module:upload/filerepository~FileRepository#createAdapter createAdapter method}.
 *
 * @method module:upload/filerepository~Adapter#upload
 * @returns {Promise} Promise that should be resolved when data is uploaded.
 */

/**
 * Aborts the upload process.
 * After aborting it should reject promise returned from {@link #upload upload()}.
 *
 * Take a look at {@link module:upload/filerepository~Adapter example Adapter implementation} and
 * {@link module:upload/filerepository~FileRepository#createAdapter createAdapter method}.
 *
 * @method module:upload/filerepository~Adapter#abort
 */
