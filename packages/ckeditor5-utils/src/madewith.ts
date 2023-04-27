/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/madewith
 */

/**
 * Possible states of the key after verification
 */
export type VerifiedKeyStatus = 'VALID' | 'INVALID' | 'EXPIRED';

/**
 * TODO
 */
export default function verify( stringToCheck: string ): VerifiedKeyStatus {
	// mocked last release date
	const currentReleaseDate = new Date();

	let decryptedData = '';
	let decryptedSecondElement = '';

	try {
		decryptedData = atob( stringToCheck );
	} catch ( e ) {
		return 'INVALID';
	}

	const splittedDecryptedData = decryptedData.split( '-' );

	const firstElement = splittedDecryptedData[ 0 ];
	const secondElement = splittedDecryptedData[ 1 ];

	if ( !secondElement ) {
		const isFirstElementMatchingThePattern = firstElement.match( /^[a-zA-Z0-9+/=$]+$/g );

		if ( isFirstElementMatchingThePattern && ( firstElement.length >= 40 && firstElement.length <= 255 ) ) {
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

	if ( decryptedSecondElement.length !== 8 ) {
		return 'INVALID';
	}

	// date will be compared to date of the release that will be handled like version now
	const day = decryptedSecondElement.substring( 0, 2 );
	const month = decryptedSecondElement.substring( 2, 4 );
	const year = decryptedSecondElement.substring( 4, 8 );
	const date = new Date( `${ year }-${ month }-${ day }` );

	if ( !isFinite( Number( date ) ) ) {
		return 'INVALID';
	}

	if ( date < currentReleaseDate ) {
		return 'EXPIRED';
	}

	return 'VALID';
}
