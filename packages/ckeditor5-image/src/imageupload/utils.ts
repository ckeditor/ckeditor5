/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageupload/utils
 */

import type { ViewElement } from 'ckeditor5/src/engine.js';
import { global } from 'ckeditor5/src/utils.js';
import type ImageUtils from '../imageutils.js';

/**
 * Creates a regular expression used to test for image files.
 *
 * ```ts
 * const imageType = createImageTypeRegExp( [ 'png', 'jpeg', 'svg+xml', 'vnd.microsoft.icon' ] );
 *
 * console.log( 'is supported image', imageType.test( file.type ) );
 * ```
 */
export function createImageTypeRegExp( types: Array<string> ): RegExp {
	// Sanitize the MIME type name which may include: "+", "-" or ".".
	const regExpSafeNames = types.map( type => type.replace( '+', '\\+' ) );

	return new RegExp( `^image\\/(${ regExpSafeNames.join( '|' ) })$` );
}

/**
 * Creates a promise that fetches the image local source (Base64 or blob) and resolves with a `File` object.
 *
 * @param image Image whose source to fetch.
 * @returns A promise which resolves when an image source is fetched and converted to a `File` instance.
 * It resolves with a `File` object. If there were any errors during file processing, the promise will be rejected.
 */
export function fetchLocalImage( image: ViewElement ): Promise<File> {
	return new Promise( ( resolve, reject ) => {
		const imageSrc = image.getAttribute( 'src' )!;

		// Fetch works asynchronously and so does not block browser UI when processing data.
		fetch( imageSrc )
			.then( resource => resource.blob() )
			.then( blob => {
				const mimeType = getImageMimeType( blob, imageSrc );
				const ext = mimeType.replace( 'image/', '' );
				const filename = `image.${ ext }`;
				const file = new File( [ blob ], filename, { type: mimeType } );

				resolve( file );
			} )
			.catch( err => {
				// Fetch fails only, if it can't make a request due to a network failure or if anything prevented the request
				// from completing, i.e. the Content Security Policy rules. It is not possible to detect the exact cause of failure,
				// so we are just trying the fallback solution, if general TypeError is thrown.
				return err && err.name === 'TypeError' ?
					convertLocalImageOnCanvas( imageSrc ).then( resolve ).catch( reject ) :
					reject( err );
			} );
	} );
}

/**
 * Checks whether a given node is an image element with a local source (Base64 or blob).
 *
 * @param node The node to check.
 */
export function isLocalImage( imageUtils: ImageUtils, node: ViewElement ): boolean {
	if ( !imageUtils.isInlineImageView( node ) || !node.getAttribute( 'src' ) ) {
		return false;
	}

	return !!node.getAttribute( 'src' )!.match( /^data:image\/\w+;base64,/g ) ||
		!!node.getAttribute( 'src' )!.match( /^blob:/g );
}

/**
 * Extracts an image type based on its blob representation or its source.
 * @param blob Image blob representation.
 * @param src Image `src` attribute value.
 */
function getImageMimeType( blob: Blob, src: string ): string {
	if ( blob.type ) {
		return blob.type;
	} else if ( src.match( /data:(image\/\w+);base64/ ) ) {
		return src.match( /data:(image\/\w+);base64/ )![ 1 ].toLowerCase();
	} else {
		// Fallback to 'jpeg' as common extension.
		return 'image/jpeg';
	}
}

/**
 * Creates a promise that converts the image local source (Base64 or blob) to a blob using canvas and resolves
 * with a `File` object.
 * @param imageSrc Image `src` attribute value.
 * @returns A promise which resolves when an image source is converted to a `File` instance.
 * It resolves with a `File` object. If there were any errors during file processing, the promise will be rejected.
 */
function convertLocalImageOnCanvas( imageSrc: string ): Promise<File> {
	return getBlobFromCanvas( imageSrc ).then( blob => {
		const mimeType = getImageMimeType( blob, imageSrc );
		const ext = mimeType.replace( 'image/', '' );
		const filename = `image.${ ext }`;

		return new File( [ blob ], filename, { type: mimeType } );
	} );
}

/**
 * Creates a promise that resolves with a `Blob` object converted from the image source (Base64 or blob).
 * @param imageSrc Image `src` attribute value.
 */
function getBlobFromCanvas( imageSrc: string ): Promise<Blob> {
	return new Promise( ( resolve, reject ) => {
		const image = global.document.createElement( 'img' );

		image.addEventListener( 'load', () => {
			const canvas = global.document.createElement( 'canvas' );

			canvas.width = image.width;
			canvas.height = image.height;

			const ctx = canvas.getContext( '2d' )!;

			ctx.drawImage( image, 0, 0 );

			canvas.toBlob( blob => blob ? resolve( blob ) : reject() );
		} );

		image.addEventListener( 'error', () => reject() );

		image.src = imageSrc;
	} );
}
