/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
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
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push(
	SpecialCharacters,
	Font,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage,
	CKBox,
	CKBoxImageEdit );

window.ClassicEditor = ClassicEditor;
window.SpecialCharacters = SpecialCharacters;
window.SpecialCharactersCurrency = SpecialCharactersCurrency;
window.SpecialCharactersMathematical = SpecialCharactersMathematical;
window.SpecialCharactersEssentials = SpecialCharactersEssentials;
