/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';

ClassicEditor.builtinPlugins.push( Autosave );

window.ClassicEditor = ClassicEditor;
