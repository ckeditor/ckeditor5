/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

/* config { "additionalLanguages": [ "ar", "es" ] } */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';

ClassicEditor.builtinPlugins.push( TodoList );
ClassicEditor.builtinPlugins.push( ImageResize );
ClassicEditor.defaultConfig.toolbar.items.splice( 7, 0, 'todoList' );

window.ClassicEditor = ClassicEditor;
