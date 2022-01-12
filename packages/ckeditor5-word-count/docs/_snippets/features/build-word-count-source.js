/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon/src/ckeditor';

import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';

ClassicEditor.builtinPlugins.push( WordCount );
BalloonEditor.builtinPlugins.push( WordCount );

window.ClassicEditor = ClassicEditor;
window.BalloonEditor = BalloonEditor;
