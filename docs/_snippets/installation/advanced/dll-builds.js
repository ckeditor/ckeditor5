/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

// External source exclusion.
const metaElement = document.createElement( 'meta' );

metaElement.name = 'x-cke-crawler-ignore-patterns';
metaElement.content = JSON.stringify( {
	'response-failure': [ 'jsfiddle.net' ],
	'request-failure': [ 'jsfiddle.net' ],
	'console-error': [
		'The Cross-Origin-Opener-Policy header has been ignored',
		'jsfiddle.net'
	]
} );

document.head.appendChild( metaElement );
