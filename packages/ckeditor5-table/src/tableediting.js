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
import { findAncestor } from './commands/utils';
import TableUtils from '../src/tableutils';

import injectTablePostFixer from './converters/table-post-fixer';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import injectTableCellPostFixer from './converters/tablecell-post-fixer';
import ViewRange from '../../ckeditor5-engine/src/view/range';
import TableWalker from './tablewalker';

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
		const viewDocument = editor.editing.view.document;

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
			allowAttributes: [ 'colspan', 'rowspan' ],
			isLimit: true
		} );

		// Allow all $block content inside table cell.
		schema.extend( '$block', { allowIn: 'tableCell' } );

		// Disallow table in table.
		schema.addChildCheck( ( context, childDefinition ) => {
			if ( childDefinition.name == 'table' && Array.from( context.getNames() ).includes( 'table' ) ) {
				return false;
			}
		} );

		// Disallow image in table cell.
		schema.addChildCheck( ( context, childDefinition ) => {
			if ( childDefinition.name == 'image' && Array.from( context.getNames() ).includes( 'table' ) ) {
				return false;
			}
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
		conversion.for( 'upcast' ).add( upcastTableCell( 'td' ) );
		conversion.for( 'upcast' ).add( upcastTableCell( 'th' ) );

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

		injectTableCellPostFixer( editor.model, editor.editing );

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

		injectTablePostFixer( model );

		// Handle tab key navigation.
		this.editor.keystrokes.set( 'Tab', ( ...args ) => this._handleTabOnSelectedTable( ...args ), { priority: 'low' } );
		this.editor.keystrokes.set( 'Tab', this._getTabHandler( true ), { priority: 'low' } );
		this.editor.keystrokes.set( 'Shift+Tab', this._getTabHandler( false ), { priority: 'low' } );

		const selected = new Set();

		const tableUtils = editor.plugins.get( TableUtils );
		const tableSelection = new TableSelection( editor, tableUtils );

		this.listenTo( viewDocument, 'mousedown', ( eventInfo, domEventData ) => {
			const tableCell = getTableCell( domEventData, this.editor );

			if ( !tableCell ) {
				return;
			}

			const { column, row } = tableUtils.getCellLocation( tableCell );

			const mode = getSelectionMode( domEventData, column, row );

			tableSelection.startSelection( tableCell, mode );

			domEventData.preventDefault();
		} );

		this.listenTo( viewDocument, 'mousemove', ( eventInfo, domEventData ) => {
			if ( !tableSelection.isSelecting ) {
				return;
			}

			const tableCell = getTableCell( domEventData, this.editor );

			if ( !tableCell ) {
				return;
			}

			tableSelection.updateSelection( tableCell );
		} );

		this.listenTo( viewDocument, 'mouseup', ( eventInfo, domEventData ) => {
			if ( !tableSelection.isSelecting ) {
				return;
			}

			const tableCell = getTableCell( domEventData, this.editor );

			tableSelection.stopSelection( tableCell );
		} );

		this.listenTo( viewDocument, 'blur', () => {
			tableSelection.clearSelection();
		} );

		viewDocument.selection.on( 'change', () => {
			for ( const range of viewDocument.selection.getRanges() ) {
				const node = range.start.nodeAfter;

				if ( node && ( node.is( 'td' ) || node.is( 'th' ) ) ) {
					editor.editing.view.change( writer => writer.addClass( 'selected', node ) );
					selected.add( node );
				}
			}
		} );
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
				writer.setSelection( Range.createIn( selectedElement.getChild( 0 ).getChild( 0 ) ) );
			} );
		}
	}

	/**
	 * Returns a handler for {@link module:engine/view/document~Document#event:keydown keydown} events for the <kbd>Tab</kbd> key executed
	 * inside table cell.
	 *
	 * @private
	 * @param {Boolean} isForward Whether this handler will move selection to the next cell or previous.
	 */
	_getTabHandler( isForward ) {
		const editor = this.editor;

		return ( domEventData, cancel ) => {
			const selection = editor.model.document.selection;

			const firstPosition = selection.getFirstPosition();

			const tableCell = findAncestor( 'tableCell', firstPosition );

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
		};
	}
}

class TableSelection {
	constructor( editor, tableUtils ) {
		// block | column | row
		this._mode = 'block';
		this._isSelecting = false;
		this._highlighted = new Set();

		this.editor = editor;
		this.tableUtils = tableUtils;
	}

	get isSelecting() {
		return this._isSelecting;
	}

