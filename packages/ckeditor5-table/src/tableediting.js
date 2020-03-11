/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import upcastTable, { upcastTableCell } from './converters/upcasttable';
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
import { getTableCellsContainingSelection } from './utils';
import TableUtils from '../src/tableutils';

import injectTableLayoutPostFixer from './converters/table-layout-post-fixer';
import injectTableCellParagraphPostFixer from './converters/table-cell-paragraph-post-fixer';
import injectTableCellRefreshPostFixer from './converters/table-cell-refresh-post-fixer';

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
			isLimit: true,
			isObject: true,
			isBlock: true
		} );

		schema.register( 'tableRow', {
			allowIn: 'table',
			isLimit: true
		} );

		schema.register( 'tableCell', {
			allowIn: 'tableRow',
			allowAttributes: [ 'colspan', 'rowspan' ],
			isObject: true
		} );

		// Allow all $block content inside table cell.
		schema.extend( '$block', { allowIn: 'tableCell' } );

		// Disallow table in table.
		schema.addChildCheck( ( context, childDefinition ) => {
			if ( childDefinition.name == 'table' && Array.from( context.getNames() ).includes( 'table' ) ) {
				return false;
			}
		} );

		// Table conversion.
		conversion.for( 'upcast' ).add( upcastTable() );

		conversion.for( 'editingDowncast' ).add( downcastInsertTable( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastInsertTable() );

		// Table row conversion.
		conversion.for( 'upcast' ).elementToElement( { model: 'tableRow', view: 'tr' } );

		conversion.for( 'editingDowncast' ).add( downcastInsertRow( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastInsertRow() );
		conversion.for( 'downcast' ).add( downcastRemoveRow() );

		// Table cell conversion.
		conversion.for( 'upcast' ).add( upcastTableCell( 'td' ) );
		conversion.for( 'upcast' ).add( upcastTableCell( 'th' ) );

		conversion.for( 'editingDowncast' ).add( downcastInsertCell( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastInsertCell() );

		// Table attributes conversion.
		conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
		conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

		// Table heading rows and columns conversion.
		conversion.for( 'editingDowncast' ).add( downcastTableHeadingColumnsChange( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastTableHeadingColumnsChange() );
		conversion.for( 'editingDowncast' ).add( downcastTableHeadingRowsChange( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastTableHeadingRowsChange() );

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

		editor.commands.add( 'mergeTableCellRight', new MergeCellCommand( editor, { direction: 'right' } ) );
		editor.commands.add( 'mergeTableCellLeft', new MergeCellCommand( editor, { direction: 'left' } ) );
		editor.commands.add( 'mergeTableCellDown', new MergeCellCommand( editor, { direction: 'down' } ) );
		editor.commands.add( 'mergeTableCellUp', new MergeCellCommand( editor, { direction: 'up' } ) );

		editor.commands.add( 'setTableColumnHeader', new SetHeaderColumnCommand( editor ) );
		editor.commands.add( 'setTableRowHeader', new SetHeaderRowCommand( editor ) );

		injectTableLayoutPostFixer( model );
		injectTableCellRefreshPostFixer( model );
		injectTableCellParagraphPostFixer( model );

		// Handle Tab key navigation.
		this.editor.keystrokes.set( 'Tab', ( ...args ) => this._handleTabOnSelectedTable( ...args ), { priority: 'low' } );
		this.editor.keystrokes.set( 'Tab', this._getTabHandler( true ), { priority: 'low' } );
		this.editor.keystrokes.set( 'Shift+Tab', this._getTabHandler( false ), { priority: 'low' } );
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
	_handleTabOnSelectedTable( domEventData, cancel ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		if ( !selection.isCollapsed && selection.rangeCount === 1 && selection.getFirstRange().isFlat ) {
			const selectedElement = selection.getSelectedElement();

			if ( !selectedElement || !selectedElement.is( 'table' ) ) {
				return;
			}

			cancel();

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( selectedElement.getChild( 0 ).getChild( 0 ) ) );
			} );
		}
	}

	/**
	 * Returns a handler for {@link module:engine/view/document~Document#event:keydown keydown} events for the <kbd>Tab</kbd> key executed
	 * inside table cell.
	 *
	 * @private
	 * @param {Boolean} isForward Whether this handler will move the selection to the next or the previous cell.
	 */
	_getTabHandler( isForward ) {
		const editor = this.editor;

		return ( domEventData, cancel ) => {
			const selection = editor.model.document.selection;
			const tableCell = getTableCellsContainingSelection( selection )[ 0 ];

			if ( !tableCell ) {
				return;
			}

			cancel();

			const tableRow = tableCell.parent;
			const table = tableRow.parent;

			const currentRowIndex = table.getChildIndex( tableRow );
			const currentCellIndex = tableRow.getChildIndex( tableCell );

			const isFirstCellInRow = currentCellIndex === 0;

			if ( !isForward && isFirstCellInRow && currentRowIndex === 0 ) {
				// It's the first cell of the table - don't do anything (stay in the current position).
				return;
			}

			const isLastCellInRow = currentCellIndex === tableRow.childCount - 1;
			const isLastRow = currentRowIndex === table.childCount - 1;

			if ( isForward && isLastRow && isLastCellInRow ) {
				editor.execute( 'insertTableRowBelow' );

				// Check if the command actually added a row. If `insertTableRowBelow` execution didn't add a row (because it was disabled
				// or it got overwritten) do not change the selection.
				if ( currentRowIndex === table.childCount - 1 ) {
					return;
				}
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
				writer.setSelection( writer.createRangeIn( cellToFocus ) );
			} );
		};
	}
}
