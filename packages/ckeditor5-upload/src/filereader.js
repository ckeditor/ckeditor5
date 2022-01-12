/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module upload/filereader
 */

/* globals window */

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Wrapper over the native `FileReader`.
 */
export default class FileReader {
	/**
	 * Creates an instance of the FileReader.
	 */
	constructor() {
		const reader = new window.FileReader();

		/**
		 * Instance of native FileReader.
		 *
		 * @private
		 * @member {FileReader} #_reader
		 */
		this._reader = reader;

		this._data = undefined;

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
	 * Holds the data of an already loaded file. The file must be first loaded
	 * by using {@link module:upload/filereader~FileReader#read `read()`}.
	 *
	 * @type {File|undefined}
	 */
	get data() {
		return this._data;
	}

	/**
	 * Reads the provided file.
	 *
	 * @param {File} file Native File object.
	 * @returns {Promise.<String>} Returns a promise that will be resolved with file's content.
	 * The promise will be rejected in case of an error or when the reading process is aborted.
	 */
	read( file ) {
		const reader = this._reader;
		this.total = file.size;

		return new Promise( ( resolve, reject ) => {
			reader.onload = () => {
				const result = reader.result;

				this._data = result;

				resolve( result );
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
