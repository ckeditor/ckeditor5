/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';

ClassicEditor.builtinPlugins.push( ImageResize );
ClassicEditor.builtinPlugins.push( ImageInsert );
ClassicEditor.builtinPlugins.push( LinkImage );
ClassicEditor.builtinPlugins.push( AutoImage );

window.ClassicEditor = ClassicEditor;
