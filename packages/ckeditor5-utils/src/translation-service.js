/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

/**
 * @module utils/translation-service
 */

/* istanbul ignore else */
if ( !window.CKEDITOR_TRANSLATIONS ) {
	window.CKEDITOR_TRANSLATIONS = {};
}

/**
 * Adds translations to existing ones.
 * These translations will later be available for the {@link module:utils/translation-service~translate `translate()`} function.
 *
 *		add( 'pl', {
 *			'OK': 'OK',
 *			'Cancel [context: reject]': 'Anuluj'
 *		} );
 *
 * If you cannot import this function from this module (e.g. because you use a CKEditor 5 build), then you can
 * still add translations by extending the global `window.CKEDITOR_TRANSLATIONS` object by using a function like
 * the one below:
 *
 *		function addTranslations( language, translations ) {
 *			if ( !window.CKEDITOR_TRANSLATIONS ) {
 *				window.CKEDITOR_TRANSLATIONS = {};
 *			}
 *
 *			const dictionary = window.CKEDITOR_TRANSLATIONS[ language ] || ( window.CKEDITOR_TRANSLATIONS[ language ] = {} );
 *
 *			// Extend the dictionary for the given language.
 *			Object.assign( dictionary, translations );
 *		}
 *
 * @param {String} language Target language.
 * @param {Object.<String, String>} translations Translations which will be added to the dictionary.
 */
export function add( language, translations ) {
	const dictionary = window.CKEDITOR_TRANSLATIONS[ language ] || ( window.CKEDITOR_TRANSLATIONS[ language ] = {} );

	Object.assign( dictionary, translations );
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
 * @param {String} language Target language.
 * @param {String} translationKey String that will be translated.
 * @returns {String} Translated sentence.
 */
export function translate( language, translationKey ) {
	const numberOfLanguages = getNumberOfLanguages();

	if ( numberOfLanguages === 1 ) {
		// Override the language to the only supported one.
		// This can't be done in the `Locale` class, because the translations comes after the `Locale` class initialization.
		language = Object.keys( window.CKEDITOR_TRANSLATIONS )[ 0 ];
	}

	if ( numberOfLanguages === 0 || !hasTranslation( language, translationKey ) ) {
		return translationKey.replace( / \[context: [^\]]+\]$/, '' );
	}

	const dictionary = window.CKEDITOR_TRANSLATIONS[ language ];

	// In case of missing translations we still need to cut off the `[context: ]` parts.
	return dictionary[ translationKey ].replace( / \[context: [^\]]+\]$/, '' );
}

/**
 * Clears dictionaries for test purposes.
 *
 * @protected
 */
export function _clear() {
	window.CKEDITOR_TRANSLATIONS = {};
}

// Checks whether the dictionary exists and translation in that dictionary exists.
function hasTranslation( language, translationKey ) {
	return (
		( language in window.CKEDITOR_TRANSLATIONS ) &&
		( translationKey in window.CKEDITOR_TRANSLATIONS[ language ] )
	);
}

function getNumberOfLanguages() {
	return Object.keys( window.CKEDITOR_TRANSLATIONS ).length;
}
