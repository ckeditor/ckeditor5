/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/textpartlanguage
 */

import { Plugin } from 'ckeditor5/src/core';

import TextPartLanguageEditing from './textpartlanguageediting';
import TextPartLanguageUI from './textpartlanguageui';

/**
 * The text part language feature.
 *
 * This feature allows setting a language of the editor's text part to support
 * [WCAG 3.1.2 Language of Parts](https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning-other-lang-id.html) specification.
 *
 * To change UI editor language, refer to {@glink features/ui-language setting the UI language} guide.
 *
 * For more information about this feature check the {@glink api/language package page}.
 *
 * This is a "glue" plugin which loads the
 * {@link module:language/textpartlanguageediting~TextPartLanguageEditing text part editing feature}
 * and {@link module:language/textpartlanguageui~TextPartLanguageUI text part language UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TextPartLanguage extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TextPartLanguageEditing, TextPartLanguageUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TextPartLanguage';
	}
}

/**
 * The available {@link module:language/textpartlanguage~TextPartLanguage}
 * options allowing setting language of parts of the content.
 *
 * This configuration option is available only with {@glink api/language language feature} enabled.
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
 * The `title` property will be used by the text part language dropdown to render available options.
 *
 * The `languageCode` property is used for the lang attribute in [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
 *
 * You can also specify optional `textDirection` property indicating the reading direction of the language.
 * Correct values are `ltr` and `rtl`. When `textDirection` property is missing, the text part language feature will
 * specify text direction by itself.
 *
 * @member {Array.<module:language/textpartlanguage~TextPartLanguageOption>}
 * module:core/editor/editorconfig~LanguageConfig#textPartLanguage
 */

/**
 * Text part language feature option descriptor.
 *
 * @typedef {Object} module:language/textpartlanguage~TextPartLanguageOption
 * @property {String} title The user-readable title of the option.
 * @property {String} languageCode The language code in ISO 639 format.
 * @property {'ltr'|'rtl'} [textDirection] The language text direction. Automatically detected if omitted.
 */
