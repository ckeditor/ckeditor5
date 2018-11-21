/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imageupload/utils
 */

/**
 * Checks if a given file is an image.
 *
 * @param {File} file
 * @returns {Boolean}
 */
export function isImageType( file ) {
	if ( !file || !file.type ) {
		return false;
	}

	const types = /^image\/(jpeg|png|gif|bmp)$/;

	return types.test( file.type );
}
