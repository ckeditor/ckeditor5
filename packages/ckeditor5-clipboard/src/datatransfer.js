/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Facade over the native [`DataTransfer`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer).
 *
 * @memberOf clipboard
 */
export default class DataTransfer {
	constructor( nativeDataTransfer ) {
		/**
		 * @private {DataTransfer}
		 */
		this._native = nativeDataTransfer;
	}

	/**
	 * Gets data from the data transfer by its mime type.
	 *
	 *		dataTransfer.getData( 'text/plain' );
	 *
	 * @param {String} type The mime type. E.g. `text/html` or `text/plain`.
	 */
	getData( type ) {
		return this._native.getData( type );
	}
}
