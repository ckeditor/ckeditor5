/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import {
	SpecialCharacters,
	SpecialCharactersEssentials,
	SpecialCharactersCurrency,
	SpecialCharactersMathematical
} from '@ckeditor/ckeditor5-special-characters';
import { Font } from '@ckeditor/ckeditor5-font';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push( SpecialCharacters, Font, PictureEditing, ImageResize, AutoImage, LinkImage, CKBox );

window.ClassicEditor = ClassicEditor;
window.SpecialCharacters = SpecialCharacters;
window.SpecialCharactersCurrency = SpecialCharactersCurrency;
window.SpecialCharactersMathematical = SpecialCharactersMathematical;
window.SpecialCharactersEssentials = SpecialCharactersEssentials;
