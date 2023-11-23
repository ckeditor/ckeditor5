/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals AbortController, FormData, URL, window */

/**
 * @module ckbox/ckboxuploadadapter
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import {
	FileRepository,
	type FileLoader,
	type UploadAdapter,
	type UploadResponse
} from 'ckeditor5/src/upload';

import type { InitializedToken } from '@ckeditor/ckeditor5-cloud-services';
import type { ImageUploadCompleteEvent, ImageUploadEditing } from '@ckeditor/ckeditor5-image';

import { logError } from 'ckeditor5/src/utils';
import CKBoxEditing from './ckboxediting';
import {
	getAvailableCategories,
	getImageUrls,
	getWorkspaceId,
	sendHttpRequest,
	getCategoryIdForFile,
	type AvailableCategory
} from './utils';

/**
 * A plugin that enables file uploads in CKEditor 5 using the CKBox server–side connector.
 * See the {@glink features/file-management/ckbox CKBox file manager integration} guide to learn how to configure
 * and use this feature as well as find out more about the full integration with the file manager
 * provided by the {@link module:ckbox/ckbox~CKBox} plugin.
 *
 * Check out the {@glink features/images/image-upload/image-upload Image upload overview} guide to learn about
 * other ways to upload images into CKEditor 5.
 */
export default class CKBoxUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ 'ImageUploadEditing', 'ImageUploadProgress', FileRepository, CKBoxEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKBoxUploadAdapter' as const;
	}

	/**
	 * @inheritDoc
	 */
	public async afterInit(): Promise<void> {
		const editor = this.editor;

		const hasConfiguration = !!editor.config.get( 'ckbox' );
		const isLibraryLoaded = !!window.CKBox;

		// Editor supports only one upload adapter. Register the CKBox upload adapter (and potentially overwrite other one) only when the
		// integrator intentionally wants to use the CKBox plugin, i.e. when the `config.ckbox` exists or the CKBox JavaScript library is
		// loaded.
		if ( !hasConfiguration && !isLibraryLoaded ) {
			return;
		}

		const fileRepository = editor.plugins.get( FileRepository );
		const ckboxEditing = editor.plugins.get( CKBoxEditing );

		fileRepository.createUploadAdapter = loader => {
			return new Adapter( loader, ckboxEditing.getToken(), editor );
		};

		const shouldInsertDataId = !editor.config.get( 'ckbox.ignoreDataId' );
		const imageUploadEditing: ImageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );

		// Mark uploaded assets with the `ckboxImageId` attribute. Its value represents an ID in CKBox.
		if ( shouldInsertDataId ) {
			imageUploadEditing.on<ImageUploadCompleteEvent>( 'uploadComplete', ( evt, { imageElement, data } ) => {
				editor.model.change( writer => {
					writer.setAttribute( 'ckboxImageId', data.ckboxImageId, imageElement );
				} );
			} );
		}
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
	 * The base URL where all requests should be sent.
	 */
	public serviceOrigin: string;

	/**
	 * Creates a new adapter instance.
	 */
	constructor( loader: FileLoader, token: InitializedToken, editor: Editor ) {
		this.loader = loader;
		this.token = token;
		this.editor = editor;
		this.controller = new AbortController();

		this.serviceOrigin = editor.config.get( 'ckbox.serviceOrigin' )!;
	}

	/**
	 * The ID of workspace to use.
	 */
	public getWorkspaceId(): string {
		const t = this.editor.t;
		const cannotAccessDefaultWorkspaceError = t( 'Cannot access default workspace.' );
		const defaultWorkspaceId = this.editor.config.get( 'ckbox.defaultUploadWorkspaceId' );
		const workspaceId = getWorkspaceId( this.token, defaultWorkspaceId );

		if ( workspaceId == null ) {
			/**
			 * The user is not authorized to access the workspace defined in  the`ckbox.defaultUploadWorkspaceId` configuration.
			 *
			 * @error ckbox-access-default-workspace-error
			 */
			logError( 'ckbox-access-default-workspace-error' );

			throw cannotAccessDefaultWorkspaceError;
		}

		return workspaceId;
	}

	/**
	 * Resolves a promise with an array containing available categories with which the uploaded file can be associated.
	 *
	 * If the API returns limited results, the method will collect all items.
	 */
	public async getAvailableCategories( offset: number = 0 ): Promise<Array<AvailableCategory> | null> {
		return getAvailableCategories( {
			token: this.token,
			serviceOrigin: this.serviceOrigin,
			workspaceId: this.getWorkspaceId(),
			signal: this.controller.signal,
			offset
		} );
	}

	/**
	 * Resolves a promise with an object containing a category with which the uploaded file is associated or an error code.
	 */
	public async getCategoryIdForFile( file: File ): Promise<string | null> {
		// The plugin allows defining to which category the uploaded file should be assigned.
		const defaultCategories = this.editor.config.get( 'ckbox.defaultUploadCategories' );

		return getCategoryIdForFile( file, {
			token: this.token,
			serviceOrigin: this.serviceOrigin,
			workspaceId: this.getWorkspaceId(),
			signal: this.controller.signal,
			defaultCategories
		} );
	}

	/**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 */
	public async upload(): Promise<UploadResponse> {
		const t = this.editor.t;
		const cannotFindCategoryError = t( 'Cannot determine a category for the uploaded file.' );
		const file = ( await this.loader.file )!;
		const category = await this.getCategoryIdForFile( file );

		if ( !category ) {
			return Promise.reject( cannotFindCategoryError );
		}

		const uploadUrl = new URL( 'assets', this.serviceOrigin );
		const formData = new FormData();

		uploadUrl.searchParams.set( 'workspaceId', this.getWorkspaceId() );

		formData.append( 'categoryId', category );
		formData.append( 'file', file );

		const requestConfig = {
			method: 'POST',
			url: uploadUrl,
			data: formData,
			onUploadProgress: ( evt: ProgressEvent ) => {
				/* istanbul ignore else -- @preserve */
				if ( evt.lengthComputable ) {
					this.loader.uploadTotal = evt.total;
					this.loader.uploaded = evt.loaded;
				}
			},
			signal: this.controller.signal,
			authorization: this.token.value
		} as const;

		return sendHttpRequest( requestConfig )
			.then( async data => {
				const imageUrls = getImageUrls( data.imageUrls );

				return {
					ckboxImageId: data.id,
					default: imageUrls.imageFallbackUrl,
					sources: imageUrls.imageSources
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
