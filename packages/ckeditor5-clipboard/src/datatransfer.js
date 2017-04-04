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
		 * The native DataTransfer object.
		 *
		 * @private
		 * @member {DataTransfer} #_native
		 */
		this._native = nativeDataTransfer;

		this.files = Array.from( this.getFiles() );
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

	*_getFiles() {
		// DataTransfer.files and items are Array-like and might not have an iterable interface.
		const files = this._native.files ? Array.from( this._native.files ) : [];
		const items = this._native.items ? Array.from( this._native.items ) : [];

		if ( files.length ) {
			yield* files;
		}
		// // Chrome have empty DataTransfer.files, but let get files through the items interface.
		else {
			for ( const item of items ) {
				if ( item.kind == 'file' ) {
					yield item.getAsFile();
				}
			}
		}
	}

	get types() {
		return this._native.types;
	}
}
