/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// DLL builds require JavaScript file to save backward compatibility between them.
// To avoid unnecessary complexity in the scripts, we decided to keep `ckeditor5-collaboration` as a JavaScript package.
//
// Since, the TypeScript compiler requires typings, we created them for all re-exports provided in the package.
//
// For more details, please follow: https://github.com/ckeditor/ckeditor5/issues/13794.

declare module 'ckeditor5-collaboration/src/collaboration-core' {
	export * from '@ckeditor/ckeditor5-collaboration-core';
}
