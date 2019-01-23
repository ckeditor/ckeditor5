/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor.builtinPlugins.push( CKFinder );

window.ClassicEditor = ClassicEditor;
