/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
* @module easy-image/cloudservicesuploadadapter
*/

import { Plugin } from 'ckeditor5/src/core';
import { FileRepository, type FileLoader, type UploadAdapter } from 'ckeditor5/src/upload';
import type { CloudServicesCore, CloudServices, UploadGateway, FileUploader } from '@ckeditor/ckeditor5-cloud-services';

/**
 * A plugin that enables upload to [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/).
 *
 * It is mainly used by the {@link module:easy-image/easyimage~EasyImage} feature.
 *
 * After enabling this adapter you need to configure the CKEditor Cloud Services integration through
 * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig `config.cloudServices`}.
 */
export default class CloudServicesUploadAdapter extends Plugin {
	private _uploadGateway?: UploadGateway;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CloudServicesUploadAdapter' {
		return 'CloudServicesUploadAdapter';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ 'CloudServices', FileRepository ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		const cloudServices: CloudServices = editor.plugins.get( 'CloudServices' );

		const token = cloudServices.token;
		const uploadUrl = cloudServices.uploadUrl;

		if ( !token ) {
			return;
		}

		const cloudServicesCore: CloudServicesCore = editor.plugins.get( 'CloudServicesCore' );
		this._uploadGateway = cloudServicesCore.createUploadGateway( token, uploadUrl! );

		editor.plugins.get( FileRepository ).createUploadAdapter = loader => {
			return new Adapter( this._uploadGateway!, loader );
		};
	}
}

class Adapter implements UploadAdapter {
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
		this.fileUploader!.abort();
	}
}
