/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/language
 */

const RTL_LANGUAGE_CODES = [
	'ar', 'ara', // Arabic
	'fa', 'per', 'fas', // Persian
	'he', 'heb', // Hebrew
	'ku', 'kur', // Kurdish
	'ug', 'uig' // Uighur, Uyghur
];

/**
 * Helps determine whether a language text direction is LTR or RTL.
 *
 * @param {String} language The ISO 639-1 or ISO 639-2 language code.
 * @returns {'ltr'|'rtl'}
 */
export function getLanguageDirection( languageCode ) {
	return RTL_LANGUAGE_CODES.includes( languageCode ) ? 'rtl' : 'ltr';
}
