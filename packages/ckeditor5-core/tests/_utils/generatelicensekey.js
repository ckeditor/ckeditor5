/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { releaseDate, crc32 } from '@ckeditor/ckeditor5-utils';

/**
 * Generates a license key for testing purposes.
 */
export default function generateKey( options = {} ) {
	const {
		isExpired = false,
		jtiExist = true,
		expExist = true,
		vcExist = true,
		customVc = undefined,
		skipHeader = false,
		skipTail = false,
		daysAfterExpiration = 0
	} = options;

	const jti = 'foo';
	const releaseTimestamp = Date.parse( releaseDate );
	const day = 86400000; // one day in milliseconds.

	// Depending on isExpired parameter we are creating timestamp ten days
	// before or after release day.
	const expirationTimestamp = isExpired ? releaseTimestamp - 10 * day : releaseTimestamp + 10 * day;
	const todayTimestamp = ( expirationTimestamp + daysAfterExpiration * day );

	const payload = {};

	[ 'licensedHosts', 'licenseType', 'usageEndpoint', 'distributionChannel', 'whiteLabel' ].forEach( prop => {
		if ( prop in options ) {
			payload[ prop ] = options[ prop ];
		}
	} );

	if ( jtiExist ) {
		payload.jti = jti;
	}

	if ( expExist ) {
		payload.exp = Math.ceil( expirationTimestamp / 1000 );
	}

	if ( customVc ) {
		payload.vc = customVc;
	} else if ( vcExist ) {
		const vc = crc32( getCrcInputData( payload ) );

		payload.vc = vc;
	}

	return {
		licenseKey: `${ skipHeader ? '' : 'foo.' }${ encodePayload( payload ) }${ skipTail ? '' : '.bar' }`,
		todayTimestamp
	};
}

function encodePayload( claims ) {
	return encodeBase64Safe( JSON.stringify( claims ) );
}

function encodeBase64Safe( text ) {
	return btoa( text ).replace( /\+/g, '-' ).replace( /\//g, '_' ).replace( /=+$/, '' );
}

function getCrcInputData( licensePayload ) {
	const keysToCheck = Object.getOwnPropertyNames( licensePayload ).sort();

	const filteredValues = keysToCheck
		.filter( key => key != 'vc' && licensePayload[ key ] != null )
		.map( key => licensePayload[ key ] );

	return [ ...filteredValues ];
}
