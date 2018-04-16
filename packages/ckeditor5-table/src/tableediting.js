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
import { downcastInsertCell, downcastInsertRow, downcastInsertTable, downcastRemoveRow } from './converters/downcast';
import InsertTableCommand from './commands/inserttablecommand';
import InsertRowCommand from './commands/insertrowcommand';
import InsertColumnCommand from './commands/insertcolumncommand';
import { getParentTable } from './commands/utils';

/**
 * The table editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TablesEditing extends Plugin {
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
			isBlock: true,
			isObject: true
		} );

		schema.register( 'tableRow', {
			allowIn: 'table',
			allowAttributes: [],
			isBlock: true,
			isLimit: true
		} );

		schema.register( 'tableCell', {
			allowIn: 'tableRow',
			allowContentOf: '$block',
			allowAttributes: [ 'colspan', 'rowspan' ],
			isBlock: true,
			isLimit: true
		} );

		// Table conversion.
		conversion.for( 'upcast' ).add( upcastTable() );
		conversion.for( 'editingDowncast' ).add( downcastInsertTable( { asWidget: true } ) );
		conversion.for( 'dataDowncast' ).add( downcastInsertTable() );

		// Insert conversion
		conversion.for( 'downcast' ).add( downcastInsertRow() );
		conversion.for( 'downcast' ).add( downcastInsertCell() );

		// Remove row conversion.
		conversion.for( 'downcast' ).add( downcastRemoveRow() );

		// Table cell conversion.
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'td' } ) );
		conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'th' } ) );

		conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
		conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

		editor.commands.add( 'insertTable', new InsertTableCommand( editor ) );
		editor.commands.add( 'insertRow', new InsertRowCommand( editor ) );
		editor.commands.add( 'insertColumn', new InsertColumnCommand( editor ) );

		this.listenTo( editor.editing.view.document, 'keydown', ( ...args ) => this._handleTabOnSelectedTable( ...args ) );
		this.listenTo( editor.editing.view.document, 'keydown', ( ...args ) => this._handleTabInsideTable( ...args ) );
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
			editor.execute( 'insertRow', { at: table.childCount } );
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
