/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/specialcharactersessentials
 */

import { Plugin } from 'ckeditor5/src/core';

import SpecialCharactersCurrency from './specialcharacterscurrency';
import SpecialCharactersMathematical from './specialcharactersmathematical';
import SpecialCharactersArrows from './specialcharactersarrows';
import SpecialCharactersLatin from './specialcharacterslatin';
import SpecialCharactersText from './specialcharacterstext';

/**
 * A plugin combining a basic set of characters for the special characters plugin.
 *
 *		ClassicEditor
 *			.create( {
 *				plugins: [ ..., SpecialCharacters, SpecialCharactersEssentials ],
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * @extends module:core/plugin~Plugin
 */
export default class SpecialCharactersEssentials extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [
			SpecialCharactersCurrency,
			SpecialCharactersText,
			SpecialCharactersMathematical,
			SpecialCharactersArrows,
			SpecialCharactersLatin
		];
	}
}
