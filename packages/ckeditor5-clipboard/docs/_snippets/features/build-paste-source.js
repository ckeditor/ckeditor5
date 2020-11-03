/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Font from '@ckeditor/ckeditor5-font/src/font';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';

ClassicEditor.builtinPlugins.push(
	Strikethrough,
	Subscript,
	Superscript,
	Underline,
	Font,
	ImageResize
);

window.ClassicEditor = ClassicEditor;
