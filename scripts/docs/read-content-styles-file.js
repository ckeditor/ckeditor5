/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const fs = require( 'fs' );

/**
 * Reads and returns content of the content-styles.css file.
 *
 * @returns {String} Content of the file
 */
module.exports = function readContentStylesFile() {
	return fs.readFileSync( 'build/content-styles/content-styles.css', 'utf-8' );
};
