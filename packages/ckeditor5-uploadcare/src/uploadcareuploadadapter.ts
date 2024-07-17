/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals AbortController */

/**
 * @module uploadcare/uploadcareuploadadapter
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import {
	FileRepository,
	type FileLoader,
	type UploadAdapter,
	type UploadResponse
} from 'ckeditor5/src/upload.js';

import type { InitializedToken } from '@ckeditor/ckeditor5-cloud-services';

import { uploadFile, type UploadcareFile } from '@uploadcare/upload-client';

import UploadcareEditing from './uploadcareediting.js';

/**
 * A plugin that enables file uploads in CKEditor 5 using the Uploadcare server–side connector.
 *
 * Check out the {@glink features/images/image-upload/image-upload Image upload overview} guide to learn about
 * other ways to upload images into CKEditor 5.
 */
export default class UploadcareUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FileRepository, UploadcareEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UploadcareUploadAdapter' as const;
	}

	/**
	 * @inheritDoc
	 */
	public async afterInit(): Promise<void> {
		const editor = this.editor;

		const hasConfiguration = !!editor.config.get( 'uploadcare' );

		// Editor supports only one upload adapter. Register the Uploadcare upload adapter (and potentially overwrite other one) only when
		// the integrator intentionally wants to use the Uploadcare plugin, i.e. when the `config.uploadcare` exists.
		if ( !hasConfiguration ) {
			return;
		}

		const fileRepository = editor.plugins.get( FileRepository );

		fileRepository.createUploadAdapter = loader => new Adapter( loader, editor );
	}
}

/**
 * Upload adapter for CKBox.
 */
class Adapter implements UploadAdapter {
	/**
	 * FileLoader instance to use during the upload.
	 */
	public loader: FileLoader;

	/**
	 * CKEditor Cloud Services access token.
	 */
	public token: InitializedToken;

	/**
	 * The editor instance.
	 */
	public editor: Editor;

	/**
	 * The abort controller for aborting asynchronous processes.
	 */
	public controller: AbortController;

	/**
	 * Creates a new adapter instance.
	 */
	constructor( loader: FileLoader, editor: Editor ) {
		this.loader = loader;
		this.editor = editor;
		this.controller = new AbortController();
	}

	/**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 */
	public async upload(): Promise<UploadResponse> {
		const t = this.editor.t;
		const file = ( await this.loader.file )!;

		return uploadFile( file, {
			publicKey: '532fdaa30fa803cef431',
			store: 'auto',
			signal: this.controller.signal
		} )
			.then( async ( data: UploadcareFile ) => {
				return {
					uploadcareImageId: data.uuid,
					default: data.cdnUrl
				};
			} )
			.catch( () => {
				const genericError = t( 'Cannot upload file:' ) + ` ${ file.name }.`;

				return Promise.reject( genericError );
			} );
	}

	/**
	 * Aborts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#abort
	 */
	public abort(): void {
		this.controller.abort();
	}
}
