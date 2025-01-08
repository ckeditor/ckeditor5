/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

export default function getRealImportPath( modulePath ) {
	return modulePath.replace( /^([^/]+)\//, '@ckeditor/ckeditor5-$1/src/' );
}
