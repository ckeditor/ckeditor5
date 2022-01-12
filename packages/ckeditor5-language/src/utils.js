/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/utils
 */

import { getLanguageDirection } from 'ckeditor5/src/utils';

/**
 * Returns the language attribute value in a human-readable text format:
 *
 *		<languageCode>:<textDirection>
 *
 * * `languageCode` - The language code used for the `lang` attribute in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
 * * `textDirection` - One of the following values: `rtl` or `ltr`, indicating the reading direction of the language.
 *
 * See the {@link module:core/editor/editorconfig~LanguageConfig#textPartLanguage text part language configuration}
 * for more information about language properties.
 *
 * If the `textDirection` argument is omitted, it will be automatically detected based on `languageCode`.
 *
 * @param {String} languageCode The language code in the ISO 639-1 format.
 * @param {'ltr'|'rtl'} [textDirection] The language text direction. Automatically detected if omitted.
 * @returns {String}
 */
export function stringifyLanguageAttribute( languageCode, textDirection ) {
	textDirection = textDirection || getLanguageDirection( languageCode );
	return `${ languageCode }:${ textDirection }`;
}

/**
 * Retrieves language properties converted to attribute value by the
 * {@link module:language/utils~stringifyLanguageAttribute stringifyLanguageAttribute} function.
 *
 * @param {String} str The attribute value.
 * @returns {Object} result
 * @returns {String} result.languageCode The language code in the ISO 639 format.
 * @returns {String} result.textDirection The language text direction.
 */
export function parseLanguageAttribute( str ) {
	const [ languageCode, textDirection ] = str.split( ':' );

	return { languageCode, textDirection };
}
