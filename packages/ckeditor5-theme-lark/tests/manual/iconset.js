/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';

import italic from '@ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg';
import underline from '@ckeditor/ckeditor5-basic-styles/theme/icons/underline.svg';
import code from '@ckeditor/ckeditor5-basic-styles/theme/icons/code.svg';
import strikethrough from '@ckeditor/ckeditor5-basic-styles/theme/icons/strikethrough.svg';
import subscript from '@ckeditor/ckeditor5-basic-styles/theme/icons/subscript.svg';
import superscript from '@ckeditor/ckeditor5-basic-styles/theme/icons/superscript.svg';

import { icons as coreIcons } from 'ckeditor5/src/core.js';

import fontFamily from '@ckeditor/ckeditor5-font/theme/icons/font-family.svg';
import fontSize from '@ckeditor/ckeditor5-font/theme/icons/font-size.svg';
import fontColor from '@ckeditor/ckeditor5-font/theme/icons/font-color.svg';
import fontBackground from '@ckeditor/ckeditor5-font/theme/icons/font-background.svg';

import marker from '@ckeditor/ckeditor5-highlight/theme/icons/marker.svg';
import pen from '@ckeditor/ckeditor5-highlight/theme/icons/pen.svg';

import link from '@ckeditor/ckeditor5-link/theme/icons/link.svg';
import unlink from '@ckeditor/ckeditor5-link/theme/icons/unlink.svg';

import media from '@ckeditor/ckeditor5-media-embed/theme/icons/media.svg';

import pageBreak from '@ckeditor/ckeditor5-page-break/theme/icons/pagebreak.svg';

import removeFormat from '@ckeditor/ckeditor5-remove-format/theme/icons/remove-format.svg';

import contentLock from '@ckeditor/ckeditor5-restricted-editing/theme/icons/contentlock.svg';
import contentUnlock from '@ckeditor/ckeditor5-restricted-editing/theme/icons/contentunlock.svg';

import selectAll from '@ckeditor/ckeditor5-select-all/theme/icons/select-all.svg';

import showBlocks from '@ckeditor/ckeditor5-show-blocks/theme/icons/show-blocks.svg';

import sourceEditing from '@ckeditor/ckeditor5-source-editing/theme/icons/source-editing.svg';

import specialCharacters from '@ckeditor/ckeditor5-special-characters/theme/icons/specialcharacters.svg';

import tableRow from '@ckeditor/ckeditor5-table/theme/icons/table-row.svg';
import tableColumn from '@ckeditor/ckeditor5-table/theme/icons/table-column.svg';
import tableMergeCell from '@ckeditor/ckeditor5-table/theme/icons/table-merge-cell.svg';
import tableCellProperties from '@ckeditor/ckeditor5-table/theme/icons/table-cell-properties.svg';
import tableProperties from '@ckeditor/ckeditor5-table/theme/icons/table-properties.svg';

import nextArrow from '@ckeditor/ckeditor5-core/theme/icons/next-arrow.svg';
import previousArrow from '@ckeditor/ckeditor5-core/theme/icons/previous-arrow.svg';

import loupe from '@ckeditor/ckeditor5-find-and-replace/theme/icons/find-replace.svg';

import '../../theme/ckeditor5-ui/components/editorui/editorui.css';

const icons = {
	// basic-styles
	italic, underline, code, strikethrough, subscript, superscript,

	// core
	...coreIcons,

	// font
	fontFamily, fontSize, fontColor, fontBackground,

	// highlight
	marker, pen,

	// link
	link, unlink,

	// media-embed
	media,

	// page-break
	pageBreak,

	// remove-format
	removeFormat,

	// restricted-editing
	contentLock, contentUnlock,

	// select-all
	selectAll,

	// show-blocks
	showBlocks,

	// source-editing
	sourceEditing,

	// special-characters
	specialCharacters,

	// table
	tableRow,
	tableColumn,
	tableMergeCell,
	tableCellProperties,
	tableProperties,

	// ui
	nextArrow, previousArrow,

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
