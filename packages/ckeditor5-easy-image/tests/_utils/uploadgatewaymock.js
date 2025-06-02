/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin.js';

export default class UploadGatewayMock {
	constructor( token, uploadUrl ) {
		UploadGatewayMock.lastToken = token;
		UploadGatewayMock.lastUploadUrl = uploadUrl;
	}

	upload() {
		this.lastFileUploader = new FileUploader();

		return this.lastFileUploader;
	}

	resolveLastUpload() {
		this.lastFileUploader._resolve( { default: 'http://image.mock.url/' } );
	}
}

class FileUploader extends /* #__PURE__ */ EmitterMixin() {
	onProgress( callback ) {
		this.on( 'progress', ( event, data ) => callback( data ) );

		return this;
	}

	onError( callback ) {
		this.once( 'error', ( event, data ) => callback( data ) );

		return this;
	}

	send() {
		return new Promise( resolve => {
			this._resolve = resolve;
		} );
	}

	abort() {
		this.aborted = true;
	}
}
