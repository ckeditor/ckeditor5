/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/madewith
 */

import { releaseDate } from './version';

/**
 * Possible states of the key after verification.
 */
export type VerifiedKeyStatus = 'VALID' | 'INVALID';

/**
 * Checks whether the given string contains information that allows you to verify the license status.
 *
 * @param token The string to check.
 * @returns String that represents the state of given `token` parameter.
 */
export default function verify( token: string ): VerifiedKeyStatus {
	// TODO: issue ci#3175
	let decryptedData = '';
	let decryptedSecondElement = '';

	try {
		decryptedData = atob( token );
	} catch ( e ) {
		return 'INVALID';
	}

	const splittedDecryptedData = decryptedData.split( '-' );

	const firstElement = splittedDecryptedData[ 0 ];
	const secondElement = splittedDecryptedData[ 1 ];

	try {
		// Must be a valid format.
		atob( firstElement );
	} catch ( e ) {
		return 'INVALID';
	}

	if ( firstElement.length < 40 || firstElement.length > 255 ) {
		return 'INVALID';
	}

	if ( !secondElement ) {
		return 'VALID';
	}

	try {
		decryptedSecondElement = atob( secondElement );
	} catch ( e ) {
		return 'INVALID';
	}

	if ( decryptedSecondElement.length !== 8 ) {
		return 'INVALID';
	}

	const year = Number( decryptedSecondElement.substring( 0, 4 ) );
	const monthIndex = Number( decryptedSecondElement.substring( 4, 6 ) ) - 1;
	const day = Number( decryptedSecondElement.substring( 6, 8 ) );

	const date = new Date( year, monthIndex, day );

	if ( date < releaseDate || isNaN( Number( date ) ) ) {
		return 'INVALID';
	}

	return 'VALID';
}
