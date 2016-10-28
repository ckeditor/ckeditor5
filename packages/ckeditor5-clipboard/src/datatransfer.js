/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Facade over the native [`DataTransfer`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer) object.
 *
 * @memberOf clipboard
 */
export default class DataTransfer {
	constructor( nativeDataTransfer ) {
		/**
		 * The native DataTransfer object.
		 *
		 * @private
		 * @member {DataTransfer} clipboard.DataTransfer#_native
		 */
		this._native = nativeDataTransfer;
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
}
