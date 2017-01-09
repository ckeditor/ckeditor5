/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/translation-service
 */

const translations = {};

export function define( lang, fileDictionary ) {
	if ( !( lang in translations ) ) {
		translations[ lang ] = {};
	}

	const dictionary = translations[ lang ];

	for ( const packageName in fileDictionary ) {
		if ( !( packageName in dictionary ) ) {
			dictionary[ packageName ] = {};
		}

		Object.assign( dictionary[ packageName ], fileDictionary[ packageName ] );
	}
}

export function translate( lang, str ) {
	const [ contextId, englishWord ] = str.split( ': ' );
	const [ packageName, translationKey ] = contextId.split( '/' );

	if (
		!( lang in translations ) ||
		!( packageName in translations[ lang ] ) ||
		!( translationKey in translations[ lang ][ packageName ] )
	) {
		return englishWord;
	}

	return translations[ lang ][ packageName ][ translationKey ];

	// development
	// return str.replace( /^[^:]+: /, '' );
}
