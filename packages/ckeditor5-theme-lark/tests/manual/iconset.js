/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';

import alignLeft from '@ckeditor/ckeditor5-alignment/theme/icons/align-left.svg';
import alignCenter from '@ckeditor/ckeditor5-alignment/theme/icons/align-center.svg';
import alignRight from '@ckeditor/ckeditor5-alignment/theme/icons/align-right.svg';
import alignJustify from '@ckeditor/ckeditor5-alignment/theme/icons/align-justify.svg';

import bold from '@ckeditor/ckeditor5-basic-styles/theme/icons/bold.svg';
import italic from '@ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg';
import underline from '@ckeditor/ckeditor5-basic-styles/theme/icons/underline.svg';
import code from '@ckeditor/ckeditor5-basic-styles/theme/icons/code.svg';
import strikethrough from '@ckeditor/ckeditor5-basic-styles/theme/icons/strikethrough.svg';

import cancel from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';
import check from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import lowVision from '@ckeditor/ckeditor5-core/theme/icons/low-vision.svg';
import image from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import objectLeft from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import objectCenter from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import objectRight from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';
import objectFullWidth from '@ckeditor/ckeditor5-core/theme/icons/object-full-width.svg';
import pencil from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';
import quote from '@ckeditor/ckeditor5-core/theme/icons/quote.svg';

import fontFamily from '@ckeditor/ckeditor5-font/theme/icons/font-family.svg';
import fontSize from '@ckeditor/ckeditor5-font/theme/icons/font-size.svg';

import marker from '@ckeditor/ckeditor5-highlight/theme/icons/marker.svg';
import pen from '@ckeditor/ckeditor5-highlight/theme/icons/pen.svg';
import eraser from '@ckeditor/ckeditor5-highlight/theme/icons/eraser.svg';

import link from '@ckeditor/ckeditor5-link/theme/icons/link.svg';
import unlink from '@ckeditor/ckeditor5-link/theme/icons/unlink.svg';

import bulletedList from '@ckeditor/ckeditor5-list/theme/icons/bulletedlist.svg';
import numberedList from '@ckeditor/ckeditor5-list/theme/icons/numberedlist.svg';

import table from '@ckeditor/ckeditor5-table/theme/icons/table.svg';
import tableRow from '@ckeditor/ckeditor5-table/theme/icons/table-row.svg';
import tableColumn from '@ckeditor/ckeditor5-table/theme/icons/table-column.svg';
import tableMergeCell from '@ckeditor/ckeditor5-table/theme/icons/table-merge-cell.svg';
import tableSplitCell from '@ckeditor/ckeditor5-table/theme/icons/table-split-cell.svg';
import tableHeaders from '@ckeditor/ckeditor5-table/theme/icons/table-headers.svg';

import undo from '@ckeditor/ckeditor5-undo/theme/icons/undo.svg';
import redo from '@ckeditor/ckeditor5-undo/theme/icons/redo.svg';

import '../../theme/ckeditor5-ui/components/editorui/editorui.css';

const icons = {
	// alignment
	alignLeft, alignCenter, alignRight, alignJustify,

	// basic-styles
	bold, italic, underline, code, strikethrough,

	// core
	check, cancel, lowVision, quote, image, objectLeft, objectCenter, objectRight, objectFullWidth, pencil,

	// font
	fontFamily, fontSize,

	// highlight
	marker, pen, eraser,

	// link
	link, unlink,

	// list
	bulletedList, numberedList,

	// table
	table, tableRow, tableColumn, tableMergeCell, tableSplitCell, tableHeaders,

	// undo
	undo, redo
};

const toolbar = new ToolbarView();

for ( const i in icons ) {
	const button = new ButtonView();

	button.set( {
		label: i,
		icon: icons[ i ],
		tooltip: true
	} );

	button.iconView.fillColor = '#FFDA51';

	toolbar.items.add( button );
}

toolbar.className = 'ck-editor-toolbar ck-reset_all';
toolbar.render();

document.body.appendChild( toolbar.element );
