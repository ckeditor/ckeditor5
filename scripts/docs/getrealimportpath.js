/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const NON_CKEDITOR5_PACKAGES = {
	'cloud-services-core': 'ckeditor-cloud-services-core'
};

module.exports = function getRealImportPath( modulePath ) {
	for ( const shortPkgName of Object.keys( NON_CKEDITOR5_PACKAGES ) ) {
		if ( modulePath.startsWith( shortPkgName ) ) {
			return modulePath.replace( new RegExp( '^' + shortPkgName ), `@ckeditor/${ NON_CKEDITOR5_PACKAGES[ shortPkgName ] }/src` );
		}
	}

	return modulePath.replace( /^([^/]+)\//, '@ckeditor/ckeditor5-$1/src/' );
};
