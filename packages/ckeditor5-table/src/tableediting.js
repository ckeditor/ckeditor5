/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import upcastTable from './converters/upcasttable';
import {
	downcastInsertCell,
	downcastInsertRow,
	downcastInsertTable,
	downcastRemoveRow,
	downcastTableHeadingColumnsChange,
	downcastTableHeadingRowsChange
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
import { getParentTable, updateNumericAttribute } from './commands/utils';
import TableWalker from './tablewalker';
import TableUtils from '../src/tableutils';

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
	init() {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const conversion = editor.conversion;

		schema.register( 'table', {
			allowWhere: '$block',
			allowAttributes: [ 'headingRows', 'headingColumns' ],
			isLimit: true,
			isObject: true
		} );

		schema.register( 'tableRow', {
			allowIn: 'table',
			isLimit: true
		} );

		schema.register( 'tableCell', {
			allowIn: 'tableRow',
			allowContentOf: '$block',
			allowAttributes: [ 'colspan', 'rowspan' ],
			isLimit: true
		} );

		// Table conversion.
		conversion.for( 'upcast' ).add( upcastTable() );

		conversion.for( 'editingDowncast' ).add( downcastInsertTable( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastInsertTable() );

		// Table row conversion.
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableRow', view: 'tr' } ) );

		conversion.for( 'editingDowncast' ).add( downcastInsertRow( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastInsertRow() );
		conversion.for( 'downcast' ).add( downcastRemoveRow() );

		// Table cell conversion.
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'td' } ) );
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'th' } ) );

		conversion.for( 'editingDowncast' ).add( downcastInsertCell( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastInsertCell() );

		// Table attributes conversion.
		conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
		conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

		// Table heading rows and cols conversion.
		conversion.for( 'editingDowncast' ).add( downcastTableHeadingColumnsChange( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastTableHeadingColumnsChange() );
		conversion.for( 'editingDowncast' ).add( downcastTableHeadingRowsChange( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastTableHeadingRowsChange() );

		// Define all the commands.
		editor.commands.add( 'insertTable', new InsertTableCommand( editor ) );
		editor.commands.add( 'insertTableRowAbove', new InsertRowCommand( editor, { order: 'above' } ) );
		editor.commands.add( 'insertTableRowBelow', new InsertRowCommand( editor, { order: 'below' } ) );
		editor.commands.add( 'insertTableColumnBefore', new InsertColumnCommand( editor, { order: 'before' } ) );
		editor.commands.add( 'insertTableColumnAfter', new InsertColumnCommand( editor, { order: 'after' } ) );

		editor.commands.add( 'removeTableRow', new RemoveRowCommand( editor ) );
		editor.commands.add( 'removeTableColumn', new RemoveColumnCommand( editor ) );

		editor.commands.add( 'splitTableCellVertically', new SplitCellCommand( editor, { direction: 'vertically' } ) );
		editor.commands.add( 'splitTableCellHorizontally', new SplitCellCommand( editor, { direction: 'horizontally' } ) );

		editor.commands.add( 'mergeTableCellRight', new MergeCellCommand( editor, { direction: 'right' } ) );
		editor.commands.add( 'mergeTableCellLeft', new MergeCellCommand( editor, { direction: 'left' } ) );
		editor.commands.add( 'mergeTableCellDown', new MergeCellCommand( editor, { direction: 'down' } ) );
		editor.commands.add( 'mergeTableCellUp', new MergeCellCommand( editor, { direction: 'up' } ) );

		editor.commands.add( 'setTableColumnHeader', new SetHeaderColumnCommand( editor ) );
		editor.commands.add( 'setTableRowHeader', new SetHeaderRowCommand( editor ) );

		injectTablePostFixer( model, this.editor.plugins.get( TableUtils ) );

		// Handle tab key navigation.
		this.listenTo( editor.editing.view.document, 'keydown', ( ...args ) => this._handleTabOnSelectedTable( ...args ) );
		this.listenTo( editor.editing.view.document, 'keydown', ( ...args ) => this._handleTabInsideTable( ...args ) );
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableUtils ];
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events for the <kbd>Tab</kbd> key executed
	 * when the table widget is selected.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_handleTabOnSelectedTable( eventInfo, domEventData ) {
		const tabPressed = domEventData.keyCode == keyCodes.tab;

		// Act only on TAB & SHIFT-TAB - Do not override native CTRL+TAB handler.
		if ( !tabPressed || domEventData.ctrlKey ) {
			return;
		}

		const editor = this.editor;
		const selection = editor.model.document.selection;

		if ( !selection.isCollapsed && selection.rangeCount === 1 && selection.getFirstRange().isFlat ) {
			const selectedElement = selection.getSelectedElement();

			if ( !selectedElement || selectedElement.name != 'table' ) {
				return;
			}

			eventInfo.stop();
			domEventData.preventDefault();
			domEventData.stopPropagation();

			editor.model.change( writer => {
				writer.setSelection( Range.createIn( selectedElement.getChild( 0 ).getChild( 0 ) ) );
			} );
		}
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events for the <kbd>Tab</kbd> key executed inside table
	 * cell.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_handleTabInsideTable( eventInfo, domEventData ) {
		const tabPressed = domEventData.keyCode == keyCodes.tab;

		// Act only on TAB & SHIFT-TAB - Do not override native CTRL+TAB handler.
		if ( !tabPressed || domEventData.ctrlKey ) {
			return;
		}

		const editor = this.editor;
		const selection = editor.model.document.selection;

		const table = getParentTable( selection.getFirstPosition() );

		if ( !table ) {
			return;
		}

		domEventData.preventDefault();
		domEventData.stopPropagation();

		const tableCell = selection.focus.parent;
		const tableRow = tableCell.parent;

		const currentRowIndex = table.getChildIndex( tableRow );
		const currentCellIndex = tableRow.getChildIndex( tableCell );

		const isForward = !domEventData.shiftKey;
		const isFirstCellInRow = currentCellIndex === 0;

		if ( !isForward && isFirstCellInRow && currentRowIndex === 0 ) {
			// It's the first cell of a table - don't do anything (stay in current position).
			return;
		}

		const isLastCellInRow = currentCellIndex === tableRow.childCount - 1;
		const isLastRow = currentRowIndex === table.childCount - 1;

		if ( isForward && isLastRow && isLastCellInRow ) {
			editor.plugins.get( TableUtils ).insertRows( table, { at: table.childCount } );
		}

		let cellToFocus;

		// Move to first cell in next row.
		if ( isForward && isLastCellInRow ) {
			const nextRow = table.getChild( currentRowIndex + 1 );

			cellToFocus = nextRow.getChild( 0 );
		}
		// Move to last cell in a previous row.
		else if ( !isForward && isFirstCellInRow ) {
			const previousRow = table.getChild( currentRowIndex - 1 );

			cellToFocus = previousRow.getChild( previousRow.childCount - 1 );
		}
		// Move to next/previous cell.
		else {
			cellToFocus = tableRow.getChild( currentCellIndex + ( isForward ? 1 : -1 ) );
		}

		editor.model.change( writer => {
			writer.setSelection( Range.createIn( cellToFocus ) );
		} );
	}
}

function injectTablePostFixer( model, tableUtils ) {
	model.document.registerPostFixer( writer => tablePostFixer( writer, model, tableUtils ) );
}

function tablePostFixer( writer, model, tableUtils ) {
	const changes = model.document.differ.getChanges();

	let wasFixed = false;

	for ( const entry of changes ) {
		let table;

		if ( entry.name == 'table' ) {
			table = entry.position.nodeAfter;
		}

		if ( entry.name == 'tableRow' ) {
			const tableRow = entry.position.nodeAfter;
			table = tableRow.parent;
		}

		if ( entry.name == 'tableCell' ) {
			const tableRow = entry.position.parent;

			table = tableRow.parent;
		}

		if ( table ) {
			wasFixed = makeTableRowsSameLength( tableUtils, table, writer );
		}
	}

	return wasFixed;
}

function getRowsLengths( table ) {
	const lengths = {};

	const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );

	const cellsToTrim = [];

	for ( const data of new TableWalker( table ) ) {
		const row = data.row;
		const column = data.column;
		const colspan = data.colspan;
		const rowspan = data.rowspan;

		if ( !lengths[ row ] ) {
			// Le first row - the first column will be current width including rowspanned cells.
			lengths[ row ] = column;
		}

		lengths[ row ] += colspan;

		const maxRows = table.childCount;

		if ( headingRows > row ) {
			if ( row + rowspan > headingRows ) {
				const newRowspan = headingRows - row;

				cellsToTrim.push( { cell: data.cell, rowspan: newRowspan } );
			}
		} else {
			if ( row + rowspan + headingRows > maxRows ) {
				const newRowspan = maxRows - row - headingRows + 1;

				cellsToTrim.push( { cell: data.cell, rowspan: newRowspan } );
			}
		}
	}

	return { lengths, cellsToTrim };
}

function makeTableRowsSameLength( tableUtils, table, writer ) {
	let wasFixed = false;

	const tableSize = tableUtils.getColumns( table );

	const { lengths, cellsToTrim } = getRowsLengths( table );

	const isValid = Object.values( lengths ).every( length => length === tableSize );

	if ( !isValid ) {
		const maxColumns = Object.values( lengths ).reduce( ( prev, current ) => current > prev ? current : prev, 0 );

		for ( const [ rowIndex, size ] of Object.entries( lengths ) ) {
			const columnsToInsert = maxColumns - size;

			if ( columnsToInsert ) {
				for ( let i = 0; i < columnsToInsert; i++ ) {
					writer.insertElement( 'tableCell', Position.createAt( table.getChild( rowIndex ), 'end' ) );
				}

				wasFixed = true;
			}
		}
	}

	if ( cellsToTrim.length ) {
		for ( const data of cellsToTrim ) {
			updateNumericAttribute( 'rowspan', data.rowspan, data.cell, writer, 1 );
		}
	}

	return wasFixed;
}
