/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
// import FindAndReplace from '/Users/mzagorski/Desktop/CKEDITOR5/ckeditor5/packages/ckeditor5-find-and-replace/src/findandreplace';
// import FindAndReplace from '../../../src/findandreplace';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';

ClassicEditor.builtinPlugins.push( FindAndReplace );

window.ClassicEditor = ClassicEditor;
