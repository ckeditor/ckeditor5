/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/utils
 */

/* global fetch, File */

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
 * Creates a promise that fetches the image local source (Base64 or blob) and resolves with a `File` object.
 *
 * @param {module:engine/view/element~Element} image Image whose source to fetch.
 * @returns {Promise.<File>} A promise which resolves when an image source is fetched and converted to a `File` instance.
 * It resolves with a `File` object. If there were any errors during file processing, the promise will be rejected.
 */
export function fetchLocalImage( image ) {
	return new Promise( ( resolve, reject ) => {
		const imageSrc = image.getAttribute( 'src' );

		// Fetch works asynchronously and so does not block browser UI when processing data.
		fetch( imageSrc )
			.then( resource => resource.blob() )
			.then( blob => {
				const mimeType = getImageMimeType( blob, imageSrc );
				const ext = mimeType.replace( 'image/', '' );
				const filename = `image.${ ext }`;
				const file = createFileFromBlob( blob, filename, mimeType );

				file ? resolve( file ) : reject();
			} )
			.catch( reject );
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

// Creates a `File` instance from the given `Blob` instance using the specified file name.
//
// @param {Blob} blob The `Blob` instance from which the file will be created.
// @param {String} filename The file name used during the file creation.
// @param {String} mimeType The file MIME type.
// @returns {File|null} The `File` instance created from the given blob or `null` if `File API` is not available.
function createFileFromBlob( blob, filename, mimeType ) {
	try {
		return new File( [ blob ], filename, { type: mimeType } );
	} catch ( err ) {
		// Edge does not support `File` constructor ATM, see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9551546/.
		// However, the `File` function is present (so cannot be checked with `!window.File` or `typeof File === 'function'`), but
		// calling it with `new File( ... )` throws an error. This try-catch prevents that. Also when the function will
		// be implemented correctly in Edge the code will start working without any changes (see #247).
		return null;
	}
}
