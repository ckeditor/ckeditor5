/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/locale
 */

/* globals console */

import toArray from './toarray';
import { _translate } from './translation-service';
import { getLanguageDirection } from './language';

/**
 * Represents the localization services.
 */
export default class Locale {
	/**
	 * Creates a new instance of the locale class. Learn more about
	 * {@glink features/ui-language configuring the language of the editor}.
	 *
	 * @param {Object} [options] Locale configuration.
	 * @param {String} [options.uiLanguage='en'] The editor UI language code in the
	 * [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format. See {@link #uiLanguage}.
	 * @param {String} [options.contentLanguage] The editor content language code in the
	 * [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format. If not specified, the same as `options.language`.
	 * See {@link #contentLanguage}.
	 */
	constructor( options = {} ) {
		/**
		 * The editor UI language code in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
		 *
		 * If the {@link #contentLanguage content language} was not specified in the `Locale` constructor,
		 * it also defines the language of the content.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.uiLanguage = options.uiLanguage || 'en';

		/**
		 * The editor content language code in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
		 *
		 * Usually the same as the {@link #uiLanguage editor language}, it can be customized by passing an optional
		 * argument to the `Locale` constructor.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.contentLanguage = options.contentLanguage || this.uiLanguage;

		/**
		 * Text direction of the {@link #uiLanguage editor UI language}. Either `'ltr'` or `'rtl'`.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.uiLanguageDirection = getLanguageDirection( this.uiLanguage );

		/**
		 * Text direction of the {@link #contentLanguage editor content language}.
		 *
		 * If the content language was passed directly to the `Locale` constructor, this property represents the
		 * direction of that language.
		 *
		 * If the {@link #contentLanguage editor content language} was derived from the {@link #uiLanguage editor language},
		 * the content language direction is the same as the {@link #uiLanguageDirection UI language direction}.
		 *
		 * The value is either `'ltr'` or `'rtl'`.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.contentLanguageDirection = getLanguageDirection( this.contentLanguage );

		/**
		 * Translates the given message to the {@link #uiLanguage}. This method is also available in
		 * {@link module:core/editor/editor~Editor#t `Editor`} and {@link module:ui/view~View#t `View`}.
		 *
		 * This method's context is statically bound to the `Locale` instance and **should always be called as a function**:
		 *
		 *		const t = locale.t;
		 *		t( 'Label' );
		 *
		 * The message can be either a string or an object implementing the {@link module:utils/translation-service~Message} interface.
		 *
		 * The message may contain placeholders (`%<index>`) for value(s) that are passed as a `values` parameter.
		 * For an array of values, the `%<index>` will be changed to an element of that array at the given index.
		 * For a single value passed as the second argument, only the `%0` placeholders will be changed to the provided value.
		 *
		 *		t( 'Created file "%0" in %1ms.', [ fileName, timeTaken ] );
		 * 		t( 'Created file "%0", fileName );
		 *
		 * The message supports plural forms. To specify the plural form, use the `plural` property. Singular or plural form
		 * will be chosen depending on the first value from the passed `values`. The value of the `plural` property is used
		 * as a default plural translation when the translation for the target language is missing.
		 *
		 *		t( { string: 'Add a space', plural: 'Add %0 spaces' }, 1 ); // 'Add a space' for the English language.
		 *		t( { string: 'Add a space', plural: 'Add %0 spaces' }, 5 ); // 'Add 5 spaces' for the English language.
		 *		t( { string: '%1 a space', plural: '%1 %0 spaces' }, [ 2, 'Add' ] ); // 'Add 2 spaces' for the English language.
		 *
		 * 		t( { string: 'Add a space', plural: 'Add %0 spaces' }, 1 ); // 'Dodaj spację' for the Polish language.
		 *		t( { string: 'Add a space', plural: 'Add %0 spaces' }, 5 ); // 'Dodaj 5 spacji' for the Polish language.
		 *		t( { string: '%1 a space', plural: '%1 %0 spaces' }, [ 2, 'Add' ] ); // 'Dodaj 2 spacje' for the Polish language.
		 *
		 *  * The message should provide an ID using the `id` property when the message strings are not unique and their
		 * translations should be different.
		 *
		 *		translate( 'en', { string: 'image', id: 'ADD_IMAGE' } );
		 *		translate( 'en', { string: 'image', id: 'AN_IMAGE' } );
		 *
		 * @method #t
		 * @param {String|module:utils/translation-service~Message} message A message that will be localized (translated).
		 * @param {String|Number|Array.<String|Number>} [values] A value or an array of values that will fill message placeholders.
		 * For messages supporting plural forms the first value will determine the plural form.
		 * @returns {String}
		 */
		this.t = ( message, values ) => this._t( message, values );
	}

	/**
	 * The editor UI language code in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
	 *
	 * **Note**: This property was deprecated. Please use {@link #uiLanguage} and {@link #contentLanguage}
	 * properties instead.
	 *
	 * @deprecated
	 * @member {String}
	 */
	get language() {
		/**
		 * The {@link module:utils/locale~Locale#language `Locale#language`} property was deprecated and will
		 * be removed in the near future. Please use the {@link #uiLanguage} and {@link #contentLanguage} properties instead.
		 *
		 * @error locale-deprecated-language-property
		 */
		console.warn(
			'locale-deprecated-language-property: ' +
			'The Locale#language property has been deprecated and will be removed in the near future. ' +
			'Please use #uiLanguage and #contentLanguage properties instead.' );

		return this.uiLanguage;
	}

	/**
	 * An unbound version of the {@link #t} method.
	 *
	 * @private
	 * @param {String|module:utils/translation-service~Message} message
	 * @param {Number|String|Array.<Number|String>} [values]
	 * @returns {String}
	 */
	_t( message, values = [] ) {
		values = toArray( values );

		if ( typeof message === 'string' ) {
			message = { string: message };
		}

		const hasPluralForm = !!message.plural;
		const quantity = hasPluralForm ? values[ 0 ] : 1;

		const translatedString = _translate( this.uiLanguage, message, quantity );

		return interpolateString( translatedString, values );
	}
}

// Fills the `%0, %1, ...` string placeholders with values.
function interpolateString( string, values ) {
	return string.replace( /%(\d+)/g, ( match, index ) => {
		return ( index < values.length ) ? values[ index ] : match;
	} );
}
