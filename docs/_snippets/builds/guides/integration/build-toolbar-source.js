/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';

ClassicEditor.builtinPlugins.push( Alignment );
ClassicEditor.builtinPlugins.push( FontSize );
ClassicEditor.builtinPlugins.push( FontFamily );
ClassicEditor.builtinPlugins.push( FontColor );
ClassicEditor.builtinPlugins.push( FontBackgroundColor );
ClassicEditor.builtinPlugins.push( CodeBlock );
ClassicEditor.builtinPlugins.push( Code );
ClassicEditor.builtinPlugins.push( TodoList );

window.ClassicEditor = ClassicEditor;
