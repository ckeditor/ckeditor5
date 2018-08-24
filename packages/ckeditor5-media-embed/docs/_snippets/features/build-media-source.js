/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';

ClassicEditor.builtinPlugins.push( MediaEmbed );

window.ClassicEditor = ClassicEditor;
