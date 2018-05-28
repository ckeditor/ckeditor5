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
import SetTableHeadersCommand from './commands/settableheaderscommand';
import { getParentTable } from './commands/utils';

import './../theme/table.css';
import TableUtils from './tableutils';

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
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		schema.register( 'table', {
			allowWhere: '$block',
			allowAttributes: [ 'headingRows', 'headingColumns' ],
			isObject: true
		} );

		schema.register( 'tableRow', { allowIn: 'table' } );

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

		// Insert row conversion.
		conversion.for( 'editingDowncast' ).add( downcastInsertRow( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastInsertRow() );

		// Table row conversion.
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableRow', view: 'tr' } ) );
		conversion.for( 'downcast' ).add( downcastRemoveRow() );

		// Table cell conversion.
		conversion.for( 'editingDowncast' ).add( downcastInsertCell( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastInsertCell() );

		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'td' } ) );
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'th' } ) );

		// Table attributes conversion.
		conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
		conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

		conversion.for( 'editingDowncast' ).add( downcastTableHeadingColumnsChange( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastTableHeadingColumnsChange() );
		conversion.for( 'editingDowncast' ).add( downcastTableHeadingRowsChange( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastTableHeadingRowsChange() );

		editor.commands.add( 'insertTable', new InsertTableCommand( editor ) );
		editor.commands.add( 'insertRowAbove', new InsertRowCommand( editor, { order: 'above' } ) );
		editor.commands.add( 'insertRowBelow', new InsertRowCommand( editor, { order: 'below' } ) );
		editor.commands.add( 'insertColumnBefore', new InsertColumnCommand( editor, { order: 'before' } ) );
		editor.commands.add( 'insertColumnAfter', new InsertColumnCommand( editor, { order: 'after' } ) );

		editor.commands.add( 'removeRow', new RemoveRowCommand( editor ) );
		editor.commands.add( 'removeColumn', new RemoveColumnCommand( editor ) );

		editor.commands.add( 'splitCellVertically', new SplitCellCommand( editor, { direction: 'vertically' } ) );
		editor.commands.add( 'splitCellHorizontally', new SplitCellCommand( editor, { direction: 'horizontally' } ) );

		editor.commands.add( 'mergeCellRight', new MergeCellCommand( editor, { direction: 'right' } ) );
		editor.commands.add( 'mergeCellLeft', new MergeCellCommand( editor, { direction: 'left' } ) );
		editor.commands.add( 'mergeCellDown', new MergeCellCommand( editor, { direction: 'down' } ) );
		editor.commands.add( 'mergeCellUp', new MergeCellCommand( editor, { direction: 'up' } ) );

		editor.commands.add( 'setTableHeaders', new SetTableHeadersCommand( editor ) );

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
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events for 'Tab' key executed
	 * when table widget is selected.
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
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events for 'Tab' key executed inside table cell.
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

		const currentRow = table.getChildIndex( tableRow );
		const currentCellIndex = tableRow.getChildIndex( tableCell );

		const isForward = !domEventData.shiftKey;
		const isFirstCellInRow = currentCellIndex === 0;

		if ( !isForward && isFirstCellInRow && currentRow === 0 ) {
			// It's the first cell of a table - don't do anything (stay in current position).
			return;
		}

		const isLastCellInRow = currentCellIndex === tableRow.childCount - 1;
		const isLastRow = currentRow === table.childCount - 1;

		if ( isForward && isLastRow && isLastCellInRow ) {
			editor.plugins.get( TableUtils ).insertRows( table, { at: table.childCount } );
		}

		let moveToCell;

		// Move to first cell in next row.
		if ( isForward && isLastCellInRow ) {
			const nextRow = table.getChild( currentRow + 1 );

			moveToCell = nextRow.getChild( 0 );
		}
		// Move to last cell in a previous row.
		else if ( !isForward && isFirstCellInRow ) {
			const previousRow = table.getChild( currentRow - 1 );

			moveToCell = previousRow.getChild( previousRow.childCount - 1 );
		}
		// Move to next/previous cell.
		else {
			moveToCell = tableRow.getChild( currentCellIndex + ( isForward ? 1 : -1 ) );
		}

		editor.model.change( writer => {
			writer.setSelection( Range.createIn( moveToCell ) );
		} );
	}
}
