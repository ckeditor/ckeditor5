/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import { CKBox, CKBoxImageEdit, PictureEditing, ImageInsert, ImageResize, AutoImage, LinkImage, Alignment } from 'ckeditor5';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push(
	PictureEditing,
	ImageResize,
	AutoImage,
	ImageInsert,
	LinkImage,
	Alignment,
	CKBox,
	CKBoxImageEdit
);

window.ClassicEditor = ClassicEditor;
