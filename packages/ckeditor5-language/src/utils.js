/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/utils
 */

import { getLanguageDirection } from 'ckeditor5/src/utils';

/**
 * Returns language attribute value in a human-readable text format:
 *
 *		<languageCode>:<textDirection>
 *
 * * `languageCode` - The language code used for the lang attribute in ISO 639 format.
 * * `textDirection` - One of the following values: `rtl` or `ltr`, indicating the reading direction of the language.
 *
 * See {@link module:language/language~LanguageConfig language config} for more information about language properties.
 *
 * If `textDirection` argument is omitted, it will be automatically detected based on `languageCode`.
 *
 * @param {String} languageCode The language code in ISO 639 format.
 * @param {String} [textDirection] Language text direction. Automatically detected if omitted.
 */
export function parseLanguageToString( languageCode, textDirection ) {
	textDirection = textDirection || getLanguageDirection( languageCode );
	return `${ languageCode }:${ textDirection }`;
}

/**
 * Retrieves language properties converted to attribute value by
 * {@link module:language/utils~parseLanguageToString parseLanguageToString} function.
 *
 * @param {String} str Attribute value.
 * @returns result
 * @returns result.languageCode The language code in ISO 639 format.
 * @returns result.textDirection Language text direction.
 */
export function parseLanguageFromString( str ) {
	const parts = str.split( ':' );
	return { languageCode: parts[ 0 ], textDirection: parts[ 1 ] };
}

/**
 * Returns language options as defined in `config.languageList.options` but processed to consider
 * the editor localization, i.e. to display {@link module:language/language~LanguageOption}
 * in the correct language.
 *
 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
 * when the user configuration is defined because the editor does not exist yet.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Array.<module:language/language~LanguageOption>}.
 */
export function getLocalizedOptions( editor ) {
	const t = editor.t;

	return editor.config.get( 'languageList.options' ).map( option => {
		option.title = t( option.title );
		return option;
	} );
}
