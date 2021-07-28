/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableediting
 */

import { Plugin } from 'ckeditor5/src/core';

import upcastTable, { ensureParagraphInTableCell, skipEmptyTableRow, upcastTableFigure } from './converters/upcasttable';
import {
	convertParagraphInTableCell,
	downcastInsertCell,
	downcastInsertRow,
	downcastInsertTable,
	downcastRemoveRow,
	downcastTableHeadingColumnsChange
} from './converters/downcast';

import InsertTableCommand from './commands/inserttablecommand';
import InsertRowCommand from './commands/insertrowcommand';
import InsertColumnCommand from './commands/insertcolumncommand';
import SplitCellCommand from './commands/splitcellcommand';
import MergeCellCommand from './commands/mergecellcommand';
import RemoveRowCommand from './commands/removerowcommand';
import RemoveColumnCommand from './commands/removecolumncommand';
import SetHeaderRowCommand from './commands/setheaderrowcommand';
import SetHeaderColumnCommand from './commands/setheadercolumncommand';
import MergeCellsCommand from './commands/mergecellscommand';
import SelectRowCommand from './commands/selectrowcommand';
import SelectColumnCommand from './commands/selectcolumncommand';
import TableUtils from '../src/tableutils';

import injectTableLayoutPostFixer from './converters/table-layout-post-fixer';
import injectTableCellParagraphPostFixer from './converters/table-cell-paragraph-post-fixer';
import injectTableCellRefreshPostFixer from './converters/table-cell-refresh-post-fixer';
import injectTableHeadingRowsRefreshPostFixer from './converters/table-heading-rows-refresh-post-fixer';

import '../theme/tableediting.css';

