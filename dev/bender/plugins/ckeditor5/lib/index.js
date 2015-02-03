/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint node: true */

'use strict';

var path = require( 'path' );
var files = [
	path.join( __dirname, '../static/extensions.js' )
];

module.exports = {
	name: 'bender-ckeditor5',

	files: files,
	include: files
};
