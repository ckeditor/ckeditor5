/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

module.exports = function getRealImportPath( modulePath ) {
	return modulePath.replace( /^([^/]+)\//, '@ckeditor/ckeditor5-$1/src/' );
};
