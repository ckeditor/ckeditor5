/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/textfragmentlanguage
 */

import { Plugin } from 'ckeditor5/src/core';

import TextFragmentLanguageEditing from './textfragmentlanguageediting';
import TextFragmentLanguageUI from './textfragmentlanguageui';

/**
 * @extends module:core/plugin~Plugin
 */
export default class TextFragmentLanguage extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TextFragmentLanguageEditing, TextFragmentLanguageUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TextFragmentLanguage';
	}
}

/**
 * The available {@link module:language/textfragmentlanguage~TextFragmentLanguage}
 * options allowing setting language of parts of the content.
 *
 * Refer to [WCAG 3.1.2 Language of Parts](https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning-other-lang-id.html) specification
 * to learn more.
 *
 * To change UI editor language, refer to {@glink features/ui-language setting the UI language} guide.
 *
 * The default value is:
 *
 *		const config = [
 *			{ title: 'Arabic', languageCode: 'ar' },
 *			{ title: 'French', languageCode: 'fr' },
 *			{ title: 'Spanish', languageCode: 'es' }
 *		];
 *
 * The `title` property will be used by the text fragment language dropdown to render available options.
 *
 * The `languageCode` property is used for the lang attribute in [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
 *
 * You can also specify optional `textDirection` property indicating the reading direction of the language.
 * Correct values are `ltr` and `rtl`. When `textDirection` property is missing, the text fragment language feature will
 * specify text direction by itself.
 *
 * @member {Array.<module:language/textfragmentlanguage~TextFragmentLanguageOption>}
 * module:core/editor/editorconfig~LanguageConfig#textFragmentLanguage
 */

/**
 * Text fragment language feature option descriptor.
 *
 * @typedef {Object} module:language/textfragmentlanguage~TextFragmentLanguageOption
 * @property {String} title The user-readable title of the option.
 * @property {String} languageCode The language code in ISO 639 format.
 * @property {'ltr'|'rtl'} [textDirection] The language text direction. Automatically detected if omitted.
 */
