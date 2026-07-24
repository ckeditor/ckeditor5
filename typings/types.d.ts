/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

declare module '*.svg' {
	const content: string;
	export default content;
}

declare module '*?raw' {
	const content: string;
	export default content;
}

declare module '@ckeditor/ckeditor5-inspector';

declare module '@wiris/mathtype-ckeditor5/dist/index.js';

declare module 'sanitize-html';

declare module '*.css' {
	const content: string;
	export default content;
}
