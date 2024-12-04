/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/parsebase64encodedobject
 */

/**
 * Parses a base64-encoded object and returns the decoded object, or null if the decoding was unsuccessful.
 */
export default function parseBase64EncodedObject( encoded: string ): Record<string, any> | null {
	try {
		if ( !encoded.startsWith( 'ey' ) ) {
			return null;
		}

		const decoded = atob( encoded.replace( /-/g, '+' ).replace( /_/g, '/' ) );

		return JSON.parse( decoded );
	} catch ( e ) {
		return null;
	}
}
