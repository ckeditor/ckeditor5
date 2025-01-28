/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module language/utils
 */

import { getLanguageDirection, type LanguageDirection } from 'ckeditor5/src/utils.js';

/**
 * Returns the language attribute value in a human-readable text format:
 *
 * ```
 * <languageCode>:<textDirection>
 * ```
 *
 * * `languageCode` - The language code used for the `lang` attribute in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
 * * `textDirection` - One of the following values: `rtl` or `ltr`, indicating the reading direction of the language.
 *
 * See the {@link module:core/editor/editorconfig~LanguageConfig#textPartLanguage text part language configuration}
 * for more information about language properties.
 *
 * If the `textDirection` argument is omitted, it will be automatically detected based on `languageCode`.
 *
 * @param languageCode The language code in the ISO 639-1 format.
 * @param textDirection The language text direction. Automatically detected if omitted.
 */
export function stringifyLanguageAttribute( languageCode: string, textDirection?: LanguageDirection ): string {
	textDirection = textDirection || getLanguageDirection( languageCode );
	return `${ languageCode }:${ textDirection }`;
}

/**
 * Retrieves language properties converted to attribute value by the
 * {@link module:language/utils~stringifyLanguageAttribute stringifyLanguageAttribute} function.
 *
 * @param str The attribute value.
 * @returns The object with properties:
 * * languageCode - The language code in the ISO 639 format.
 * * textDirection - The language text direction.
 */
export function parseLanguageAttribute( str: string ): { languageCode: string; textDirection: string } {
	const [ languageCode, textDirection ] = str.split( ':' );

	return { languageCode, textDirection };
}
