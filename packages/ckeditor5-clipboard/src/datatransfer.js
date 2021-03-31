/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/datatransfer
 */

/**
 * A facade over the native [`DataTransfer`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer) object.
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
	 * Gets the data from the data transfer by its MIME type.
	 *
	 *		dataTransfer.getData( 'text/plain' );
	 *
	 * @param {String} type The MIME type. E.g. `text/html` or `text/plain`.
	 * @returns {String}
	 */
	getData( type ) {
		return this._native.getData( type );
	}

	/**
	 * Sets the data in the data transfer.
	 *
	 * @param {String} type The MIME type. E.g. `text/html` or `text/plain`.
	 * @param {String} data
	 */
	setData( type, data ) {
		this._native.setData( type, data );
	}

	/**
	 * The effect that is allowed for a drag operation.
	 *
	 * @param {String} value
	 */
	set effectAllowed( value ) {
		this._native.effectAllowed = value;
	}

	get effectAllowed() {
		return this._native.effectAllowed;
	}

	/**
	 * The actual drop effect.
	 *
	 * @param {String} value
	 */
	set dropEffect( value ) {
		this._native.dropEffect = value;
	}

	get dropEffect() {
		return this._native.dropEffect;
	}

	/**
	 * Whether the dragging operation was canceled.
	 *
	 * @returns {Boolean}
	 */
	get isCanceled() {
		return this._native.dropEffect == 'none' || !!this._native.mozUserCancelled;
	}
}

function getFiles( nativeDataTransfer ) {
	// DataTransfer.files and items are array-like and might not have an iterable interface.
	const files = nativeDataTransfer.files ? Array.from( nativeDataTransfer.files ) : [];
	const items = nativeDataTransfer.items ? Array.from( nativeDataTransfer.items ) : [];

	if ( files.length ) {
		return files;
	}
	// Chrome has empty DataTransfer.files, but allows getting files through the items interface.
	return items
		.filter( item => item.kind === 'file' )
		.map( item => item.getAsFile() );
}
