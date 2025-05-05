/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// External source exclusion.
const metaElement = document.createElement( 'meta' );

metaElement.name = 'x-cke-crawler-ignore-patterns';
metaElement.content = JSON.stringify( {
	'console-error': [
		'The Cross-Origin-Opener-Policy header has been ignored',
		'<svg> attribute preserveAspectRatio',
		'transparent NaN'
	]
} );

document.head.appendChild( metaElement );
