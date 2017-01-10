/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/translation-service
 */

const translations = {};

/**
 * Merges package translations to existing ones.
 * These translations can be used later with {@link module:utils/translations-service~translate translate}
 *
 *		define( 'pl', {
 *			core: {
 *				ok: 'OK',
 *				cancel: 'Anuluj'
 *			}
 *		} );
 *
 * @param {String} lang
 * @param {Object.<String, Object>} packageDictionary
 * @returns undefined
 */
export function define( lang, packageDictionary ) {
	if ( !( lang in translations ) ) {
		translations[ lang ] = {};
	}

	const dictionary = translations[ lang ];

	for ( const packageName in packageDictionary ) {
		for ( const translationKey in packageDictionary[ packageName ] ) {
			const translation = packageDictionary[ packageName ][ translationKey ];
			dictionary[ `${packageName}/${translationKey}` ] = translation;
		}
	}
}

/**
 * Translates string if the translation of the string was previously defined using {@link module:utils/translations-service~define define}.
 * Otherwise returns original (English) sentence.
 *
 *		translate( 'pl', 'core/ok: OK' );
 *
 * @param {String} lang Translation language.
 * @param {String} str Sentence which is going to be translated.
 * @returns {String} Translated sentence.
 */
export function translate( lang, str ) {
	const [ translationKey, englishSentence ] = str.split( ': ' );

	if ( !existTranslationKey( lang, translationKey ) ) {
		return englishSentence;
	}

	return translations[ lang ][ translationKey ];
}

function existTranslationKey( lang, translationKey ) {
	return (
		!( lang in translations ) ||
		!( translationKey in translations[ lang ] )
	);
}