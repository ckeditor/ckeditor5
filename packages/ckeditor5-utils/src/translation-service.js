/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
 *			'Cancel': 'Anuluj'
 *		} );
 *
 * If the message supports plural forms, make sure to provide an array with all plural forms:
 *
 *		add( 'pl', {
 *	 		'Add spaces': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ]
 * 		} );
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
 * @param {Function} getPluralForm A function that returns the plural form index.
 */
export function add( language, translations, getPluralForm ) {
	if ( !window.CKEDITOR_TRANSLATIONS[ language ] ) {
		window.CKEDITOR_TRANSLATIONS[ language ] = {};
	}

	const languageTranslations = window.CKEDITOR_TRANSLATIONS[ language ];

	languageTranslations.dictionary = languageTranslations.dictionary || {};
	languageTranslations.getPluralForm = getPluralForm || languageTranslations.getPluralForm;

	Object.assign( languageTranslations.dictionary, translations );
}

/**
 * Translates string if the translation of the string was previously added to the dictionary.
 * See {@link module:utils/translation-service Translation Service}.
 * This happens in a multi-language mode were translation modules are created by the bundler.
 *
 * When no translation is defined in the dictionary or the dictionary doesn't exist this function returns
 * the original string.
 *
 * In a single-language mode (when values passed to `t()` were replaced with target language strings) the dictionary
 * is left empty, so this function will return the original strings always.
 *
 *		translate( 'pl', { string: 'Cancel' } );
 *
 * The third optional argument is the number of elements, based on which the single form or one of plural forms
 * should be picked when the message supports plural forms.
 *
 * 		translate( 'en', { string: 'Add a space', plural: 'Add %0 spaces' }, 1 ); // 'Add a space'
 * 		translate( 'en', { string: 'Add a space', plural: 'Add %0 spaces' }, 3 ); // 'Add %0 spaces'
 *
 * @protected
 * @param {String} language Target language.
 * @param {module:utils/translation-service~Message|string} message A message that will be translated.
 * @param {Number} [amount] A number of elements for which a plural form should be picked from the target language dictionary.
 * @returns {String} Translated sentence.
 */
export function _translate( language, message, amount = 1 ) {
	const numberOfLanguages = getNumberOfLanguages();

	if ( numberOfLanguages === 1 ) {
		// Override the language to the only supported one.
		// This can't be done in the `Locale` class, because the translations comes after the `Locale` class initialization.
		language = Object.keys( window.CKEDITOR_TRANSLATIONS )[ 0 ];
	}

	// Use message context to enhance the message id when passed.
	const messageId = message.context ?
		message.string + '_' + message.context :
		message.string;

	if ( numberOfLanguages === 0 || !hasTranslation( language, messageId ) ) {
		if ( amount !== 1 ) {
			// Return the default plural form that was passed in the `message.plural` parameter.
			return message.plural;
		}

		return message.string;
	}

	const dictionary = window.CKEDITOR_TRANSLATIONS[ language ].dictionary;
	const getPluralForm = window.CKEDITOR_TRANSLATIONS[ language ].getPluralForm || ( n => n === 1 ? 0 : 1 );

	// TODO - maybe a warning could be helpful for some mismatches.

	if ( typeof dictionary[ messageId ] === 'string' ) {
		return dictionary[ messageId ];
	}

	// Note: The `translate` function is not responsible for replacing `%0, %1, ...` with values.
	return dictionary[ messageId ][ getPluralForm( amount ) ];
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
function hasTranslation( language, messageId ) {
	return (
		!!window.CKEDITOR_TRANSLATIONS[ language ] &&
		!!window.CKEDITOR_TRANSLATIONS[ language ].dictionary[ messageId ]
	);
}

function getNumberOfLanguages() {
	return Object.keys( window.CKEDITOR_TRANSLATIONS ).length;
}

/**
 * The internationalization message interface. A translation for the given language can be found.
 *
 * TODO
 *
 * @typedef {Object} Message
 *
 * @property {String} string The message string. It becomes the message id when no context is provided.
 * @property {String} [context] The message context. If passed then the message id is constructed form both,
 * the message string and the message string in the following format: `<messageString>_<messageContext>`.
 * @property {String} [plural] The plural form of the message.
 */
