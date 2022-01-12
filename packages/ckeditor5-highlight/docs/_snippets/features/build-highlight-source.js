/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';

ClassicEditor.builtinPlugins.push( Highlight );

window.ClassicEditor = ClassicEditor;
