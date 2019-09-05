/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

module.exports = function getRealImportPath( modulePath ) {
	if ( modulePath.includes( 'ckeditor-' ) ) {
		return modulePath.replace( /^([^/]+)\//, '@ckeditor/$1/src/' );
	}

	return modulePath.replace( /^([^/]+)\//, '@ckeditor/ckeditor5-$1/src/' );
};
