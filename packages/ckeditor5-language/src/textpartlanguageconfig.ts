/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/textpartlanguageconfig
 */

import type { LanguageDirection } from 'ckeditor5/src/utils';

/**
 * The text part language feature option descriptor.
 */
export interface TextPartLanguageOption {

	/**
	 * The user-readable title of the option.
	 */
	title: string;

	/**
	 * The language code in the ISO 639 format.
	 */
	languageCode: string;

	/**
	 * The language text direction. Automatically detected if omitted.
	 */
	textDirection?: LanguageDirection;
}
