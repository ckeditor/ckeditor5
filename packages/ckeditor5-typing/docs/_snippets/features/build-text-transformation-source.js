/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';

ClassicEditor.builtinPlugins.push( TextTransformation );

window.ClassicEditor = ClassicEditor;
