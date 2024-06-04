/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { ImageResize, ImageInsert, AutoImage, PictureEditing } from '@ckeditor/ckeditor5-image';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { Alignment } from '@ckeditor/ckeditor5-alignment';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push( ImageResize );
ClassicEditor.builtinPlugins.push( ImageInsert );
ClassicEditor.builtinPlugins.push( LinkImage );
ClassicEditor.builtinPlugins.push( AutoImage );
ClassicEditor.builtinPlugins.push( PictureEditing );
ClassicEditor.builtinPlugins.push( CKBox );
ClassicEditor.builtinPlugins.push( CKBoxImageEdit );
ClassicEditor.builtinPlugins.push( ArticlePluginSet );
ClassicEditor.builtinPlugins.push( HorizontalLine );
ClassicEditor.builtinPlugins.push( Alignment );

window.ClassicEditor = ClassicEditor;
