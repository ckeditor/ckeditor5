/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// DLL builds require JavaScript file to save backward compatibility between them.
// To avoid unnecessary complexity in the scripts, we decided to keep `ckeditor5` as a JavaScript package.
//
// Since, the TypeScript compiler requires typings, we created them for all re-exports provided in the package.
//
// For more details, please follow: https://github.com/ckeditor/ckeditor5/issues/13794.

declare module 'ckeditor5/src/clipboard' {
	export * from '@ckeditor/ckeditor5-clipboard';
}

declare module 'ckeditor5/src/core' {
	export * from '@ckeditor/ckeditor5-core';
}

declare module 'ckeditor5/src/engine' {
	export * from '@ckeditor/ckeditor5-engine';
}

declare module 'ckeditor5/src/enter' {
	export * from '@ckeditor/ckeditor5-enter';
}

declare module 'ckeditor5/src/paragraph' {
	export * from '@ckeditor/ckeditor5-paragraph';
}

declare module 'ckeditor5/src/select-all' {
	export * from '@ckeditor/ckeditor5-select-all';
}

declare module 'ckeditor5/src/typing' {
	export * from '@ckeditor/ckeditor5-typing';
}

declare module 'ckeditor5/src/ui' {
	export * from '@ckeditor/ckeditor5-ui';
}

declare module 'ckeditor5/src/undo' {
	export * from '@ckeditor/ckeditor5-undo';
}

declare module 'ckeditor5/src/upload' {
	export * from '@ckeditor/ckeditor5-upload';
}

declare module 'ckeditor5/src/utils' {
	export * from '@ckeditor/ckeditor5-utils';
}

declare module 'ckeditor5/src/watchdog' {
	export * from '@ckeditor/ckeditor5-watchdog';
}

declare module 'ckeditor5/src/widget' {
	export * from '@ckeditor/ckeditor5-widget';
}
