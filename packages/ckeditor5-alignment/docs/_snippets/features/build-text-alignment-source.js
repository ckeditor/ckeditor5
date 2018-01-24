/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

ClassicEditor.build.plugins.push( Alignment );

window.ClassicEditor = ClassicEditor;
