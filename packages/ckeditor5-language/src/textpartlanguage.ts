/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module language/textpartlanguage
 */

import { Plugin } from 'ckeditor5/src/core.js';

import TextPartLanguageEditing from './textpartlanguageediting.js';
import TextPartLanguageUI from './textpartlanguageui.js';

/**
 * The text part language feature.
 *
 * This feature allows setting a language of the document's text part to support
 * [WCAG 3.1.2 Language of Parts](https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning-other-lang-id.html) specification.
 *
 * To change the editor's UI language, refer to the {@glink getting-started/setup/ui-language Setting the UI language} guide.
 *
 * For more information about this feature, check the {@glink api/language package page} as well as the {@glink features/language
 * Text part language} feature guide.
 *
 * This is a "glue" plugin which loads the
 * {@link module:language/textpartlanguageediting~TextPartLanguageEditing text part language editing feature}
 * and the {@link module:language/textpartlanguageui~TextPartLanguageUI text part language UI feature}.
 */
export default class TextPartLanguage extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TextPartLanguageEditing, TextPartLanguageUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TextPartLanguage' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
