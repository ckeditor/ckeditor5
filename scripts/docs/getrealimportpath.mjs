/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export default function getRealImportPath( modulePath ) {
	const moduleName = modulePath.split( '/' )[ 0 ];

	return moduleName ? `@ckeditor/ckeditor5-${ moduleName }` : modulePath;
}
