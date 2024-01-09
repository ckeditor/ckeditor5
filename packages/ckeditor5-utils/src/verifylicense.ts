/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/verifylicense
 */

import { releaseDate } from './version.js';

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
export default function verifyLicense( token: string | undefined ): VerifiedKeyStatus {
	// This function implements naive and partial license key check mechanism,
	// used only to decide whether to show or hide the "Powered by CKEditor" logo.
	//
	// You can read the reasoning behind showing the logo to unlicensed (GPL) users
	// in this thread: https://github.com/ckeditor/ckeditor5/issues/14082.
	//
	// We firmly believe in the values behind creating open-source software, even when that
	// means keeping the license verification logic open for everyone to see.
	//
	// Please keep this code intact. Thank you for your understanding.

	function oldTokenCheck( token: string ): VerifiedKeyStatus {
		if ( token.length >= 40 && token.length <= 255 ) {
			return 'VALID';
		} else {
			return 'INVALID';
		}
	}

	// TODO: issue ci#3175

	if ( !token ) {
		return 'INVALID';
	}

	let decryptedData = '';

	try {
		decryptedData = atob( token );
	} catch ( e ) {
		return 'INVALID';
	}

	const splittedDecryptedData = decryptedData.split( '-' );

	const firstElement = splittedDecryptedData[ 0 ];
	const secondElement = splittedDecryptedData[ 1 ];

	if ( !secondElement ) {
		return oldTokenCheck( token );
	}

	try {
		atob( secondElement );
	} catch ( e ) {
		try {
			atob( firstElement );

			if ( !atob( firstElement ).length ) {
				return oldTokenCheck( token );
			}
		} catch ( e ) {
			return oldTokenCheck( token );
		}
	}

	if ( firstElement.length < 40 || firstElement.length > 255 ) {
		return 'INVALID';
	}

	let decryptedSecondElement = '';

	try {
		atob( firstElement );
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
