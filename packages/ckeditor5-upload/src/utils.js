/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Checks if given file is an image.
 *
 * @param {File} file
 * @returns {Boolean}
 */
export function isImageType( file ) {
	const types = /^image\/(jpeg|png|gif|bmp)$/;

	return types.test( file.type );
}

