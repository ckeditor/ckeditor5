/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/decodelicensekey
*/

import { parseBase64EncodedObject } from './parsebase64encodedobject.js';

/**
 * Parses the provided license key and returns the decoded object, or null if the decoding was unsuccessful.
 *
 * @param licenseKey The license key to decode.
 */
export function decodeLicenseKey( licenseKey?: string ): Record<string, any> | null {
	if ( !licenseKey ) {
		return null;
	}

	const encodedPayload = getLicenseKeyPayload( licenseKey );

	if ( !encodedPayload ) {
		return null;
	}

	return parseBase64EncodedObject( encodedPayload );
}

function getLicenseKeyPayload( licenseKey: string ): string | null {
	const parts = licenseKey.split( '.' );

	if ( parts.length != 3 ) {
		return null;
	}

	return parts[ 1 ];
}
