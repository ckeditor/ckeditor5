/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Sometimes the request to external resources (like `badge.fury.io` or `emojics.com`) fails for unknown reasons,
// so ignore all navigation timeouts for framework integration docs.
const metaElement = document.createElement( 'meta' );

metaElement.name = 'x-cke-crawler-ignore-patterns';
metaElement.content = JSON.stringify( {
	'navigation-error': 'timeout'
} );

document.head.appendChild( metaElement );
