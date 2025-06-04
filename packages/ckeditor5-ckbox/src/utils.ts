/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ckbox/utils
 */

import type { InitializedToken } from '@ckeditor/ckeditor5-cloud-services';
import type { CKBoxImageUrls } from './ckboxconfig.js';

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
	const workspaces = payload.auth?.ckbox?.workspaces || [ payload.aud ];

	if ( !defaultWorkspaceId ) {
		return workspaces[ 0 ];
	}

	if ( payload.auth?.ckbox?.role == 'superadmin' || workspaces.includes( defaultWorkspaceId ) ) {
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
	} catch {
		return undefined;
	}
}

/**
 * Sends the HTTP request.
 *
 * @internal
 * @param options Configuration options
 * @param options.url The URL where the request will be sent.
 * @param options.signal The AbortSignal to abort the request when needed.
 * @param options.authorization The authorization token for the request.
 * @param options.method The HTTP method (default: 'GET').
 * @param options.data Additional data to send.
 * @param options.onUploadProgress A callback informing about the upload progress.
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

const MIME_TO_EXTENSION: Record<string, string> = {
	'image/gif': 'gif',
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/bmp': 'bmp',
	'image/tiff': 'tiff'
};

/**
 * Returns an extension a typical file in the specified `mimeType` format would have.
 */
export function convertMimeTypeToExtension( mimeType: string ): string {
	return MIME_TO_EXTENSION[ mimeType ];
}

/**
 * Tries to fetch the given `url` and returns 'content-type' of the response.
 */
export async function getContentTypeOfUrl( url: string, options: { signal: AbortSignal } ): Promise<string> {
	try {
		const response = await fetch( url, {
			method: 'HEAD',
			cache: 'force-cache',
			...options
		} );

		if ( !response.ok ) {
			return '';
		}

		return response.headers.get( 'content-type' ) || '';
	} catch {
		return '';
	}
}

/**
 * Returns an extension from the given value.
 */
export function getFileExtension( file: File ): string {
	const fileName = file.name;
	const extensionRegExp = /\.(?<ext>[^.]+)$/;
	const match = fileName.match( extensionRegExp );

	return match!.groups!.ext.toLowerCase();
}
