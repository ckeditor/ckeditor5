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

/**
 * A plugin which enables upload to Cloud Services.
 *
 * It is mainly used by the {@link module:easy-image/easyimage~EasyImage} feature.
 *
 * After enabling this adapter you need to configure the Cloud Services integration through
 * {@link module:easy-image/cloudservicesuploadadapter~CloudServicesAdapterConfig `config.cloudServices`}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CloudServicesUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FileRepository ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const config = editor.config;

		config.define( 'cloudServices.uploadUrl', 'https://files.cke-cs.com/upload/' );

		const token = config.get( 'cloudServices.token' );
		const uploadUrl = config.get( 'cloudServices.uploadUrl' );

		if ( !token || !uploadUrl ) {
			return;
		}

		this._uploadGateway = new CloudServicesUploadAdapter._UploadGateway( token, uploadUrl );

		editor.plugins.get( FileRepository ).createAdapter = loader => {
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

/**
 * The configuration of the {@link module:easy-image/cloudservicesuploadadapter~CloudServicesUploadAdapter Cloud Services upload adapter}.
 *
 * It is used mainly by the {@link module:easy-image/easyimage~EasyImage} feature.
 *
 * Read more in {@link module:easy-image/cloudservicesuploadadapter~CloudServicesAdapterConfig}.
 *
 * @member {module:easy-image/cloudservicesuploadadapter~CloudServicesAdapterConfig}
 *         module:core/editor/editorconfig~EditorConfig#cloudServices
 */

/**
 * The configuration of the {@link module:easy-image/cloudservicesuploadadapter~CloudServicesUploadAdapter Cloud Services upload adapter}.
 *
 * It is used mainly by the {@link module:easy-image/easyimage~EasyImage} feature.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				cloudServices: {
 *					token: '...'
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface CloudServicesAdapterConfig
 */

/**
 * The URL to which the files should be uploaded.
 *
 * @member {String} [module:easy-image/cloudservicesuploadadapter~CloudServicesAdapterConfig#uploadUrl='https://files.cke-cs.com/upload/']
 */

/**
 * The token to the Cloud Services application. You can obtain it from the token service.
 *
 * @member {String} module:easy-image/cloudservicesuploadadapter~CloudServicesAdapterConfig#token
 */
