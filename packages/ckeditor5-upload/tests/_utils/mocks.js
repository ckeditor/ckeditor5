/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export const createNativeFileMock = () => ( {
	type: 'image/jpeg',
	size: 1024
} );

export class AdapterMock {
	constructor( loader ) {
		this.loader = loader;
	}

	upload() {
		return new Promise( ( resolve, reject ) => {
			this._resolveCallback = resolve;
			this._rejectCallback = reject;
		} );
	}

	abort() {
		this._rejectCallback( 'aborted' );
	}

	mockError( error ) {
		this._rejectCallback( error );
	}

	mockSuccess( data ) {
		this._resolveCallback( data );
	}

	mockProgress( uploaded, total ) {
		this.loader.uploaded = uploaded;
		this.loader.uploadTotal = total;
	}
}

export class NativeFileReaderMock {
	readAsDataURL() {}

	abort() {
		this.mockAbort();
	}

	mockSuccess( result ) {
		this.result = result;
		this.onload();
	}

	mockError( error ) {
		this.error = error;
		this.onerror();
	}

	mockAbort() {
		this.onabort();
	}

	mockProgress( progress ) {
		this.onprogress( { loaded: progress } );
	}
}

