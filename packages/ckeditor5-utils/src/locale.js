/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/locale
 */

import { translate } from './translation-service';

/**
 * Represents the localization services.
 */
export default class Locale {
	/**
	 * Creates a new instance of the Locale class.
	 *
	 * @param {String} [lang='en'] The language code in [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
	 */
	constructor( lang ) {
		/**
		 * The language code in [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.lang = lang || 'en';

		/**
		 * Translates the given string to the {@link #lang}. This method is also availble in {@link module:core/editor/editor~Editor#t} and
		 * {@link module:ui/view~View#t}.
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
		 * @param {String[]} values Values that should be used to interpolate the string.
		 */
		this.t = ( ...args ) => this._t( ...args );
	}

	/**
	 * Base for the {@link #t} method.
	 *
	 * @private
	 */
	_t( str, values ) {
		let translatedString = translate( this.lang, str );

		if ( values ) {
			translatedString = translatedString.replace( /%(\d+)/g, ( match, index ) => {
				return ( index < values.length ) ? values[ index ] : match;
			} );
		}

		return translatedString;
	}
}
