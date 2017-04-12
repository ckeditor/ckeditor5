/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module upload/filereader
 */

/* globals window */

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * FileReader class - wrapper over native FileReader.
 */
export default class FileReader {
	constructor() {
		const reader = new window.FileReader();

		/**
		 * Instance of native FileReader.
		 *
		 * @private
		 * @member {FileReader} #_reader
		 */
		this._reader = reader;

		/**
		 * Number of bytes loaded.
		 *
		 * @readonly
		 * @observable
		 * @member {Number} #loaded
		 */
		this.set( 'loaded', 0 );

		reader.onprogress = evt => {
			this.loaded = evt.loaded;
		};
	}

	/**
	 * Returns error that occurred during file reading.
	 *
	 * @returns {Error}
	 */
	get error() {
		return this._reader.error;
	}

	/**
	 * Reads provided file.
	 *
	 * @param {File} file Native File object.
	 * @returns {Promise} Returns a promise that will resolve with file's contents. Promise can be rejected in case of
	 * error or when reading process is aborted.
	 */
	read( file ) {
		const reader = this._reader;
		this.total = file.size;

		return new Promise( ( resolve, reject ) => {
			reader.onload = () => {
				resolve( reader.result );
			};

			reader.onerror = () => {
				reject( 'error' );
			};

			reader.onabort = () => {
				reject( 'aborted' );
			};

			this._reader.readAsDataURL( file );
		} );
	}

	/**
	 * Aborts file reader.
	 */
	abort() {
		this._reader.abort();
	}
}

mix( FileReader, ObservableMixin );
