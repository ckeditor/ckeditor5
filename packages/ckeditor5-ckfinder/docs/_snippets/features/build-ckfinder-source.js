/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';
import { CKFinderUploadAdapter } from '@ckeditor/ckeditor5-adapter-ckfinder';
import { PictureEditing, AutoImage, ImageResize, ImageInsert } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { Alignment } from '@ckeditor/ckeditor5-alignment';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push(
	CKFinder,
	CKFinderUploadAdapter,
	PictureEditing,
	ImageResize,
	ImageInsert,
	AutoImage,
	LinkImage,
	Alignment );

window.ClassicEditor = ClassicEditor;
