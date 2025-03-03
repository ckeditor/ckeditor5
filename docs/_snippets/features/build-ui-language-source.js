/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import { Superscript, CKBox, CKBoxImageEdit, PictureEditing, ImageInsert, ImageResize, AutoImage } from 'ckeditor5';
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push( Superscript );
ClassicEditor.builtinPlugins.push( PictureEditing );
ClassicEditor.builtinPlugins.push( ImageInsert );
ClassicEditor.builtinPlugins.push( Superscript );
ClassicEditor.builtinPlugins.push( CKBox );
ClassicEditor.builtinPlugins.push( CKBoxImageEdit );
ClassicEditor.builtinPlugins.push( PictureEditing );
ClassicEditor.builtinPlugins.push( ImageResize );
ClassicEditor.builtinPlugins.push( AutoImage );

window.ClassicEditor = ClassicEditor;
