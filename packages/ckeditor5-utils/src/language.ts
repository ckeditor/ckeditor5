/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/language
 */

/**
 * String representing a language direction.
 */
export type LanguageDirection = 'ltr' | 'rtl';

const RTL_LANGUAGE_CODES = [
	'ar', 'ara', // Arabic
	'dv', 'div', // Dhivehi
	'fa', 'per', 'fas', // Persian
	'he', 'heb', // Hebrew
	'ku', 'kur', // Kurdish
	'ug', 'uig', // Uighur, Uyghur
	'ur', 'urd' // Urdu
];

/**
 * Helps determine whether a language text direction is LTR or RTL.
 *
 * @param languageCode The ISO 639-1 or ISO 639-2 language code.
 */
export function getLanguageDirection( languageCode: string ): LanguageDirection {
	return RTL_LANGUAGE_CODES.includes( languageCode ) ? 'rtl' : 'ltr';
}
