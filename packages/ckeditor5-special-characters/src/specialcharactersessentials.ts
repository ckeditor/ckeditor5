/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module special-characters/specialcharactersessentials
 */

import { Plugin } from 'ckeditor5/src/core.js';

import SpecialCharactersCurrency from './specialcharacterscurrency.js';
import SpecialCharactersMathematical from './specialcharactersmathematical.js';
import SpecialCharactersArrows from './specialcharactersarrows.js';
import SpecialCharactersLatin from './specialcharacterslatin.js';
import SpecialCharactersText from './specialcharacterstext.js';

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
	public static get pluginName() {
		return 'SpecialCharactersEssentials' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [
			SpecialCharactersCurrency,
			SpecialCharactersText,
			SpecialCharactersMathematical,
			SpecialCharactersArrows,
			SpecialCharactersLatin
		] as const;
	}
}
