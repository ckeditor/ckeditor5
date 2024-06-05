/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Code, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { TodoList } from '@ckeditor/ckeditor5-list';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { FontBackgroundColor, FontSize, FontColor, FontFamily } from '@ckeditor/ckeditor5-font';
import { PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { BlockToolbar } from '@ckeditor/ckeditor5-ui';
import { HeadingButtonsUI } from '@ckeditor/ckeditor5-heading';
import { ParagraphButtonUI } from '@ckeditor/ckeditor5-paragraph';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import ClassicEditor from '../../build-classic.js';

ClassicEditor.builtinPlugins.push( Alignment );
ClassicEditor.builtinPlugins.push( Strikethrough );
ClassicEditor.builtinPlugins.push( Subscript );
ClassicEditor.builtinPlugins.push( Superscript );
ClassicEditor.builtinPlugins.push( Underline );
ClassicEditor.builtinPlugins.push( TableProperties );
ClassicEditor.builtinPlugins.push( TableCellProperties );
ClassicEditor.builtinPlugins.push( FontSize );
ClassicEditor.builtinPlugins.push( FontFamily );
ClassicEditor.builtinPlugins.push( FontColor );
ClassicEditor.builtinPlugins.push( FontBackgroundColor );
ClassicEditor.builtinPlugins.push( PictureEditing );
ClassicEditor.builtinPlugins.push( ImageInsert );
ClassicEditor.builtinPlugins.push( ImageResize );
ClassicEditor.builtinPlugins.push( AutoImage );
ClassicEditor.builtinPlugins.push( CodeBlock );
ClassicEditor.builtinPlugins.push( IndentBlock );
ClassicEditor.builtinPlugins.push( Indent );
ClassicEditor.builtinPlugins.push( Code );
ClassicEditor.builtinPlugins.push( TodoList );
ClassicEditor.builtinPlugins.push( CKBox );
ClassicEditor.builtinPlugins.push( CKBoxImageEdit );
ClassicEditor.builtinPlugins.push( BlockToolbar );
ClassicEditor.builtinPlugins.push( HeadingButtonsUI );
ClassicEditor.builtinPlugins.push( ParagraphButtonUI );
ClassicEditor.builtinPlugins.push( LinkImage );

window.ClassicEditor = ClassicEditor;
