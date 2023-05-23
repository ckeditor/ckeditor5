/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Bold, Italic, Underline, Strikethrough, Subscript, Superscript, Code } from '@ckeditor/ckeditor5-basic-styles';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push( Bold, Italic, Underline, Strikethrough, Subscript, Superscript, Code, RemoveFormat,
	PictureEditing, ImageResize, AutoImage, LinkImage, CKBox );

window.ClassicEditor = ClassicEditor;
