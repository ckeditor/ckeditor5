/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
* @module easy-image/cloudservicesuploadadapter
*/

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import UploadGateway from '@ckeditor/ckeditor-cloudservices-core/src/uploadgateway/uploadgateway';

export default class CloudServicesUploadAdapter extends Plugin {
	static get requires() {
		return [ FileRepository ];
	}

	init() {
		const editor = this.editor;
		const config = editor.config;

		const token = config.get( 'cloudServices.token' );
		const uploadUrl = config.get( 'cloudServices.uploadUrl' );

		// Application is in offline mode.
		if ( !token || !uploadUrl ) {
			return;
		}

		this._uploadGateway = new CloudServicesUploadAdapter._UploadGateway( token, uploadUrl );

		editor.plugins.get( FileRepository ).createAdapter = loader => {
			return new Adapter( this._uploadGateway, loader );
		};
	}
}

class Adapter {
	constructor( uploadGateway, loader ) {
		this.uploadGateway = uploadGateway;

		this.loader = loader;
	}

	upload() {
		this.fileUploader = this.uploadGateway.upload( this.loader.file );

		this.fileUploader.on( 'progress', ( evt, data ) => {
			this.loader.uploadTotal = data.total;
			this.loader.uploaded = data.uploaded;
		} );

		return this.fileUploader.send();
	}

	abort() {
		this.fileUploader.abort();
	}
}

// Store the API in static property to easily overwrite it in tests.
// Too bad dependency injection does not work in Webpack + ES 6 (const) + Babel.
CloudServicesUploadAdapter._UploadGateway = UploadGateway;
