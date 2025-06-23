/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module special-characters
 */

export { SpecialCharacters, type SpecialCharacterDefinition } from './specialcharacters.js';
export { SpecialCharactersArrows } from './specialcharactersarrows.js';
export { SpecialCharactersText } from './specialcharacterstext.js';
export { SpecialCharactersMathematical } from './specialcharactersmathematical.js';
export { SpecialCharactersLatin } from './specialcharacterslatin.js';
export { SpecialCharactersEssentials } from './specialcharactersessentials.js';
export { SpecialCharactersCurrency } from './specialcharacterscurrency.js';

export type { SpecialCharactersConfig } from './specialcharactersconfig.js';

export {
	type SpecialCharactersGridViewExecuteEvent,
	type SpecialCharactersGridViewTileHoverEvent,
	type SpecialCharactersGridViewTileFocusEvent,
	type SpecialCharactersGridViewEventData,
	CharacterGridView as _SpecialCharactersGridView
} from './ui/charactergridview.js';

export { CharacterInfoView as _SpecialCharactersInfoView } from './ui/characterinfoview.js';
export { SpecialCharactersCategoriesView as _SpecialCharactersCategoriesView } from './ui/specialcharacterscategoriesview.js';
export { SpecialCharactersView as _SpecialCharactersView } from './ui/specialcharactersview.js';

import './augmentation.js';
