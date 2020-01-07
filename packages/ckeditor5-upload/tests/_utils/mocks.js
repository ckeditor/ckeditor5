/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * Returns object that mocks native File object.
 */
export const createNativeFileMock = () => ( {
	type: 'image/jpeg',
	size: 1024
} );

/**
 * AdapterMock class.
 * Simulates adapter behaviour without any server-side communications.
 */
export class UploadAdapterMock {
	constructor( loader ) {
		this.loader = loader;
	}

	/**
	 * Starts mocked upload process.
	 *
	 * @returns {Promise}
	 */
	upload() {
		return new Promise( ( resolve, reject ) => {
			this._resolveCallback = resolve;
			this._rejectCallback = reject;

			if ( this.uploadStartedCallback ) {
				this.uploadStartedCallback();
			}
		} );
	}

	/**
	 * Aborts reading.
	 */
	abort() {
		this._rejectCallback( 'aborted' );
	}

	/**
	 * Allows to mock error during file upload.
	 *
	 * @param { Object } error
	 */
	mockError( error ) {
		this._rejectCallback( error );
	}

	/**
	 * Allows to mock file upload success.
	 *
	 * @param { Object } data Mock data returned from server passed to resolved promise.
	 */
	mockSuccess( data ) {
		this._resolveCallback( data );
	}

	/**
	 * Allows to mock file upload progress.
	 *
	 * @param {Number} uploaded Bytes uploaded.
	 * @param {Number} total Total bytes to upload.
	 */
	mockProgress( uploaded, total ) {
		this.loader.uploaded = uploaded;
		this.loader.uploadTotal = total;
	}
}

/**
 * NativeFileReaderMock class.
 * Simulates FileReader behaviour.
 */
export class NativeFileReaderMock {
	/**
	 * Mock method used to initialize reading.
	 */
	readAsDataURL() {}

	/**
	 * Aborts reading process.
	 */
	abort() {
		this.onabort();
	}

	/**
	 * Allows to mock file reading success.
	 * @param {*} result File reading result.
	 */
	mockSuccess( result ) {
		this.result = result;
		this.onload();
	}

	/**
	 * Allows to mock error during file read.
	 *
	 * @param { Object } error
	 */
	mockError( error ) {
		this.error = error;
		this.onerror();
	}

	/**
	 * Allows to mock file upload progress.
	 */
	mockProgress( progress ) {
		this.onprogress( { loaded: progress } );
	}
}

export class UploadAdapterPluginMock extends Plugin {
	init() {
		const fileRepository = this.editor.plugins.get( 'FileRepository' );

		fileRepository.createUploadAdapter = () => {};
	}
}
