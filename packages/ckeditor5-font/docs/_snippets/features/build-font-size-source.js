/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';

ClassicEditor.build.plugins.push( FontSize );

window.ClassicEditor = ClassicEditor;
