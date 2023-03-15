/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { ExportPdf } from '@ckeditor/ckeditor5-export-pdf';
import { ExportWord } from '@ckeditor/ckeditor5-export-word';
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push( FindAndReplace );
ClassicEditor.builtinPlugins.push( ExportPdf );
ClassicEditor.builtinPlugins.push( ExportWord );

window.ClassicEditor = ClassicEditor;
