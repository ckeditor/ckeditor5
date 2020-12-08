/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import upcastTable, { skipEmptyTableRow } from './converters/upcasttable';
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
			allowAttributes: [ 'colspan', 'rowspan' ],
			isLimit: true,
			isSelectable: true
		} );

		// Allow all $block content inside a table cell.
		schema.extend( '$block', { allowIn: 'tableCell' } );

		// Disallow a table in a table.
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
		conversion.for( 'upcast' ).add( skipEmptyTableRow() );

		conversion.for( 'editingDowncast' ).add( downcastInsertRow() );
		conversion.for( 'editingDowncast' ).add( downcastRemoveRow() );

		// Table cell conversion.
		conversion.for( 'upcast' ).elementToElement( { model: 'tableCell', view: 'td' } );
		conversion.for( 'upcast' ).elementToElement( { model: 'tableCell', view: 'th' } );

		conversion.for( 'editingDowncast' ).add( downcastInsertCell() );

		// Duplicates code - needed to properly refresh paragraph inside a table cell.
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'paragraph',
			view: convertParagraphInTableCell,
			converterPriority: 'high'
		} );

		// Table attributes conversion.
		conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
		conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

		// Table heading columns conversion (a change of heading rows requires a reconversion of the whole table).
		conversion.for( 'editingDowncast' ).add( downcastTableHeadingColumnsChange() );

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
