/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

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
 * That function is accessible globally via `window.CKEDITOR_TRANSLATIONS.add()`. So it's possible to add translation from
 * the other script, just after that one.
 *
 * 		<script src="./path/to/ckeditor.js"></script>
 * 		<script src="./path/to/translations/en.js"></script>
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
 * In a single-language mode (when values passed to `t()` were replaced with target language strings) the dictionary
 * is left empty, so this function will return the original strings always.
 *
 *		translate( 'pl', 'Cancel [context: reject]' );
 *
 * @param {String} lang Target language.
 * @param {String} translationKey String that will be translated.
 * @returns {String} Translated sentence.
 */
export function translate( lang, translationKey ) {
	const numberOfLanguages = getNumberOfLanguages();

	if ( numberOfLanguages === 1 ) {
		// Override the language to the only supported one.
		// This can't be done in the `Locale` class, because the translations comes after the `Locale` class initialization.
		lang = Object.keys( dictionaries )[ 0 ];
	}

	if ( numberOfLanguages === 0 || !hasTranslation( lang, translationKey ) ) {
		return translationKey.replace( / \[context: [^\]]+\]$/, '' );
	}

	// In case of missing translations we still need to cut off the `[context: ]` parts.
	return dictionaries[ lang ][ translationKey ].replace( / \[context: [^\]]+\]$/, '' );
}

// Checks whether the dictionary exists and translation in that dictionary exists.
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

function getNumberOfLanguages() {
	return Object.keys( dictionaries ).length;
}

// Export globally add function to enable adding later translations.
// See https://github.com/ckeditor/ckeditor5/issues/624
window.CKEDITOR_TRANSLATIONS = window.CKEDITOR_TRANSLATIONS || {};
window.CKEDITOR_TRANSLATIONS.add = add;
