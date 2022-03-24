/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Reads and returns content of the content-styles.css file.
 *
 * @returns {String} Content of the file
 */
module.exports = function readContentStylesFile() {
	const contentStylesPath = path.join( __dirname, '..', '..', 'build', 'content-styles', 'content-styles.css' );

	return fs.readFileSync( contentStylesPath, 'utf-8' );
};