/**
 * The table editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const conversion = editor.conversion;

		schema.register( 'table', {
			allowWhere: '$block',
			allowAttributes: [ 'headingRows', 'headingColumns' ],
			isObject: true,
			isBlock: true
		} );

		schema.register( 'tableRow', {
			allowIn: 'table',
			isLimit: true
		} );

		schema.register( 'tableCell', {
			allowIn: 'tableRow',
			allowChildren: '$block',
			allowAttributes: [ 'colspan', 'rowspan' ],
			isLimit: true,
			isSelectable: true
		} );

		// Figure conversion.
		conversion.for( 'upcast' ).add( upcastTableFigure() );

		// Table conversion.
		conversion.for( 'upcast' ).add( upcastTable() );

		conversion.for( 'editingDowncast' ).add( downcastInsertTable( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastInsertTable() );

		// Table row conversion.
		conversion.for( 'upcast' ).elementToElement( { model: 'tableRow', view: 'tr' } );
		conversion.for( 'upcast' ).add( skipEmptyTableRow() );

		conversion.for( 'editingDowncast' ).add( downcastInsertRow() );
		conversion.for( 'editingDowncast' ).add( downcastRemoveRow() );

		// Table cell conversion.
		conversion.for( 'upcast' ).elementToElement( { model: 'tableCell', view: 'td' } );
		conversion.for( 'upcast' ).elementToElement( { model: 'tableCell', view: 'th' } );
		conversion.for( 'upcast' ).add( ensureParagraphInTableCell( 'td' ) );
		conversion.for( 'upcast' ).add( ensureParagraphInTableCell( 'th' ) );

		conversion.for( 'editingDowncast' ).add( downcastInsertCell() );

		// Duplicates code - needed to properly refresh paragraph inside a table cell.
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'paragraph',
			view: convertParagraphInTableCell,
			converterPriority: 'high'
		} );

		// Table attributes conversion.
		conversion.for( 'downcast' ).attributeToAttribute( { model: 'colspan', view: 'colspan' } );
		conversion.for( 'upcast' ).attributeToAttribute( {
			model: { key: 'colspan', value: upcastCellSpan( 'colspan' ) },
			view: 'colspan'
		} );

		conversion.for( 'downcast' ).attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
		conversion.for( 'upcast' ).attributeToAttribute( {
			model: { key: 'rowspan', value: upcastCellSpan( 'rowspan' ) },
			view: 'rowspan'
		} );

		// Table heading columns conversion (a change of heading rows requires a reconversion of the whole table).
		conversion.for( 'editingDowncast' ).add( downcastTableHeadingColumnsChange() );

		// Manually adjust model position mappings in a special case, when a table cell contains a paragraph, which is bound
		// to its parent (to the table cell). This custom model-to-view position mapping is necessary in data pipeline only,
		// because only during this conversion a paragraph can be bound to its parent.
		editor.data.mapper.on( 'modelToViewPosition', mapTableCellModelPositionToView() );

		// Define the config.
		editor.config.define( 'table.defaultHeadings.rows', 0 );
		editor.config.define( 'table.defaultHeadings.columns', 0 );

		// Define all the commands.
		editor.commands.add( 'insertTable', new InsertTableCommand( editor ) );
		editor.commands.add( 'insertTableRowAbove', new InsertRowCommand( editor, { order: 'above' } ) );
		editor.commands.add( 'insertTableRowBelow', new InsertRowCommand( editor, { order: 'below' } ) );
		editor.commands.add( 'insertTableColumnLeft', new InsertColumnCommand( editor, { order: 'left' } ) );
		editor.commands.add( 'insertTableColumnRight', new InsertColumnCommand( editor, { order: 'right' } ) );

		editor.commands.add( 'removeTableRow', new RemoveRowCommand( editor ) );
		editor.commands.add( 'removeTableColumn', new RemoveColumnCommand( editor ) );

		editor.commands.add( 'splitTableCellVertically', new SplitCellCommand( editor, { direction: 'vertically' } ) );
		editor.commands.add( 'splitTableCellHorizontally', new SplitCellCommand( editor, { direction: 'horizontally' } ) );

		editor.commands.add( 'mergeTableCells', new MergeCellsCommand( editor ) );

		editor.commands.add( 'mergeTableCellRight', new MergeCellCommand( editor, { direction: 'right' } ) );
		editor.commands.add( 'mergeTableCellLeft', new MergeCellCommand( editor, { direction: 'left' } ) );
		editor.commands.add( 'mergeTableCellDown', new MergeCellCommand( editor, { direction: 'down' } ) );
		editor.commands.add( 'mergeTableCellUp', new MergeCellCommand( editor, { direction: 'up' } ) );

		editor.commands.add( 'setTableColumnHeader', new SetHeaderColumnCommand( editor ) );
		editor.commands.add( 'setTableRowHeader', new SetHeaderRowCommand( editor ) );

		editor.commands.add( 'selectTableRow', new SelectRowCommand( editor ) );
		editor.commands.add( 'selectTableColumn', new SelectColumnCommand( editor ) );

		injectTableHeadingRowsRefreshPostFixer( model );
		injectTableLayoutPostFixer( model );
		injectTableCellRefreshPostFixer( model, editor.editing.mapper );
		injectTableCellParagraphPostFixer( model );
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableUtils ];
	}
}

// Creates a mapper callback to adjust model position mappings in a table cell containing a paragraph, which is bound to its parent
// (to the table cell). Only positions after this paragraph have to be adjusted, because after binding this paragraph to the table cell,
// elements located after this paragraph would point either to a non-existent offset inside `tableCell` (if paragraph is empty), or after
// the first character of the paragraph's text. See https://github.com/ckeditor/ckeditor5/issues/10116.
//
// <tableCell><paragraph></paragraph>^</tableCell> -> <td>^&nbsp;</td>
//
// <tableCell><paragraph>foobar</paragraph>^</tableCell> -> <td>foobar^</td>
//
// @returns {Function}
function mapTableCellModelPositionToView() {
	return ( evt, data ) => {
		const modelParent = data.modelPosition.parent;
		const modelNodeBefore = data.modelPosition.nodeBefore;

		if ( !modelParent.is( 'element', 'tableCell' ) ) {
			return;
		}

		if ( !modelNodeBefore || !modelNodeBefore.is( 'element', 'paragraph' ) ) {
			return;
		}

		const viewNodeBefore = data.mapper.toViewElement( modelNodeBefore );
		const viewParent = data.mapper.toViewElement( modelParent );

		if ( viewNodeBefore === viewParent ) {
			// Since the paragraph has already been bound to its parent, update the current position in the model with paragraph's
			// max offset, so it points to the place which should normally (in all other cases) be the end position of this paragraph.
			data.viewPosition = data.mapper.findPositionIn( viewParent, modelNodeBefore.maxOffset );
		}
	};
}

// Returns fixed colspan and rowspan attrbutes values.
//
// @private
// @param {String} type colspan or rowspan.
// @returns {Function} conversion value function.
function upcastCellSpan( type ) {
	return cell => {
		const span = parseInt( cell.getAttribute( type ) );

		if ( Number.isNaN( span ) || span <= 0 ) {
			return null;
		}

		return span;
	};
}
