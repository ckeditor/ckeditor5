/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global atob */

/**
 * @module ckbox/utils
 */

import type { InitializedToken } from '@ckeditor/ckeditor5-cloud-services';
import type { CKBoxImageUrls } from './ckboxconfig';

import { logError } from 'ckeditor5/src/utils';
import { decode } from 'blurhash';

/**
 * Converts image source set provided by the CKBox into an object containing:
 * - responsive URLs for the "webp" image format,
 * - one fallback URL for browsers that do not support the "webp" format.
 */
export function getImageUrls( imageUrls: CKBoxImageUrls ): {
	imageFallbackUrl: string;
	imageSources: Array<{
		srcset: string;
		sizes: string;
		type: string;
	}>;
} {
	const responsiveUrls: Array<string> = [];
	let maxWidth = 0;

	for ( const key in imageUrls ) {
		const width = parseInt( key, 10 );

		if ( !isNaN( width ) ) {
			if ( width > maxWidth ) {
				maxWidth = width;
			}

			responsiveUrls.push( `${ imageUrls[ key ] } ${ key }w` );
		}
	}

	const imageSources = [ {
		srcset: responsiveUrls.join( ',' ),
		sizes: `(max-width: ${ maxWidth }px) 100vw, ${ maxWidth }px`,
		type: 'image/webp'
	} ];

	return {
		imageFallbackUrl: imageUrls.default,
		imageSources
	};
}

/**
 * Returns a workspace id to use for communication with the CKBox service.
 *
 * @param defaultWorkspaceId The default workspace to use taken from editor config.
 */
export function getWorkspaceId( token: InitializedToken, defaultWorkspaceId?: string ): string | null {
	const [ , binaryTokenPayload ] = token.value.split( '.' );
	const payload = JSON.parse( atob( binaryTokenPayload ) );
	const workspaces = ( payload.auth && payload.auth.ckbox && payload.auth.ckbox.workspaces ) || [ payload.aud ];

	if ( !defaultWorkspaceId ) {
		return workspaces[ 0 ];
	}

	const role = payload.auth && payload.auth.ckbox && payload.auth.ckbox.role;

	if ( role == 'superadmin' || workspaces.includes( defaultWorkspaceId ) ) {
		return defaultWorkspaceId;
	}

	return null;
}

/**
 * Default resolution for decoding blurhash values.
 * Relatively small values must be used in order to ensure acceptable performance.
 */
const BLUR_RESOLUTION = 32;

/**
 * Generates an image data URL from its `blurhash` representation.
 */
export function blurHashToDataUrl( hash?: string ): string | undefined {
	if ( !hash ) {
		return;
	}

	try {
		const resolutionInPx = `${ BLUR_RESOLUTION }px`;
		const canvas = document.createElement( 'canvas' );

		canvas.setAttribute( 'width', resolutionInPx );
		canvas.setAttribute( 'height', resolutionInPx );

		const ctx = canvas.getContext( '2d' );

		/* istanbul ignore next -- @preserve */
		if ( !ctx ) {
			return;
		}

		const imageData = ctx.createImageData( BLUR_RESOLUTION, BLUR_RESOLUTION );
		const decoded = decode( hash, BLUR_RESOLUTION, BLUR_RESOLUTION );

		imageData.data.set( decoded );
		ctx.putImageData( imageData, 0, 0 );

		return canvas.toDataURL();
	} catch ( e ) {
		return undefined;
	}
}

/**
 * Sends the HTTP request.
 *
 * @internal
 * @param config.url the URL where the request will be sent.
 * @param config.method The HTTP method.
 * @param config.data Additional data to send.
 * @param config.onUploadProgress A callback informing about the upload progress.
 */
