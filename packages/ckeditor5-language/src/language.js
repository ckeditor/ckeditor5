/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language/language
 */

import { Plugin } from 'ckeditor5/src/core';

import LanguageEditing from './languageediting';
import LanguageUI from './languageui';

/**
 * The language plugin.
 *
 * For more information about this feature check the {@glink api/language package page}.
 *
 * This is a "glue" plugin which loads the {@link module:language/languageediting~LanguageEditing language editing feature}
 * and {@link module:language/languageui~LanguageUI language UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Language extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ LanguageEditing, LanguageUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Language';
	}
}

/**
 * The configuration of the language feature. Introduced by the {@link module:language/languageediting~LanguageEditing} feature.
 *
 * Read more in {@link module:language/language~LanguageConfig}.
 *
 * @member {module:language/language~LanguageConfig} module:core/editor/editorconfig~EditorConfig#language
 */

/**
 * The configuration of the language feature.
 * The option is used by the {@link module:language/languageediting~LanguageEditing} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				language: ... // Language feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface LanguageConfig
 */

/**
 * The available language options.
 *
 * The default value is:
 *
 *		const languageConfig = {
 *			options: [
 *				{ title: 'Arabic', class: 'ck-language_ar', languageCode: 'ar' },
 *				{ title: 'French', class: 'ck-language_fr', languageCode: 'fr' },
 *				{ title: 'Spanish', class: 'ck-language_es', languageCode: 'es' }
 *			]
 *		};
 *
 * The `title` and `class` properties will be used by the `language` dropdown to render available options.
 *
 * The `languageCode` property is used for the lang attribute in ISO 639 format. Language codes can be found
 * [here](http://www.loc.gov/standards/iso639-2/php/English_list.php). You can use both 2-letter ISO-639-1 codes
 * and 3-letter ISO-639-2 codes, though for consistency it is recommended to stick to ISO-639-1 2-letter codes.
 *
 * You can also specify optional `textDirection` property indicating the reading direction of the language.
 * Correct values are `ltr` and `rtl`. When `textDirection` property is missing, the language feature will
 * specify text direction by itself.
 *
 * @member {Array.<module:language/language~LanguageOption>} module:language/language~LanguageConfig#options
 */

/**
 * Language option descriptor.
 *
 * @typedef {Object} module:language/language~LanguageOption
 * @property {String} title The user-readable title of the option.
 * @property {String} class The class which will be added to the dropdown item representing this option.
 * @property {String} languageCode The language code in ISO 639 format.
 * @property {Strint} [textDirection] Language text direction. Automatically detected if omitted.
 * @extends module:engine/conversion/conversion~ConverterDefinition
 */
