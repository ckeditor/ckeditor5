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

			if ( !tabPressed ) {
				return;
			}

			const doc = editor.model.document;
			const selection = doc.selection;

			const table = getParentTable( selection.getFirstPosition() );

			if ( !table ) {
				return;
			}

			const tableCell = selection.focus.parent;
			const tableRow = tableCell.parent;
			const rowIndex = table.getChildIndex( tableRow );

			data.preventDefault();
			data.stopPropagation();

			const rowChildrenCount = tableRow.childCount;

			const isLastTableCell = tableCell === tableRow.getChild( rowChildrenCount - 1 );

			if ( rowIndex === table.childCount - 1 && isLastTableCell ) {
				// It's a last table cell in a table - create row
				editor.execute( 'insertRow', { at: rowChildrenCount - 1 } );
			}

			// go to next cell
			const cellIndex = tableRow.getChildIndex( tableCell );

			let moveTo;

			if ( cellIndex === rowChildrenCount - 1 ) {
				const nextRow = table.getChild( rowIndex + 1 );

				moveTo = Position.createAt( nextRow.getChild( 0 ) );
			} else {
				moveTo = Position.createAt( tableRow.getChild( cellIndex + 1 ) );
			}

			editor.model.change( writer => {
				writer.setSelection( moveTo );
			} );
		} );
	}
}
