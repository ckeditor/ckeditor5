/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import ExportPdf from '@ckeditor/ckeditor5-export-pdf/src/exportpdf';
import ExportWord from '@ckeditor/ckeditor5-export-word/src/exportword';

ClassicEditor.builtinPlugins.push( FindAndReplace );
ClassicEditor.builtinPlugins.push( ExportPdf );
ClassicEditor.builtinPlugins.push( ExportWord );

window.ClassicEditor = ClassicEditor;
