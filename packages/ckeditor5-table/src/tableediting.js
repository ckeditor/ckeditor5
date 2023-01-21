/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableediting
 */

import { Plugin } from 'ckeditor5/src/core';

import upcastTable, { ensureParagraphInTableCell, skipEmptyTableRow, upcastTableFigure } from './converters/upcasttable';
import { convertParagraphInTableCell, downcastCell, downcastRow, downcastTable } from './converters/downcast';

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

import tableHeadingsRefreshHandler from './converters/table-headings-refresh-handler';
import tableCellRefreshHandler from './converters/table-cell-refresh-handler';

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
	static get requires() {
		return [ TableUtils ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const conversion = editor.conversion;
		const tableUtils = editor.plugins.get( TableUtils );

		schema.register( 'table', {
			inheritAllFrom: '$blockObject',
			allowAttributes: [ 'headingRows', 'headingColumns' ]
		} );

		schema.register( 'tableRow', {
			allowIn: 'table',
			isLimit: true
		} );

		schema.register( 'tableCell', {
			allowContentOf: '$container',
			allowIn: 'tableRow',
			allowAttributes: [ 'colspan', 'rowspan' ],
			isLimit: true,
			isSelectable: true
		} );

		// Figure conversion.
		conversion.for( 'upcast' ).add( upcastTableFigure() );

		// Table conversion.
		conversion.for( 'upcast' ).add( upcastTable() );

		conversion.for( 'editingDowncast' ).elementToStructure( {
			model: {
				name: 'table',
				attributes: [ 'headingRows' ]
			},
			view: downcastTable( tableUtils, { asWidget: true } )
		} );
		conversion.for( 'dataDowncast' ).elementToStructure( {
			model: {
				name: 'table',
				attributes: [ 'headingRows' ]
			},
			view: downcastTable( tableUtils )
		} );

		// Table row conversion.
		conversion.for( 'upcast' ).elementToElement( { model: 'tableRow', view: 'tr' } );
		conversion.for( 'upcast' ).add( skipEmptyTableRow() );

		conversion.for( 'downcast' ).elementToElement( {
			model: 'tableRow',
			view: downcastRow()
		} );

		// Table cell conversion.
		conversion.for( 'upcast' ).elementToElement( { model: 'tableCell', view: 'td' } );
		conversion.for( 'upcast' ).elementToElement( { model: 'tableCell', view: 'th' } );
		conversion.for( 'upcast' ).add( ensureParagraphInTableCell( 'td' ) );
		conversion.for( 'upcast' ).add( ensureParagraphInTableCell( 'th' ) );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'tableCell',
			view: downcastCell( { asWidget: true } )
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'tableCell',
			view: downcastCell()
		} );

		// Duplicates code - needed to properly refresh paragraph inside a table cell.
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'paragraph',
			view: convertParagraphInTableCell( { asWidget: true } ),
			converterPriority: 'high'
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'paragraph',
			view: convertParagraphInTableCell(),
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

		injectTableLayoutPostFixer( model );
		injectTableCellParagraphPostFixer( model );

		this.listenTo( model.document, 'change:data', () => {
			tableHeadingsRefreshHandler( model, editor.editing );
			tableCellRefreshHandler( model, editor.editing );
		} );
	}
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
