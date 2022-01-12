/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import Font from '@ckeditor/ckeditor5-font/src/font';

ClassicEditor.builtinPlugins.push( Font );

window.ClassicEditor = ClassicEditor;
