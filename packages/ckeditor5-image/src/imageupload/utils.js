/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imageupload/utils
 */

/* global fetch, File */

/**
 * Checks if a given file is an image.
 *
 * @param {File} file
 * @returns {Boolean}
 */
export function isImageType( file ) {
	const types = /^image\/(jpeg|png|gif|bmp)$/;

	return types.test( file.type );
}

/**
 * Creates a promise which fetches the image local source (base64 or blob) and returns as a `File` object.
 *
 * @param {module:engine/view/element~Element} image Image which source to fetch.
 * @param {Number} index Image index used as image name suffix.
 * @returns {Promise} A promise which resolves when image source is fetched and converted to `File` instance.
 * It resolves with object holding initial image element (as `image`) and its file source (as `file`). If
 * the `file` attribute is null, it means fetching failed.
 */
export function wrapImageToFetch( image, index ) {
	return new Promise( resolve => {
		// Fetch works asynchronously and so does not block browser UI when processing data.
		fetch( image.getAttribute( 'src' ) )
			.then( resource => resource.blob() )
			.then( blob => {
				const ext = getImageFileType( blob, image.getAttribute( 'src' ) );
				const filename = `${ Number( new Date() ) }-image${ index }.${ ext }`;
				const file = createFileFromBlob( blob, filename );

				resolve( { image, file } );
			} )
			.catch( () => {
				// We always resolve a promise so `Promise.all` will not reject if one of many fetch fails.
				resolve( { image, file: null } );
			} );
	} );
}

/**
 * Checks whether given node is an image element with local source (base64 or blob).
 *
 * @param {module:engine/view/node~Node} node Node to check.
 * @returns {Boolean}
 */
export function isLocalImage( node ) {
	return node.is( 'element', 'img' ) && node.getAttribute( 'src' ) &&
		( node.getAttribute( 'src' ).match( /data:image\/\w+;base64,/g ) ||
		node.getAttribute( 'src' ).match( /blob:/g ) );
}

// Extracts image type based on its blob representation or its source.
//
// @param {String} src Image src attribute value.
// @param {Blob} blob Image blob representation.
// @returns {String}
function getImageFileType( blob, src ) {
	if ( blob.type ) {
		return blob.type.replace( 'image/', '' );
	} else if ( src.match( /data:image\/(\w+);base64/ ) ) {
		return src.match( /data:image\/(\w+);base64/ )[ 1 ].toLowerCase();
	} else {
		// Fallback to 'jpeg' as common extension.
		return 'jpeg';
	}
}

// Creates `File` instance from the given `Blob` instance using specified filename.
//
// @param {Blob} blob The `Blob` instance from which file will be created.
// @param {String} filename Filename used during file creation.
// @returns {File|null} The `File` instance created from the given blob or `null` if `File API` is not available.
function createFileFromBlob( blob, filename ) {
	try {
		return new File( [ blob ], filename );
	} catch ( err ) {
		// Edge does not support `File` constructor ATM, see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9551546/.
		// However, the `File` function is present (so cannot be checked with `!window.File` or `typeof File === 'function'`), but
		// calling it with `new File( ... )` throws an error. This try-catch prevents that. Also when the function will
		// be implemented correctly in Edge the code will start working without any changes (see #247).
		return null;
	}
}
