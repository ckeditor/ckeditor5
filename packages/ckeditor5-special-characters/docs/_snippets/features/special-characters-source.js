/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/SpecialCharactersCurrency';
import SpecialCharactersMathematical from '@ckeditor/ckeditor5-special-characters/src/SpecialCharactersMathematical';

ClassicEditor.builtinPlugins.push( SpecialCharacters );

window.ClassicEditor = ClassicEditor;
window.SpecialCharacters = SpecialCharacters;
window.SpecialCharactersCurrency = SpecialCharactersCurrency;
window.SpecialCharactersMathematical = SpecialCharactersMathematical;
window.SpecialCharactersEssentials = SpecialCharactersEssentials;
window.Plugin = Plugin;
