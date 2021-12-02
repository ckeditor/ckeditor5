/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';

ClassicEditor.builtinPlugins.push( MediaEmbed, AutoImage );

window.ClassicEditor = ClassicEditor;
