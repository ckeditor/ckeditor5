/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/translation-service
 */

let dictionaries = {};

/**
 * Adds package translations to existing ones.
 * These translations can be used later with {@link module:utils/translations-service~translate translate}.
 *
 *		add( 'pl', {
 *			'OK': 'OK',
 *			'Cancel [context: reject]': 'Anuluj'
 *		} );
 *
 * @param {String} lang Target language.
 * @param {Object.<String, String>} translations translations which will be added to a dictionary.
 */
export function add( lang, translations ) {
	dictionaries[ lang ] = dictionaries[ lang ] || {};
	Object.assign( dictionaries[ lang ], translations );
}

/**
 * Translates string if the translation of the string was previously added using {@link module:utils/translations-service~add add}
 * (multi-language mode). When no translation is defined in the dictionary or the dictionary doesn't exists it returns original string
 * without the '[context: ]' (development mode and single-language mode). In single-language mode the strings are without the contexts
 * already, but it's hard to separate that mode and development mode here (In both cases the dictionary is empty) and this replacement
 * should not replace nothing in already translated strings.
 *
 *		translate( 'pl', 'Cancel [context: reject]' );
 *
 * @param {String} lang Target language.
 * @param {String} translationKey String which is going to be translated.
 * @returns {String} Translated sentence.
 */
export function translate( lang, translationKey ) {
	if ( !hasTranslation( lang, translationKey ) ) {
		return translationKey.replace( / \[context: [^\]]+\]$/, '' ) ;
	}

	return dictionaries[ lang ][ translationKey ];
}

// Checks whether the dictionary exists and translaiton in that dictionary exists.
function hasTranslation( lang, translationKey ) {
	return (
		( lang in dictionaries ) &&
		( translationKey in dictionaries[ lang ] )
	);
}

/**
 * Clears dictionaries for test purpose.
 *
 * @protected
 */
export function _clear() {
	dictionaries = {};
}