export function sendHttpRequest( {
	url,
	method = 'GET',
	data,
	onUploadProgress,
	signal,
	authorization
}: {
	url: URL;
	signal: AbortSignal;
	authorization: string;
	method?: 'GET' | 'POST';
	data?: FormData | null;
	onUploadProgress?: ( evt: ProgressEvent ) => void;
} ): Promise<any> {
	const xhr = new XMLHttpRequest();

	xhr.open( method, url.toString() );
	xhr.setRequestHeader( 'Authorization', authorization );
	xhr.setRequestHeader( 'CKBox-Version', 'CKEditor 5' );
	xhr.responseType = 'json';

	// The callback is attached to the `signal#abort` event.
	const abortCallback = () => {
		xhr.abort();
	};

	return new Promise<any>( ( resolve, reject ) => {
		signal.throwIfAborted();
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

		xhr.addEventListener( 'load', () => {
			const response = xhr.response;

			if ( !response || response.statusCode >= 400 ) {
				return reject( response && response.message );
			}

			resolve( response );
		} );

		/* istanbul ignore else -- @preserve */
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
 * Resolves a promise with an array containing available categories with which the uploaded file can be associated.
 *
 * If the API returns limited results, the method will collect all items.
 *
 * @internal
 */
export async function getAvailableCategories( options: {
	token: InitializedToken;
	serviceOrigin: string;
	workspaceId: string;
	signal: AbortSignal;
	offset?: number;
} ): Promise<Array<AvailableCategory>> {
	const ITEMS_PER_REQUEST = 50;
	const { token, serviceOrigin, workspaceId, signal, offset = 0 } = options;
	const categoryUrl = new URL( 'categories', serviceOrigin );

	categoryUrl.searchParams.set( 'limit', ITEMS_PER_REQUEST.toString() );
	categoryUrl.searchParams.set( 'offset', offset.toString() );
	categoryUrl.searchParams.set( 'workspaceId', workspaceId );

	return sendHttpRequest( {
		url: categoryUrl,
		signal,
		authorization: token.value
	} )
		.then( async data => {
			const remainingItems = data.totalCount - ( offset + ITEMS_PER_REQUEST );

			if ( remainingItems > 0 ) {
				const offsetItems = await getAvailableCategories( {
					...options,
					offset: offset + ITEMS_PER_REQUEST
				} );

				return [
					...data.items,
					...offsetItems
				];
			}

			return data.items;
		} )
		.catch( () => {
			signal.throwIfAborted();

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
 * @internal
 */
export async function getCategoryIdForFile( fileOrUrl: File | string, options: {
	token: InitializedToken;
	serviceOrigin: string;
	workspaceId: string;
	signal: AbortSignal;
	defaultCategories?: Record<string, Array<string>> | null;
} ): Promise<string | null> {
	const { defaultCategories, signal } = options;

	const allCategoriesPromise = getAvailableCategories( options );

	const extension = typeof fileOrUrl == 'string' ?
		convertMimeTypeToExtension( await getContentTypeOfUrl( fileOrUrl, { signal } ) ) :
		getFileExtension( fileOrUrl );

	const allCategories = await allCategoriesPromise;

	// Couldn't fetch all categories. Perhaps the authorization token is invalid.
	if ( !allCategories ) {
		return null;
	}

	// If a user specifies the plugin configuration, find the first category that accepts the uploaded file.
	if ( defaultCategories ) {
		const userCategory = Object.keys( defaultCategories ).find( category => {
			return defaultCategories[ category ].find( e => e.toLowerCase() == extension );
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
	const category = allCategories.find( category => category.extensions.find( e => e.toLowerCase() == extension ) );

	if ( !category ) {
		return null;
	}

	return category.id;
}

/**
 * @internal
 */
export interface AvailableCategory {
	id: string;
	name: string;
	extensions: Array<string>;
}

const MIME_TO_EXTENSION: Record<string, string> = {
	'image/gif': 'gif',
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/bmp': 'bmp',
	'image/tiff': 'tiff'
};

function convertMimeTypeToExtension( mimeType: string ) {
	const result = MIME_TO_EXTENSION[ mimeType ];

	if ( !result ) {
		throw new Error( 'TODO' );
	}

	return result;
}

/**
 * Gets the Content-Type of the specified url.
 */
async function getContentTypeOfUrl( url: string, options: { signal: AbortSignal } ): Promise<string> {
	const response = await fetch( url, {
		method: 'HEAD',
		cache: 'force-cache',
		...options
	} );

	if ( !response.ok ) {
		throw new Error( `HTTP error. Status: ${ response.status }` );
	}

	return response.headers.get( 'content-type' ) || '';
}

/**
 * Returns an extension from the given value.
 */
function getFileExtension( file: File ) {
	const fileName = file.name;
	const extensionRegExp = /\.(?<ext>[^.]+)$/;
	const match = fileName.match( extensionRegExp );

	return match!.groups!.ext.toLowerCase();
}
