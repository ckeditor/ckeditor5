/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

/**
 * @module utils/translation-service
 *
 * Translation service provides {module:utils/translation-service.translate translate} method which can be used
 * to translate phrase to the given language. Translation should be previously added directly to
 * the window.CKEDITOR_TRANSLATIONS variable, safely extending current ones.
 *
 * 		<script src="./path/to/ckeditor.js"></script>
 * 		<script src="./path/to/translations/de.js"></script>
 *
 * Example of the function that can add translations to the given language.
 *
 * 		function addTranslations( lang, translations ) {
 *			if ( !window.CKEDITOR_TRANSLATIONS ) {
 *				window.CKEDITOR_TRANSLATIONS = {};
 *			}
 *
 *			const dictionary = window.CKEDITOR_TRANSLATIONS[ lang ] || ( window.CKEDITOR_TRANSLATIONS[ lang ] = {} );
 *
 *			// Extend the dictionary for the given language.
 *			Object.assign( dictionary, translations );
 *		}
 */

// Initialize CKEDITOR_TRANSLATIONS if it's not initialized.
if ( !window.CKEDITOR_TRANSLATIONS ) {
	window.CKEDITOR_TRANSLATIONS = {};
}

/**
 * Translates string if the translation of the string was previously added to the dictionary.
 * See {@link module:utils/translation-service Translation Service}.
 * This happens in a multi-language mode were translation modules are created by the bundler.
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
		lang = Object.keys( window.CKEDITOR_TRANSLATIONS )[ 0 ];
	}

	if ( numberOfLanguages === 0 || !hasTranslation( lang, translationKey ) ) {
		return translationKey.replace( / \[context: [^\]]+\]$/, '' );
	}

	const dictionary = window.CKEDITOR_TRANSLATIONS[ lang ];

	// In case of missing translations we still need to cut off the `[context: ]` parts.
	return dictionary[ translationKey ].replace( / \[context: [^\]]+\]$/, '' );
}

// Checks whether the dictionary exists and translation in that dictionary exists.
function hasTranslation( lang, translationKey ) {
	return (
		( lang in window.CKEDITOR_TRANSLATIONS ) &&
		( translationKey in window.CKEDITOR_TRANSLATIONS[ lang ] )
	);
}

function getNumberOfLanguages() {
	return Object.keys( window.CKEDITOR_TRANSLATIONS ).length;
}
