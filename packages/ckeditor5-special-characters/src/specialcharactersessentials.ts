/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharactersessentials
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';

import SpecialCharactersCurrency from './specialcharacterscurrency';
import SpecialCharactersMathematical from './specialcharactersmathematical';
import SpecialCharactersArrows from './specialcharactersarrows';
import SpecialCharactersLatin from './specialcharacterslatin';
import SpecialCharactersText from './specialcharacterstext';

/**
 * A plugin combining a basic set of characters for the special characters plugin.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersEssentials ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */
export default class SpecialCharactersEssentials extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'SpecialCharactersEssentials' {
		return 'SpecialCharactersEssentials';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [
			SpecialCharactersCurrency,
			SpecialCharactersText,
			SpecialCharactersMathematical,
			SpecialCharactersArrows,
			SpecialCharactersLatin
		];
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[SpecialCharactersEssentials.pluginName]: SpecialCharactersEssentials;
	}
}
