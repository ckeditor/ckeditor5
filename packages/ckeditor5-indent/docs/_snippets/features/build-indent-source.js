/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';

ClassicEditor.builtinPlugins.push( Indent );
ClassicEditor.builtinPlugins.push( IndentBlock );
ClassicEditor.builtinPlugins.push( Code );

window.ClassicEditor = ClassicEditor;
