/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	TextPartLanguageOption,
	TextPartLanguage,
	TextPartLanguageEditing,
	TextPartLanguageUI,
	TextPartLanguageCommand
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface LanguageConfig {

		/**
		 * The available {@link module:language/textpartlanguage~TextPartLanguage}
		 * options that allow setting the language of parts of the content.
		 *
		 * This configuration option is available only with the {@glink api/language text part language feature} enabled.
		 *
		 * Refer to the [WCAG 3.1.2 Language of Parts](https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning-other-lang-id.html) specification
		 * to learn more.
		 *
		 * To change the editor's UI language, refer to the {@glink getting-started/setup/ui-language Setting the UI language} guide.
		 *
		 * The default value is:
		 *
		 * ```ts
		 * const config = [
		 * 	{ title: 'Arabic', languageCode: 'ar' },
		 * 	{ title: 'French', languageCode: 'fr' },
		 * 	{ title: 'Spanish', languageCode: 'es' }
		 * ];
		 * ```
		 *
		 * The `title` property will be used by the text part language dropdown to render available options.
		 *
		 * The `languageCode` property is used for the `lang` attribute in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
		 *
		 * You can also specify the optional `textDirection` property indicating the reading direction of the language.
		 * Correct values are `ltr` and `rtl`. When the `textDirection` property is missing, the text part language feature will
		 * specify the text direction by itself.
		 */
		textPartLanguage?: Array<TextPartLanguageOption>;
	}

	interface PluginsMap {
		[ TextPartLanguage.pluginName ]: TextPartLanguage;
		[ TextPartLanguageEditing.pluginName ]: TextPartLanguageEditing;
		[ TextPartLanguageUI.pluginName ]: TextPartLanguageUI;
	}

	interface CommandsMap {
		textPartLanguage: TextPartLanguageCommand;
	}
}
