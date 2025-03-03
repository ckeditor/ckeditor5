/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */
import {
	CKBox, CKBoxImageEdit, ImageResize, ImageInsert, AutoImage, PictureEditing, LinkImage, HorizontalLine, Alignment
} from 'ckeditor5';
import { Uploadcare, UploadcareImageEdit } from 'ckeditor5-premium-features';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push( ImageResize );
ClassicEditor.builtinPlugins.push( ImageInsert );
ClassicEditor.builtinPlugins.push( LinkImage );
ClassicEditor.builtinPlugins.push( AutoImage );
ClassicEditor.builtinPlugins.push( PictureEditing );
ClassicEditor.builtinPlugins.push( HorizontalLine );
ClassicEditor.builtinPlugins.push( Alignment );
ClassicEditor.builtinPlugins.push( CKBox );
ClassicEditor.builtinPlugins.push( CKBoxImageEdit );
ClassicEditor.builtinPlugins.push( Uploadcare );
ClassicEditor.builtinPlugins.push( UploadcareImageEdit );

window.ClassicEditor = ClassicEditor;
