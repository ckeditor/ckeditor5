/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

import bold from '@ckeditor/ckeditor5-basic-styles/theme/icons/bold.svg';
import italic from '@ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg';
import underline from '@ckeditor/ckeditor5-basic-styles/theme/icons/underline.svg';
import code from '@ckeditor/ckeditor5-basic-styles/theme/icons/code.svg';
import strikethrough from '@ckeditor/ckeditor5-basic-styles/theme/icons/strikethrough.svg';
import subscript from '@ckeditor/ckeditor5-basic-styles/theme/icons/subscript.svg';
import superscript from '@ckeditor/ckeditor5-basic-styles/theme/icons/superscript.svg';

import browseFiles from '@ckeditor/ckeditor5-ckfinder/theme/icons/browse-files.svg';

import codeBlock from '@ckeditor/ckeditor5-code-block/theme/icons/codeblock.svg';

import { icons as coreIcons } from 'ckeditor5/src/core';

import fontFamily from '@ckeditor/ckeditor5-font/theme/icons/font-family.svg';
import fontSize from '@ckeditor/ckeditor5-font/theme/icons/font-size.svg';
import fontColor from '@ckeditor/ckeditor5-font/theme/icons/font-color.svg';
import fontBackground from '@ckeditor/ckeditor5-font/theme/icons/font-background.svg';

import heading1 from '@ckeditor/ckeditor5-heading/theme/icons/heading1.svg';
import heading2 from '@ckeditor/ckeditor5-heading/theme/icons/heading2.svg';
import heading3 from '@ckeditor/ckeditor5-heading/theme/icons/heading3.svg';
import heading4 from '@ckeditor/ckeditor5-heading/theme/icons/heading4.svg';
import heading5 from '@ckeditor/ckeditor5-heading/theme/icons/heading5.svg';
import heading6 from '@ckeditor/ckeditor5-heading/theme/icons/heading6.svg';

import indent from '@ckeditor/ckeditor5-indent/theme/icons/indent.svg';
import outdent from '@ckeditor/ckeditor5-indent/theme/icons/outdent.svg';

import marker from '@ckeditor/ckeditor5-highlight/theme/icons/marker.svg';
import pen from '@ckeditor/ckeditor5-highlight/theme/icons/pen.svg';

import html from '@ckeditor/ckeditor5-html-embed/theme/icons/html.svg';

import link from '@ckeditor/ckeditor5-link/theme/icons/link.svg';
import unlink from '@ckeditor/ckeditor5-link/theme/icons/unlink.svg';

import bulletedList from '@ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg';
import numberedList from '@ckeditor/ckeditor5-list/theme/icons/numberedlist.svg';
import todoList from '@ckeditor/ckeditor5-list/theme/icons/todolist.svg';

import media from '@ckeditor/ckeditor5-media-embed/theme/icons/media.svg';

import pageBreak from '@ckeditor/ckeditor5-page-break/theme/icons/pagebreak.svg';

import paragraph from '@ckeditor/ckeditor5-paragraph/theme/icons/paragraph.svg';

import removeFormat from '@ckeditor/ckeditor5-remove-format/theme/icons/remove-format.svg';

import contentLock from '@ckeditor/ckeditor5-restricted-editing/theme/icons/contentlock.svg';
import contentUnlock from '@ckeditor/ckeditor5-restricted-editing/theme/icons/contentunlock.svg';

import selectAll from '@ckeditor/ckeditor5-select-all/theme/icons/select-all.svg';

import sourceEditing from '@ckeditor/ckeditor5-source-editing/theme/icons/source-editing.svg';

import specialCharacters from '@ckeditor/ckeditor5-special-characters/theme/icons/specialcharacters.svg';

import table from '@ckeditor/ckeditor5-table/theme/icons/table.svg';
import tableRow from '@ckeditor/ckeditor5-table/theme/icons/table-row.svg';
import tableColumn from '@ckeditor/ckeditor5-table/theme/icons/table-column.svg';
import tableMergeCell from '@ckeditor/ckeditor5-table/theme/icons/table-merge-cell.svg';
import tableCellProperties from '@ckeditor/ckeditor5-table/theme/icons/table-cell-properties.svg';
import tableProperties from '@ckeditor/ckeditor5-table/theme/icons/table-properties.svg';

import nextArrow from '@ckeditor/ckeditor5-ui/theme/icons/next-arrow.svg';
import previousArrow from '@ckeditor/ckeditor5-ui/theme/icons/previous-arrow.svg';

import undo from '@ckeditor/ckeditor5-undo/theme/icons/undo.svg';
import redo from '@ckeditor/ckeditor5-undo/theme/icons/redo.svg';

import loupe from '@ckeditor/ckeditor5-find-and-replace/theme/icons/find-replace.svg';

import '../../theme/ckeditor5-ui/components/editorui/editorui.css';

const icons = {
	// basic-styles
	bold, italic, underline, code, strikethrough, subscript, superscript,

	// ckfinder
	browseFiles,

	// code block
	codeBlock,

	// core
	...coreIcons,

	// font
	fontFamily, fontSize, fontColor, fontBackground,

	// heading
	heading1, heading2, heading3, heading4, heading5, heading6,

	// highlight
	marker, pen,

	// html-embed,
	html,

	// indent
	indent, outdent,

	// link
	link, unlink,

	// list
	bulletedList, numberedList, todoList,

	// media-embed
	media,

	// page-break
	pageBreak,

	// paragraph
	paragraph,

	// remove-format
	removeFormat,

	// restricted-editing
	contentLock, contentUnlock,

	// select-all
	selectAll,

	// source-editing
	sourceEditing,

	// special-characters
	specialCharacters,

	// table
	table, tableRow, tableColumn, tableMergeCell,
	tableCellProperties, tableProperties,

	// ui
	nextArrow, previousArrow,

	// undo
	undo, redo,

	// find and replace
	loupe
};

const toolbar = new ToolbarView( new Locale() );

for ( const i in icons ) {
	const button = new ButtonView();

	button.set( {
		label: i,
		icon: icons[ i ],
		tooltip: true
	} );

	button.iconView.fillColor = 'hsl(47deg 100% 66%)';

	toolbar.items.add( button );
}

toolbar.class = 'ck-editor-toolbar ck-reset_all';
toolbar.render();

document.querySelector( '#standard' ).appendChild( toolbar.element );
document.querySelector( '#color' ).appendChild( toolbar.element.cloneNode( true ) );
document.querySelector( '#inverted' ).appendChild( toolbar.element.cloneNode( true ) );
document.querySelector( '#zoom' ).appendChild( toolbar.element.cloneNode( true ) );
