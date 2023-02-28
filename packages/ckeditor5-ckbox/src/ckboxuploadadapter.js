/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals AbortController, FormData, URL, Image, XMLHttpRequest, window */

/**
 * @module ckbox/ckboxuploadadapter
 */

import { Plugin } from 'ckeditor5/src/core';
import { FileRepository } from 'ckeditor5/src/upload';
import { logError } from 'ckeditor5/src/utils';
import CKBoxEditing from './ckboxediting';
import { getImageUrls } from './utils';

/**
 * A plugin that enables file uploads in CKEditor 5 using the CKBox server–side connector.
 * See the {@glink features/file-management/ckbox CKBox file manager integration} guide to learn how to configure
 * and use this feature as well as find out more about the full integration with the file manager
 * provided by the {@link module:ckbox/ckbox~CKBox} plugin.
 *
 * Check out the {@glink features/images/image-upload/image-upload Image upload overview} guide to learn about
 * other ways to upload images into CKEditor 5.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CKBoxUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ 'ImageUploadEditing', 'ImageUploadProgress', FileRepository, CKBoxEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CKBoxUploadAdapter';
	}

	/**
	 * @inheritDoc
	 */
	async afterInit() {
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
		const imageUploadEditing = editor.plugins.get( 'ImageUploadEditing' );

		// Mark uploaded assets with the `ckboxImageId` attribute. Its value represents an ID in CKBox.
		if ( shouldInsertDataId ) {
			imageUploadEditing.on( 'uploadComplete', ( evt, { imageElement, data } ) => {
				editor.model.change( writer => {
					writer.setAttribute( 'ckboxImageId', data.ckboxImageId, imageElement );
				} );
			} );
		}
	}
}

/**
 * Upload adapter for CKBox.
 *
 * @private
 * @implements module:upload/filerepository~UploadAdapter
 */
class Adapter {
	/**
	 * Creates a new adapter instance.
	 *
	 * @param {module:upload/filerepository~FileLoader} loader
	 * @param {module:cloud-services/token~Token} token
	 * @param {module:core/editor/editor~Editor} editor
	 */
	constructor( loader, token, editor ) {
		/**
		 * FileLoader instance to use during the upload.
		 *
		 * @member {module:upload/filerepository~FileLoader} #loader
		 */
		this.loader = loader;

		/**
		 * CKEditor Cloud Services access token.
		 *
		 * @member {module:cloud-services/token~Token} #token
		 */
		this.token = token;

		/**
		 * The editor instance.
		 *
		 * @member {module:core/editor/editor~Editor} #editor
		 */
		this.editor = editor;

		/**
		 * The abort controller for aborting asynchronous processes.
		 *
		 * @member {AbortController} #controller
		 */
		this.controller = new AbortController();

		/**
		 * The base URL where all requests should be sent.
		 *
		 * @member {String} #serviceOrigin
		 */
		this.serviceOrigin = editor.config.get( 'ckbox.serviceOrigin' );

		/**
		 * The base URL from where all assets are served.
		 *
		 * @member {String} #assetsOrigin
		 */
		this.assetsOrigin = editor.config.get( 'ckbox.assetsOrigin' );
	}

	/**
	 * Resolves a promise with an array containing available categories with which the uploaded file can be associated.
	 *
	 * If the API returns limited results, the method will collect all items.
	 *
	 * @param {Number} [offset=0]
	 * @returns {Promise.<Array>}
	 */
	async getAvailableCategories( offset = 0 ) {
		const ITEMS_PER_REQUEST = 50;
		const categoryUrl = new URL( 'categories', this.serviceOrigin );

		categoryUrl.searchParams.set( 'limit', ITEMS_PER_REQUEST.toString() );
		categoryUrl.searchParams.set( 'offset', offset.toString() );

		return this._sendHttpRequest( { url: categoryUrl } )
			.then( async data => {
				const remainingItems = data.totalCount - ( offset + ITEMS_PER_REQUEST );

				if ( remainingItems > 0 ) {
					const offsetItems = await this.getAvailableCategories( offset + ITEMS_PER_REQUEST );

					return [
						...data.items,
						...offsetItems
					];
				}

				return data.items;
			} )
			.catch( () => {
				this.controller.signal.throwIfAborted();

				/**
				 * Fetching a list of available categories with which an uploaded file can be associated failed.
				 *
				 * @error ckbox-fetch-category-http-error
				 */
				logError( 'ckbox-fetch-category-http-error' );
			} );
	}

