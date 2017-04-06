/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/filerepository
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin.js';
import Collection from '@ckeditor/ckeditor5-utils/src/collection.js';
import mix from '@ckeditor/ckeditor5-utils/src/mix.js';

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
		return 'fileRepository';
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
		 * Function that should be defined before using FileRepository. It should return adapter that will be
		 * used to upload files.
		 *
		 * @member {function} #createAdapter
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
		 * @readonly
		 * @observable
		 * @member {Number} #uploadTotal
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
	 * @param file Native File object.
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
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `filerepository-no-adapter` when
	 * {@link #createAdapter} method is not defined for this FileRepository.
	 *
	 * @param file Native File object.
	 * @returns {module:upload/filerepository~FileLoader}
	 */
	createLoader( file ) {
		if ( !this.createAdapter ) {
			throw new CKEditorError( 'filerepository-no-adapter: No createAdapter method found.' );
		}

		const loader = new FileLoader( file );
		loader._adapter = this.createAdapter( loader );

		this.loaders.add( loader );

		loader.on( 'change:uploaded', () => {
			let agregatedUploaded = 0;

			for ( const loader of this.loaders ) {
				agregatedUploaded += loader.uploaded;
			}

			this.uploaded = agregatedUploaded;
		} );

		loader.on( 'change:uploadTotal', () => {
			let agregatedTotal = 0;

			for ( const loader of this.loaders ) {
				if ( loader.uploadTotal ) {
					agregatedTotal += loader.uploadTotal;
				}
			}

			this.uploadTotal = agregatedTotal;
		} );

		return loader;
	}

	/**
	 * Destroys loader.
	 *
	 * @param {Number|module:upload/filerepository~FileLoader} fileOrIdOrLoader Loader itself, id of the loader or file associated with that loader.
	 */
	destroyLoader( fileOrIdOrLoader ) {
		const loader = fileOrIdOrLoader instanceof FileLoader ? fileOrIdOrLoader : this.getLoader( fileOrIdOrLoader );

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
	 * @param file
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
		 * File instance associated with this FileLoader.
		 *
		 * @readonly
		 * @member
		 */
		this.file = file;

		/**
		 * Adapter instance associated with this FileLoader.
		 *
		 * @readonly
		 * @member {module:upload/filerepository~Adapter}
		 */
		this._adapter = adapter;

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
		this.set( 'uploadedPercent', 0 );

		/**
		 * Response of the upload.
		 *
		 * @readonly
		 * @observable
		 * @member {Object|null} #uploadedPercent
		 */
		this.set( 'uploadReponse', null );
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
		this._reader = new FileReader();

		return this._reader.read( this.file )
			.then( data => {
				if ( this.status === 'aborted' ) {
					throw 'aborted';
				}
				this.status = 'idle';

				return data;
			} )
			.catch( err => {
				if ( this.status != 'aborted' ) {
					this.status = 'error';
				}
				throw err;
			} );
	}

	/**
	 * Reads file using provided {@link module:upload/filereader~Adapter}.
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
				if ( this.status === 'aborted' ) {
					throw 'aborted';
				}
				this.uploadReponse = data;
				this.status = 'idle';

				return data;
			} )
			.catch( err => {
				if ( this.status != 'aborted' ) {
					this.status = 'error';
				}
				throw err;
			} );
	}

	/**
	 * Aborts loading process.
	 */
	abort() {
		if ( this.status == 'loading' ) {
			this._reader.abort();
		}

		if ( this.status == 'uploading' && this._adapter.abort ) {
			this._adapter.abort();
		}

		this.status = 'aborted';
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
		this.uploadReponse = undefined;
		this.file = undefined;
	}
}

mix( FileLoader, ObservableMixin );

/**
 * Adapter abstract class used by FileRepository to handle file upload.
 *
 * @abstract
 * @class Adapter
 */

/**
 * Executes the upload process.
 *
 * @function
 * @name module:upload/filerepository~Adapter#upload
 * @returns {Promise}
 */

/**
 * Aborts the upload process.
 *
 * @function
 * @name module:upload/filerepository~Adapter#abort
 */
