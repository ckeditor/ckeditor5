/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,

	SpecialCharactersConfig
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[SpecialCharacters.pluginName]: SpecialCharacters;
		[SpecialCharactersText.pluginName]: SpecialCharactersText;
		[SpecialCharactersArrows.pluginName]: SpecialCharactersArrows;
		[SpecialCharactersEssentials.pluginName]: SpecialCharactersEssentials;
		[SpecialCharactersLatin.pluginName]: SpecialCharactersLatin;
		[SpecialCharactersCurrency.pluginName]: SpecialCharactersCurrency;
		[SpecialCharactersMathematical.pluginName]: SpecialCharactersMathematical;
	}

	interface EditorConfig {

		/**
		 * The configuration of the {@link module:special-characters/specialcharacters~SpecialCharacters} feature.
		 *
		 * Read more in {@link module:special-characters/specialcharactersconfig~SpecialCharactersConfig}.
		 */
		specialCharacters?: SpecialCharactersConfig;
	}
}
