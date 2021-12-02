/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

/**
 * @module utils/translation-service
 */

import CKEditorError from './ckeditorerror';

/* istanbul ignore else */
if ( !window.CKEDITOR_TRANSLATIONS ) {
	window.CKEDITOR_TRANSLATIONS = {};
}

/**
 * Adds translations to existing ones or overrides the existing translations. These translations will later
 * be available for the {@link module:utils/locale~Locale#t `t()`} function.
 *
 * The `translations` is an object which consists of `messageId: translation` pairs. Note that the message ID can be
 * either constructed from the message string or from the message ID if it was passed
 * (this happens rarely and mostly for short messages or messages with placeholders).
 * Since the editor displays only the message string, the message ID can be found either in the source code or in the
 * built translations for another language.
 *
 *		add( 'pl', {
 *			'Cancel': 'Anuluj',
 *			'IMAGE': 'obraz', // Note that the `IMAGE` comes from the message ID, while the string can be `image`.
 *		} );
 *
 * If the message is supposed to support various plural forms, make sure to provide an array with the singular form and all plural forms:
 *
 *		add( 'pl', {
 *	 		'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ]
 * 		} );
 *
 * You should also specify the third argument (the `getPluralForm()` function) that will be used to determine the plural form if no
 * language file was loaded for that language. All language files coming from CKEditor 5 sources will have this option set, so
 * these plural form rules will be reused by other translations added to the registered languages. The `getPluralForm()` function
 * can return either a Boolean or a number.
 *
 * 		add( 'en', {
 *	 		// ... Translations.
 * 		}, n => n !== 1 );
 * 		add( 'pl', {
 *	 		// ... Translations.
 * 		}, n => n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20 ) ? 1 : 2 );
 *
 * All translations extend the global `window.CKEDITOR_TRANSLATIONS` object. An example of this object can be found below:
 *
 * 		{
 * 			pl: {
 *				dictionary: {
 *					'Cancel': 'Anuluj',
 *					'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ]
 *				},
 *				// A function that returns the plural form index.
 *				getPluralForm: n => n !==1
 *			}
 *			// Other languages.
 *		}
 *
 * If you cannot import this function from this module (e.g. because you use a CKEditor 5 build), you can
 * still add translations by extending the global `window.CKEDITOR_TRANSLATIONS` object by using a function like
 * the one below:
 *
 *		function addTranslations( language, translations, getPluralForm ) {
 *			if ( !window.CKEDITOR_TRANSLATIONS ) {
 *				window.CKEDITOR_TRANSLATIONS = {};
 *			}

 *			if ( !window.CKEDITOR_TRANSLATIONS[ language ] ) {
 *				window.CKEDITOR_TRANSLATIONS[ language ] = {};
 *			}
 *
 *			const languageTranslations = window.CKEDITOR_TRANSLATIONS[ language ];
 *
 * 			languageTranslations.dictionary = languageTranslations.dictionary || {};
 * 			languageTranslations.getPluralForm = getPluralForm || languageTranslations.getPluralForm;
 *
 *			// Extend the dictionary for the given language.
 *			Object.assign( languageTranslations.dictionary, translations );
 *		}
 *
 * @param {String} language Target language.
 * @param {Object.<String,*>} translations An object with translations which will be added to the dictionary.
 * For each message ID the value should be either a translation or an array of translations if the message
 * should support plural forms.
 * @param {Function} getPluralForm A function that returns the plural form index (a number).
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
 * **Note:** This method is internal, use {@link module:utils/locale~Locale#t the `t()` function} instead to translate
 * the editor UI parts.
 *
 * This function is responsible for translating messages to the specified language. It uses translations added perviously
 * by {@link module:utils/translation-service~add} (a translations dictionary and the `getPluralForm()` function
 * to provide accurate translations of plural forms).
 *
 * When no translation is defined in the dictionary or the dictionary does not exist, this function returns
 * the original message string or the message plural depending on the number of elements.
 *
 *		translate( 'pl', { string: 'Cancel' } ); // 'Cancel'
 *
 * The third optional argument is the number of elements, based on which the single form or one of the plural forms
 * should be picked when the message is supposed to support various plural forms.
 *
 * 		translate( 'en', { string: 'Add a space', plural: 'Add %0 spaces' }, 1 ); // 'Add a space'
 * 		translate( 'en', { string: 'Add a space', plural: 'Add %0 spaces' }, 3 ); // 'Add %0 spaces'
 *
 * The message should provide an ID using the `id` property when the message strings are not unique and their
 * translations should be different.
 *
 *		translate( 'en', { string: 'image', id: 'ADD_IMAGE' } );
 *		translate( 'en', { string: 'image', id: 'AN_IMAGE' } );
 *
 * @protected
 * @param {String} language Target language.
 * @param {module:utils/translation-service~Message} message A message that will be translated.
 * @param {Number} [quantity] The number of elements for which a plural form should be picked from the target language dictionary.
 * @returns {String} Translated sentence.
 */
export function _translate( language, message, quantity = 1 ) {
	if ( typeof quantity !== 'number' ) {
		/**
		 * An incorrect value was passed to the translation function. This was probably caused
		 * by an incorrect message interpolation of a plural form. Note that for messages supporting plural forms
		 * the second argument of the `t()` function should always be a number or an array with a number as the first element.
		 *
		 * @error translation-service-quantity-not-a-number
		 */
		throw new CKEditorError( 'translation-service-quantity-not-a-number', null, { quantity } );
	}

	const numberOfLanguages = getNumberOfLanguages();

	if ( numberOfLanguages === 1 ) {
		// Override the language to the only supported one.
		// This can't be done in the `Locale` class, because the translations comes after the `Locale` class initialization.
		language = Object.keys( window.CKEDITOR_TRANSLATIONS )[ 0 ];
	}

	const messageId = message.id || message.string;

	if ( numberOfLanguages === 0 || !hasTranslation( language, messageId ) ) {
		if ( quantity !== 1 ) {
			// Return the default plural form that was passed in the `message.plural` parameter.
			return message.plural;
		}

		return message.string;
	}

	const dictionary = window.CKEDITOR_TRANSLATIONS[ language ].dictionary;
	const getPluralForm = window.CKEDITOR_TRANSLATIONS[ language ].getPluralForm || ( n => n === 1 ? 0 : 1 );

	if ( typeof dictionary[ messageId ] === 'string' ) {
		return dictionary[ messageId ];
	}

	const pluralFormIndex = Number( getPluralForm( quantity ) );

	// Note: The `translate` function is not responsible for replacing `%0, %1, ...` with values.
	return dictionary[ messageId ][ pluralFormIndex ];
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
 * The internationalization message interface. A message that implements this interface can be passed to the `t()` function
 * to be translated to the target UI language.
 *
 * @typedef {Object} module:utils/translation-service~Message
 *
 * @property {String} string The message string to translate. Acts as a default translation if the translation for a given language
 * is not defined. When the message is supposed to support plural forms, the string should be the English singular form of the message.
 * @property {String} [id] The message ID. If passed, the message ID is taken from this property instead of the `message.string`.
 * This property is useful when various messages share the same message string, for example, the `editor` string in `in the editor`
 * and `my editor` sentences.
 * @property {String} [plural] The plural form of the message. This property should be skipped when a message is not supposed
 * to support plural forms. Otherwise it should always be set to a string with the English plural form of the message.
 */
