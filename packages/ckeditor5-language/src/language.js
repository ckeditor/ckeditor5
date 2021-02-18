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
