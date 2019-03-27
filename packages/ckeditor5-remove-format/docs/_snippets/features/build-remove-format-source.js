/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';

ClassicEditor.builtinPlugins.push( RemoveFormat );

window.ClassicEditor = ClassicEditor;
