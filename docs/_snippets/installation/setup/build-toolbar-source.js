/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import {
	Code, Strikethrough, Subscript, Superscript, Underline, CKBox, CKBoxImageEdit, TodoList,
	Alignment, TableProperties, TableCellProperties, FontBackgroundColor, FontSize, FontColor,
	FontFamily, PictureEditing, ImageInsert, ImageResize, AutoImage, CodeBlock, Indent,
	IndentBlock, BlockToolbar, HeadingButtonsUI, ParagraphButtonUI, LinkImage
} from 'ckeditor5';
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
