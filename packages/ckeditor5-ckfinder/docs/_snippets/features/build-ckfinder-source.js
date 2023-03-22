/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';
import { PictureEditing, AutoImage, ImageResize, ImageInsert } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { Alignment } from '@ckeditor/ckeditor5-alignment';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push(
	CKFinder,
	PictureEditing,
	ImageResize,
	ImageInsert,
	AutoImage,
	LinkImage,
	Alignment );

window.ClassicEditor = ClassicEditor;
