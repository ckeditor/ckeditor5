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
 * These translations will later be available for {@link module:utils/translation-service~translate translate}.
 *
 *		add( 'pl', {
 *			'OK': 'OK',
 *			'Cancel [context: reject]': 'Anuluj'
 *		} );
 *
 * @param {String} lang Target language.
 * @param {Object.<String, String>} translations Translations which will be added to the dictionary.
 */
export function add( lang, translations ) {
	dictionaries[ lang ] = dictionaries[ lang ] || {};

	Object.assign( dictionaries[ lang ], translations );
}

/**
 * Translates string if the translation of the string was previously {@link module:utils/translation-service~add added}
 * to the dictionary. This happens in a multi-language mode were translation modules are created by the bundler.
 *
 * When no translation is defined in the dictionary or the dictionary doesn't exist this function returns
 * the original string without the `'[context: ]'` (happens in development and single-language modes).
 *
 * In a single-language mode (when values passed to `t()` were replaced with target languange strings) the dictionary
 * is left empty, so this function will return the original strings always.
 *
 *		translate( 'pl', 'Cancel [context: reject]' );
 *
 * @param {String} lang Target language.
 * @param {String} translationKey String which is going to be translated.
 * @returns {String} Translated sentence.
 */
export function translate( lang, translationKey ) {
	if ( !hasTranslation( lang, translationKey ) ) {
		return translationKey.replace( / \[context: [^\]]+\]$/, '' );
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
 * Clears dictionaries for test purposes.
 *
 * @protected
 */
export function _clear() {
	dictionaries = {};
}
