/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

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

		this.listenTo( editor.editing.view.document, 'keydown', ( evt, data ) => {
			const tabPressed = data.keyCode == keyCodes.tab;

			// Act only on TAB & SHIFT-TAB - Do not override native CTRL+TAB handler.
			if ( !tabPressed || data.ctrlKey ) {
				return;
			}

			const selection = editor.model.document.selection;

			const table = getParentTable( selection.getFirstPosition() );

			if ( !table ) {
				return;
			}

			data.preventDefault();
			data.stopPropagation();

			const tableCell = selection.focus.parent;
			const tableRow = tableCell.parent;

			const rowIndex = table.getChildIndex( tableRow );
			const cellIndex = tableRow.getChildIndex( tableCell );

			const isForward = !data.shiftKey;

			if ( !isForward && cellIndex === 0 && rowIndex === 0 ) {
				// It's the first cell of a table - don't do anything (stay in current position).
				return;
			}

			const indexOfLastCellInRow = tableRow.childCount - 1;

			if ( isForward && rowIndex === table.childCount - 1 && cellIndex === indexOfLastCellInRow ) {
				// It's a last table cell in a table - so create a new row at table's end.
				editor.execute( 'insertRow', { at: table.childCount } );
			}

			let moveToCell;

			if ( isForward && cellIndex === indexOfLastCellInRow ) {
				// Move to first cell in next row.
				const nextRow = table.getChild( rowIndex + 1 );

				moveToCell = nextRow.getChild( 0 );
			} else if ( !isForward && cellIndex === 0 ) {
				// Move to last cell in a previous row.
				const prevRow = table.getChild( rowIndex - 1 );

				moveToCell = prevRow.getChild( prevRow.childCount - 1 );
			} else {
				// Move to next/previous cell otherwise.
				moveToCell = tableRow.getChild( cellIndex + ( isForward ? 1 : -1 ) );
			}

			editor.model.change( writer => {
				writer.setSelection( Position.createAt( moveToCell ) );
			} );
		} );
	}
}
