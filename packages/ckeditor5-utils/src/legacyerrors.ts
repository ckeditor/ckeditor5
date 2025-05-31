/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/legacyerrors
 */

import CKEditorError from './ckeditorerror.js';

if ( false ) {
	/**
	 * The `Locale#language` property was deprecated and will
	 * be removed in the near future. Please use the {@link module:utils/locale~Locale#uiLanguage `Locale#uiLanguage`} and
	 * {@link module:utils/locale~Locale#contentLanguage `Locale#contentLanguage`} properties instead.
	 *
	 * @error locale-deprecated-language-property
	 */
	throw new CKEditorError( 'locale-deprecated-language-property', null );
}
