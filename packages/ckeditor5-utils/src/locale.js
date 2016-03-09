/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Represents the localization services.
 *
 * @memberOf utils
 */
export default class Locale {
	/**
	 * Creates a new instance of the Locale class. {@link Foo#bar}
	 *
	 * @param {String} [lang='en'] The language code in [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
	 */
	constructor( lang ) {
		/**
		 * The language code in [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
		 *
		 * @readonly
		 * @member {String} utils.Locale#lang
		 */
		this.lang = lang || 'en';

		/**
		 * Translates the given string to the {@link #lang}. This method is also availble in {@link Editor#t} and
		 * {@link ui.View#t}.
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
		 * @method utils.Locale#t
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
		if ( values ) {
			str = str.replace( /\%(\d+)/g, ( match, index ) => ( index < values.length ) ? values[ index ] : match );
		}

		return str;
	}
}