	/**
	 * Resolves a promise with an object containing a category with which the uploaded file is associated or an error code.
	 *
	 * @param {File} file
	 * @return {Promise.<String|null>}
	 */
	async getCategoryIdForFile( file ) {
		const extension = getFileExtension( file.name );
		const allCategories = await this.getAvailableCategories();

		// Couldn't fetch all categories. Perhaps the authorization token is invalid.
		if ( !allCategories ) {
			return null;
		}

		// The plugin allows defining to which category the uploaded file should be assigned.
		const defaultCategories = this.editor.config.get( 'ckbox.defaultUploadCategories' );

		// If a user specifies the plugin configuration, find the first category that accepts the uploaded file.
		if ( defaultCategories ) {
			const userCategory = Object.keys( defaultCategories ).find( category => {
				return defaultCategories[ category ].includes( extension );
			} );

			// If found, return its ID if the category exists on the server side.
			if ( userCategory ) {
				const serverCategory = allCategories.find( category => category.id === userCategory || category.name === userCategory );

				if ( !serverCategory ) {
					return null;
				}

				return serverCategory.id;
			}
		}

		// Otherwise, find the first category that accepts the uploaded file and returns its ID.
		const category = allCategories.find( category => category.extensions.includes( extension ) );

		if ( !category ) {
			return null;
		}

		return category.id;
	}

	/**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 * @returns {Promise.<Object>}
	 */
	async upload() {
		const t = this.editor.t;
		const cannotFindCategoryError = t( 'Cannot determine a category for the uploaded file.' );
		const file = await this.loader.file;
		const category = await this.getCategoryIdForFile( file );

		if ( !category ) {
			return Promise.reject( cannotFindCategoryError );
		}

		const uploadUrl = new URL( 'assets', this.serviceOrigin );
		const formData = new FormData();

		formData.append( 'categoryId', category );
		formData.append( 'file', file );

		const requestConfig = {
			method: 'POST',
			url: uploadUrl,
			data: formData,
			onUploadProgress: evt => {
				/* istanbul ignore else */
				if ( evt.lengthComputable ) {
					this.loader.uploadTotal = evt.total;
					this.loader.uploaded = evt.loaded;
				}
			}
		};

		return this._sendHttpRequest( requestConfig )
			.then( async data => {
				const width = await this._getImageWidth();
				const extension = getFileExtension( file.name );
				const imageUrls = getImageUrls( {
					token: this.token,
					id: data.id,
					origin: this.assetsOrigin,
					width,
					extension
				} );

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
	abort() {
		this.controller.abort();
	}

	/**
	 * Sends the HTTP request.
	 *
	 * @protected
	 * @param {URL} config.url the URL where the request will be sent.
	 * @param {'GET'|'POST'} [config.method='GET'] The HTTP method.
	 * @param {FormData|null} [config.data] Additional data to send.
	 * @param {Function} [config.onUploadProgress] A callback informing about the upload progress.
	 * @returns {Promise}
	 */
	_sendHttpRequest( config ) {
		const { url, data, onUploadProgress } = config;
		const method = config.method || 'GET';
		const signal = this.controller.signal;

		const xhr = new XMLHttpRequest();
		xhr.open( method, url.toString(), true );
		xhr.setRequestHeader( 'Authorization', this.token.value );
		xhr.setRequestHeader( 'CKBox-Version', 'CKEditor 5' );
		xhr.responseType = 'json';

		// The callback is attached to the `signal#abort` event.
		const abortCallback = () => {
			xhr.abort();
		};

		return new Promise( ( resolve, reject ) => {
			signal.addEventListener( 'abort', abortCallback );

			xhr.addEventListener( 'loadstart', () => {
				signal.addEventListener( 'abort', abortCallback );
			} );

			xhr.addEventListener( 'loadend', () => {
				signal.removeEventListener( 'abort', abortCallback );
			} );

			xhr.addEventListener( 'error', () => {
				reject();
			} );

			xhr.addEventListener( 'abort', () => {
				reject();
			} );

			xhr.addEventListener( 'load', async () => {
				const response = xhr.response;

				if ( !response || response.statusCode >= 400 ) {
					return reject( response && response.message );
				}

				return resolve( response );
			} );

			/* istanbul ignore else */
			if ( onUploadProgress ) {
				xhr.upload.addEventListener( 'progress', evt => {
					onUploadProgress( evt );
				} );
			}

			// Send the request.
			xhr.send( data );
		} );
	}

	/**
	 * Resolves a promise with a number representing the width of a given image file.
	 *
	 * @protected
	 * @returns {Promise.<Number>}
	 */
	_getImageWidth() {
		return new Promise( resolve => {
			const image = new Image();

			image.onload = () => {
				// Let the browser know that it should not keep the reference any longer to avoid memory leeks.
				URL.revokeObjectURL( image.src );

				resolve( image.width );
			};

			image.src = this.loader.data;
		} );
	}
}

// Returns an extension from the given value.
//
// @private
// @param {String} value
// @returns {String}
function getFileExtension( value ) {
	const extensionRegExp = /\.(?<ext>[^.]+)$/;
	const match = value.match( extensionRegExp );

	return match.groups.ext;
}
