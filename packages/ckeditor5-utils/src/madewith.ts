/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/madewith
 */

/**
 * Possible states of the key after verification.
 */
export type VerifiedKeyStatus = 'VALID' | 'INVALID' | 'EXPIRED';

/**
 * Checks whether the given string contains information that allows you to verify the license status.
 *
 * @param token The string to check.
 * @returns String that represents the state of given `stringToCheck` parameter. It can be `'VALID'`, `'INVALID'` or `'EXPIRED'`.
 */
export default function verify( token: string ): VerifiedKeyStatus {
	// TODO: issue ci#3175

	// mocked last release date
	const currentReleaseDate = new Date();

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

	if ( !secondElement ) {
		const isFirstElementMatchingThePattern = firstElement.match( /^[a-zA-Z0-9+/=$]+$/g );

		if ( isFirstElementMatchingThePattern && ( firstElement.length >= 0x28 && firstElement.length <= 0xff ) ) {
			return 'VALID';
		} else {
			return 'INVALID';
		}
	}

	try {
		decryptedSecondElement = atob( secondElement );
	} catch ( e ) {
		return 'INVALID';
	}

	if ( decryptedSecondElement.length !== 0x8 ) {
		return 'INVALID';
	}

	const year = Number( decryptedSecondElement.substring( 0, 4 ) );
	const monthIndex = Number( decryptedSecondElement.substring( 4, 6 ) ) - 1;
	const day = Number( decryptedSecondElement.substring( 6, 8 ) );

	const date = new Date( year, monthIndex, day );

	if ( !isFinite( Number( date ) ) ) {
		return 'INVALID';
	}

	if ( date < currentReleaseDate ) {
		return 'EXPIRED';
	}

	return 'VALID';
}
