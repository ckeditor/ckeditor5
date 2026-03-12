/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export default function getRealImportPath( modulePath ) {
	const shortPackageName = modulePath.split( '/' )[ 0 ];

	return shortPackageName ? `@ckeditor/ckeditor5-${ shortPackageName }` : modulePath;
}
