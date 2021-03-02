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
 * The text fragment language plugin.
 *
 * For more information about this feature check the {@glink api/textfragmentlanguage package page}.
 *
 * This is a "glue" plugin which loads the {@link module:language/textfragmentlanguageediting~TextFragmentLanguageEditing
 * text fragment language editing feature} and
 * {@link module:language/textfragmentlanguageui~TextFragmentLanguageUI text fragment language UI feature}.
 *
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
 * The configuration of the text fragment language feature.
 * Introduced by the {@link module:language/textfragmentlanguageediting~TextFragmentLanguageEditing} feature.
 *
 * Read more in {@link module:language/textfragmentlanguage~TextFragmentLanguageConfig}.
 *
 * @member {module:language/textfragmentlanguage~TextFragmentLanguageConfig}
 * module:core/editor/editorconfig~EditorConfig#textFragmentLanguage
 */

/**
 * The configuration of the text fragment language feature.
 * The option is used by the {@link module:language/textfragmentlanguageediting~TextFragmentLanguageEditing} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				textFragmentLanguage: ... // Text fragment language feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface TextFragmentLanguageConfig
 */

/**
 * The available text fragment language options.
 *
 * The default value is:
 *
 *		const config = {
 *			options: [
 *				{ title: 'Arabic', languageCode: 'ar' },
 *				{ title: 'French', languageCode: 'fr' },
 *				{ title: 'Spanish', languageCode: 'es' }
 *			]
 *		};
 *
 * The `title` property will be used by the text fragment language dropdown to render available options.
 *
 * The `languageCode` property is used for the lang attribute in ISO 639 format. Language codes can be found
 * [here](http://www.loc.gov/standards/iso639-2/php/English_list.php). You can use both 2-letter ISO-639-1 codes
 * and 3-letter ISO-639-2 codes, though for consistency it is recommended to stick to ISO-639-1 2-letter codes.
 *
 * You can also specify optional `textDirection` property indicating the reading direction of the language.
 * Correct values are `ltr` and `rtl`. When `textDirection` property is missing, the text fragment language feature will
 * specify text direction by itself.
 *
 * @member {Array.<module:language/textfragmentlanguage~TextFragmentLanguageOption>}
 * module:language/textfragmentlanguage~TextFragmentLanguageConfig#options
 */

/**
 * Text fragment language feature option descriptor.
 *
 * @typedef {Object} module:language/textfragmentlanguage~TextFragmentLanguageOption
 * @property {String} title The user-readable title of the option.
 * @property {String} languageCode The language code in ISO 639 format.
 * @property {Strint} [textDirection] The language text direction. Automatically detected if omitted.
 * @extends module:engine/conversion/conversion~ConverterDefinition
 */
