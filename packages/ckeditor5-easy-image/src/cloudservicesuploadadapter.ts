/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
* @module easy-image/cloudservicesuploadadapter
*/

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
import { FileRepository, type FileLoader } from 'ckeditor5/src/upload';
import type { UploadGateway, FileUploader, CloudServices, CloudServicesCore } from '@ckeditor/ckeditor5-cloud-services';

/**
 * A plugin that enables upload to [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/).
 *
 * It is mainly used by the {@link module:easy-image/easyimage~EasyImage} feature.
 *
 * After enabling this adapter you need to configure the CKEditor Cloud Services integration through
 * {@link module:cloud-services/cloudservices~CloudServicesConfig `config.cloudServices`}.
 */
export default class CloudServicesUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CloudServicesUploadAdapter' {
		return 'CloudServicesUploadAdapter';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ 'CloudServices', FileRepository ];
	}

	private _uploadGateway?: UploadGateway;

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		const cloudServices = editor.plugins.get( 'CloudServices' ) as CloudServices;

		const token = cloudServices.token;
		const uploadUrl = cloudServices.uploadUrl;

		if ( !token ) {
			return;
		}

		this._uploadGateway = ( editor.plugins.get( 'CloudServicesCore' ) as CloudServicesCore ).createUploadGateway( token, uploadUrl! );

		editor.plugins.get( FileRepository ).createUploadAdapter = loader => {
			return new Adapter( this._uploadGateway!, loader );
		};
	}
}

/**
 * @private
 */
class Adapter {
	private uploadGateway: UploadGateway;
	private loader: FileLoader;
	private fileUploader?: FileUploader;

	constructor( uploadGateway: UploadGateway, loader: FileLoader ) {
		this.uploadGateway = uploadGateway;

		this.loader = loader;
	}

	public upload() {
		return this.loader.file.then( file => {
			this.fileUploader = this.uploadGateway.upload( file! );

			this.fileUploader.on( 'progress', ( evt, data ) => {
				this.loader.uploadTotal = data.total;
				this.loader.uploaded = data.uploaded;
			} );

			return this.fileUploader.send();
		} );
	}

	public abort() {
		this.fileUploader?.abort();
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ CloudServicesUploadAdapter.pluginName ]: CloudServicesUploadAdapter;
	}
}
