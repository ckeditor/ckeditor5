/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module upload/adapters/base64uploadadapter
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import FileRepository, { type UploadResponse, type FileLoader, type UploadAdapter } from '../filerepository.js';

type DomFileReader = globalThis.FileReader;

/**
 * A plugin that converts images inserted into the editor into [Base64 strings](https://en.wikipedia.org/wiki/Base64)
 * in the {@glink getting-started/setup/getting-and-setting-data editor output}.
 *
 * This kind of image upload does not require server processing – images are stored with the rest of the text and
 * displayed by the web browser without additional requests.
 *
 * Check out the {@glink features/images/image-upload/image-upload comprehensive "Image upload overview"} to learn about
 * other ways to upload images into CKEditor 5.
 */
export default class Base64UploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FileRepository ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Base64UploadAdapter' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this.editor.plugins.get( FileRepository ).createUploadAdapter = loader => new Adapter( loader );
	}
}

/**
 * The upload adapter that converts images inserted into the editor into Base64 strings.
 */
class Adapter implements UploadAdapter {
	/**
	 * `FileLoader` instance to use during the upload.
	 */
	public loader: FileLoader;

	public reader?: DomFileReader;

	/**
	 * Creates a new adapter instance.
	 */
	constructor( loader: FileLoader ) {
		this.loader = loader;
	}

	/**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 */
	public upload(): Promise<UploadResponse> {
		return new Promise( ( resolve, reject ) => {
			const reader = this.reader = new window.FileReader();

			reader.addEventListener( 'load', () => {
				resolve( { default: reader.result } );
			} );

			reader.addEventListener( 'error', err => {
				reject( err );
			} );

			reader.addEventListener( 'abort', () => {
				reject();
			} );

			this.loader.file.then( file => {
				reader.readAsDataURL( file! );
			} );
		} );
	}

	/**
	 * Aborts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#abort
	 */
	public abort(): void {
		this.reader!.abort();
	}
}
