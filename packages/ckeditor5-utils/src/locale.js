/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/locale
 */

import { translate } from './translation-service';

const RTL_LANGUAGE_CODES = { ar: 1, fa: 1, he: 1, ku: 1, ug: 1 };

/**
 * Represents the localization services.
 */
export default class Locale {
	/**
	 * Creates a new instance of the Locale class.
	 *
	 * @param {String} [language='en'] The editor language code in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
	 * @param {String} [contentLanguage] The editor content language code in the
	 * [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
	 */
	constructor( language, contentLanguage ) {
		/**
		 * The editor language code in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
		 *
		 * It controls the language of the editor UI. If the {@link #contentLanguage content language}
		 * was not specified in the `Locale` constructor, it also defines the language of the content.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.language = language || 'en';

		/**
		 * The editor content language code in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
		 *
		 * Usually the same as {@link #language editor language}, it can be customized by passing an optional
		 * argument to the `Locale` constructor.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.contentLanguage = contentLanguage || this.language;

		/**
		 * Text direction of the {@link #language editor language}.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.languageDirection = RTL_LANGUAGE_CODES[ this.language ] ? 'rtl' : 'ltr';

		/**
		 * Text direction of the {@link #contentLanguage editor content language}.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.contentLanguageDirection = RTL_LANGUAGE_CODES[ this.contentLanguage ] ? 'rtl' : 'ltr';

		/**
		 * Translates the given string to the {@link #language}. This method is also available in {@link module:core/editor/editor~Editor#t}
		 * and {@link module:ui/view~View#t}.
		 *
		 * The strings may contain placeholders (`%<index>`) for values which are passed as the second argument.
		 * `<index>` is the index in the `values` array.
		 *
		 *		editor.t( 'Created file "%0" in %1ms.', [ fileName, timeTaken ] );
		 *
		 * This method's context is statically bound to Locale instance,
		 * so it can be called as a function:
		 *
		 *		const t = this.t;
		 *		t( 'Label' );
		 *
		 * @method #t
		 * @param {String} str The string to translate.
		 * @param {String[]} [values] Values that should be used to interpolate the string.
		 */
		this.t = ( ...args ) => this._t( ...args );
	}

	/**
	 * Base for the {@link #t} method.
	 *
	 * @private
	 */
	_t( str, values ) {
		let translatedString = translate( this.language, str );

		if ( values ) {
			translatedString = translatedString.replace( /%(\d+)/g, ( match, index ) => {
				return ( index < values.length ) ? values[ index ] : match;
			} );
		}

		return translatedString;
	}
}