	startSelection( tableCell, mode = 'block' ) {
		this.clearSelection();
		this._isSelecting = true;
		this._startElement = tableCell;
		this._endElement = tableCell;
		this._mode = mode;
		this._redrawSelection();
	}

	updateSelection( tableCell ) {
		if ( tableCell && tableCell.parent.parent === this._startElement.parent.parent ) {
			this._endElement = tableCell;
		}
		this._redrawSelection();
	}

	stopSelection( tableCell ) {
		this._isSelecting = false;

		if ( tableCell && tableCell.parent.parent === this._startElement.parent.parent ) {
			this._endElement = tableCell;
		}

		this._redrawSelection();
	}

	clearSelection() {
		this._startElement = undefined;
		this._endElement = undefined;
		this._isSelecting = false;
		this.updateSelection();
		this._highlighted.clear();
	}

	* getSelection() {
		if ( !this._startElement || !this._endElement ) {
			return [];
		}

		// return selection according to the mode
		if ( this._mode == 'block' ) {
			yield* this._getBlockSelection();
		}

		if ( this._mode == 'row' ) {
			yield* this._getRowSelection();
		}

		if ( this._mode == 'column' ) {
			yield* this._getColumnSelection();
		}

		return [];
	}

	* _getBlockSelection() {
		const startLocation = this.tableUtils.getCellLocation( this._startElement );
		const endLocation = this.tableUtils.getCellLocation( this._endElement );

		const startRow = startLocation.row > endLocation.row ? endLocation.row : startLocation.row;
		const endRow = startLocation.row > endLocation.row ? startLocation.row : endLocation.row;

		const startColumn = startLocation.column > endLocation.column ? endLocation.column : startLocation.column;
		const endColumn = startLocation.column > endLocation.column ? startLocation.column : endLocation.column;

		for ( const cellInfo of new TableWalker( this._startElement.parent.parent, { startRow, endRow } ) ) {
			if ( cellInfo.column >= startColumn && cellInfo.column <= endColumn ) {
				yield cellInfo.cell;
			}
		}
	}

	* _getRowSelection() {
		const startLocation = this.tableUtils.getCellLocation( this._startElement );
		const endLocation = this.tableUtils.getCellLocation( this._endElement );

		const startRow = startLocation.row > endLocation.row ? endLocation.row : startLocation.row;
		const endRow = startLocation.row > endLocation.row ? startLocation.row : endLocation.row;

		for ( const cellInfo of new TableWalker( this._startElement.parent.parent, { startRow, endRow } ) ) {
			yield cellInfo.cell;
		}
	}

	* _getColumnSelection() {
		const startLocation = this.tableUtils.getCellLocation( this._startElement );
		const endLocation = this.tableUtils.getCellLocation( this._endElement );

		const startColumn = startLocation.column > endLocation.column ? endLocation.column : startLocation.column;
		const endColumn = startLocation.column > endLocation.column ? startLocation.column : endLocation.column;

		for ( const cellInfo of new TableWalker( this._startElement.parent.parent ) ) {
			if ( cellInfo.column >= startColumn && cellInfo.column <= endColumn ) {
				yield cellInfo.cell;
			}
		}
	}

	_redrawSelection() {
		const viewRanges = [];

		const selected = [ ...this.getSelection() ];
		const previous = [ ...this._highlighted.values() ];

		this._highlighted.clear();

		for ( const tableCell of selected ) {
			const viewElement = this.editor.editing.mapper.toViewElement( tableCell );
			viewRanges.push( ViewRange.createOn( viewElement ) );

			this._highlighted.add( viewElement );
		}

		this.editor.editing.view.change( writer => {
			for ( const previouslyHighlighted of previous ) {
				if ( !selected.includes( previouslyHighlighted ) ) {
					writer.removeClass( 'selected', previouslyHighlighted );
				}
			}

			writer.setSelection( viewRanges, { fake: true, label: 'fake selection over table cell' } );
		} );
	}
}

function getTableCell( domEventData, editor ) {
	const element = domEventData.target;
	const modelElement = editor.editing.mapper.toModelElement( element );

	if ( !modelElement ) {
		return;
	}

	return getParentElement( 'tableCell', Position.createAt( modelElement ) );
}

function getSelectionMode( domEventData, column, row ) {
	let mode = 'block';

	const domEvent = domEventData.domEvent;
	const target = domEvent.target;

	if ( column == 0 && domEvent.offsetX < target.clientWidth / 2 ) {
		mode = 'row';
	} else if ( row == 0 && ( domEvent.offsetY < target.clientHeight / 2 ) ) {
		mode = 'column';
	}

	return mode;
}
