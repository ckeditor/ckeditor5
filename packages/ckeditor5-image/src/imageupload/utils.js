/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/utils
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

/* global File */

/**
 * Creates a regular expression used to test for image files.
 *
 *		const imageType = createImageTypeRegExp( [ 'png', 'jpeg', 'svg+xml', 'vnd.microsoft.icon' ] );
 *
 *		console.log( 'is supported image', imageType.test( file.type ) );
 *
 * @param {Array.<String>} types
 * @returns {RegExp}
 */
export function createImageTypeRegExp( types ) {
	// Sanitize the MIME type name which may include: "+", "-" or ".".
	const regExpSafeNames = types.map( type => type.replace( '+', '\\+' ) );

	return new RegExp( `^image\\/(${ regExpSafeNames.join( '|' ) })$` );
}

/**
 * Creates a promise that converts the image local source (Base64 or blob) to a blob and resolves with a `File` object.
 *
 * @param {module:engine/view/element~Element} image Image whose source to convert.
 * @returns {Promise.<File>} A promise which resolves when an image source is converted to a `File` instance.
 * It resolves with a `File` object. If there were any errors during file processing, the promise will be rejected.
 */
export function createImageFile( image ) {
	const imageSrc = image.getAttribute( 'src' );

	// Conversion to blob works asynchronously, so it does not block browser UI when processing data.
	return getBlobFromImage( imageSrc ).then( blob => {
		const mimeType = getImageMimeType( blob, imageSrc );
		const ext = mimeType.replace( 'image/', '' );
		const filename = `image.${ ext }`;

		return new File( [ blob ], filename, { type: mimeType } );
	} );
}

/**
 * Checks whether a given node is an image element with a local source (Base64 or blob).
 *
 * @param {module:engine/view/node~Node} node The node to check.
 * @returns {Boolean}
 */
export function isLocalImage( node ) {
	if ( !node.is( 'element', 'img' ) || !node.getAttribute( 'src' ) ) {
		return false;
	}

	return node.getAttribute( 'src' ).match( /^data:image\/\w+;base64,/g ) ||
		node.getAttribute( 'src' ).match( /^blob:/g );
}

// Creates a promise that resolves with a `Blob` object converted from the image source (Base64 or blob).
//
// @param {String} imageSrc Image `src` attribute value.
// @returns {Promise.<Blob>}
function getBlobFromImage( imageSrc ) {
	return new Promise( ( resolve, reject ) => {
		const image = global.document.createElement( 'img' );

		image.addEventListener( 'load', () => {
			const canvas = global.document.createElement( 'canvas' );

			canvas.width = image.width;
			canvas.height = image.height;

			const ctx = canvas.getContext( '2d' );

			ctx.drawImage( image, 0, 0 );

			canvas.toBlob( blob => blob ? resolve( blob ) : reject() );
		} );

		image.addEventListener( 'error', reject );

		image.src = imageSrc;
	} );
}

// Extracts an image type based on its blob representation or its source.
//
// @param {String} src Image `src` attribute value.
// @param {Blob} blob Image blob representation.
// @returns {String}
function getImageMimeType( blob, src ) {
	if ( blob.type ) {
		return blob.type;
	} else if ( src.match( /data:(image\/\w+);base64/ ) ) {
		return src.match( /data:(image\/\w+);base64/ )[ 1 ].toLowerCase();
	} else {
		// Fallback to 'jpeg' as common extension.
		return 'image/jpeg';
	}
}
