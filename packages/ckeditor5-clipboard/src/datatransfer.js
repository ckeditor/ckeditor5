/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module clipboard/datatransfer
 */

/**
 * Facade over the native [`DataTransfer`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer) object.
 */
export default class DataTransfer {
	constructor( nativeDataTransfer ) {
		/**
		 * The array of files created from the native `DataTransfer#files` or `DataTransfer#items`.
		 *
		 * @readonly
		 * @member {Array.<File>} #files
		 */
		this.files = getFiles( nativeDataTransfer );

		/**
		 * The native DataTransfer object.
		 *
		 * @private
		 * @member {DataTransfer} #_native
		 */
		this._native = nativeDataTransfer;
	}

	/**
	 * Returns an array of available native content types.
	 *
	 * @returns {Array.<String>}
	 */
	get types() {
		return this._native.types;
	}

	/**
	 * Gets data from the data transfer by its mime type.
	 *
	 *		dataTransfer.getData( 'text/plain' );
	 *
	 * @param {String} type The mime type. E.g. `text/html` or `text/plain`.
	 * @returns {String}
	 */
	getData( type ) {
		return this._native.getData( type );
	}

	/**
	 * Sets data in the data transfer.
	 *
	 * @param {String} type The mime type. E.g. `text/html` or `text/plain`.
	 * @param {String} data
	 */
	setData( type, data ) {
		this._native.setData( type, data );
	}
}

function getFiles( nativeDataTransfer ) {
	// DataTransfer.files and items are Array-like and might not have an iterable interface.
	const files = nativeDataTransfer.files ? Array.from( nativeDataTransfer.files ) : [];
	const items = nativeDataTransfer.items ? Array.from( nativeDataTransfer.items ) : [];

	if ( files.length ) {
		return files;
	}
	// Chrome have empty DataTransfer.files, but let get files through the items interface.
	return items
		.filter( item => item.kind === 'file' )
		.map( item => item.getAsFile() );
}
