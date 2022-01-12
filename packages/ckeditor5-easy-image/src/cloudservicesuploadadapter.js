/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
* @module easy-image/cloudservicesuploadadapter
*/

import { Plugin } from 'ckeditor5/src/core';
import { FileRepository } from 'ckeditor5/src/upload';

/**
 * A plugin that enables upload to [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/).
 *
 * It is mainly used by the {@link module:easy-image/easyimage~EasyImage} feature.
 *
 * After enabling this adapter you need to configure the CKEditor Cloud Services integration through
 * {@link module:cloud-services/cloudservices~CloudServicesConfig `config.cloudServices`}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CloudServicesUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CloudServicesUploadAdapter';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ 'CloudServices', FileRepository ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		const cloudServices = editor.plugins.get( 'CloudServices' );

		const token = cloudServices.token;
		const uploadUrl = cloudServices.uploadUrl;

		if ( !token ) {
			return;
		}

		this._uploadGateway = editor.plugins.get( 'CloudServicesCore' ).createUploadGateway( token, uploadUrl );

		editor.plugins.get( FileRepository ).createUploadAdapter = loader => {
			return new Adapter( this._uploadGateway, loader );
		};
	}
}

/**
 * @private
 */
class Adapter {
	constructor( uploadGateway, loader ) {
		this.uploadGateway = uploadGateway;

		this.loader = loader;
	}

	upload() {
		return this.loader.file.then( file => {
			this.fileUploader = this.uploadGateway.upload( file );

			this.fileUploader.on( 'progress', ( evt, data ) => {
				this.loader.uploadTotal = data.total;
				this.loader.uploaded = data.uploaded;
			} );

			return this.fileUploader.send();
		} );
	}

	abort() {
		this.fileUploader.abort();
	}
}

