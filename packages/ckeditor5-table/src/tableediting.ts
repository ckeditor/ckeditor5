/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableediting
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { PositionOffset, ViewElement, SlotFilter } from 'ckeditor5/src/engine.js';

import upcastTable, { ensureParagraphInTableCell, skipEmptyTableRow, upcastTableFigure } from './converters/upcasttable.js';
import { convertParagraphInTableCell, downcastCell, downcastRow, downcastTable } from './converters/downcast.js';

import InsertTableCommand from './commands/inserttablecommand.js';
import InsertRowCommand from './commands/insertrowcommand.js';
import InsertColumnCommand from './commands/insertcolumncommand.js';
import SplitCellCommand from './commands/splitcellcommand.js';
import MergeCellCommand from './commands/mergecellcommand.js';
import RemoveRowCommand from './commands/removerowcommand.js';
import RemoveColumnCommand from './commands/removecolumncommand.js';
import SetHeaderRowCommand from './commands/setheaderrowcommand.js';
import SetHeaderColumnCommand from './commands/setheadercolumncommand.js';
import MergeCellsCommand from './commands/mergecellscommand.js';
import SelectRowCommand from './commands/selectrowcommand.js';
import SelectColumnCommand from './commands/selectcolumncommand.js';
import TableUtils from '../src/tableutils.js';

import injectTableLayoutPostFixer from './converters/table-layout-post-fixer.js';
import injectTableCellParagraphPostFixer from './converters/table-cell-paragraph-post-fixer.js';

import tableHeadingsRefreshHandler from './converters/table-headings-refresh-handler.js';
import tableCellRefreshHandler from './converters/table-cell-refresh-handler.js';

import '../theme/tableediting.css';

/**
 * The table editing feature.
 */
export default class TableEditing extends Plugin {
	/**
	 * Handlers for creating additional slots in the table.
	 */
	private _additionalSlots: Array<AdditionalSlot>;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TableUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._additionalSlots = [];
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
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
			view: downcastTable( tableUtils, {
				asWidget: true,
				additionalSlots: this._additionalSlots
			} )
		} );
		conversion.for( 'dataDowncast' ).elementToStructure( {
			model: {
				name: 'table',
				attributes: [ 'headingRows' ]
			},
			view: downcastTable( tableUtils, {
				additionalSlots: this._additionalSlots
			} )
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

	/**
	 * Registers downcast handler for the additional table slot.
	 */
	public registerAdditionalSlot( slotHandler: AdditionalSlot ): void {
		this._additionalSlots.push( slotHandler );
	}
}

/**
 * Returns fixed colspan and rowspan attrbutes values.
 *
 * @param type colspan or rowspan.
 * @returns conversion value function.
 */
function upcastCellSpan( type: string ) {
	return ( cell: ViewElement ) => {
		const span = parseInt( cell.getAttribute( type )! );

		if ( Number.isNaN( span ) || span <= 0 ) {
			return null;
		}

		return span;
	};
}

/**
 * By default, only the `tableRow` elements from the `table` model are downcast inside the `<table>` and
 * all other elements are pushed outside the table. This handler allows creating additional slots inside
 * the table for other elements.
 *
 * Take this model as an example:
 *
 * ```xml
 * <table>
 *   <tableRow>...</tableRow>
 *   <tableRow>...</tableRow>
 *   <tableColumnGroup>...</tableColumnGroup>
 * </table>
 * ```
 *
 * By default, downcasting result will be:
 *
 * ```xml
 * <table>
 *   <tbody>
 *     <tr>...</tr>
 *     <tr>...</tr>
 *   </tbody>
 * </table>
 * <colgroup>...</colgroup>
 * ```
 *
 * To allow the `tableColumnGroup` element at the end of the table, use the following configuration:
 *
 * ```ts
 * const additionalSlot = {
 *   filter: element => element.is( 'element', 'tableColumnGroup' ),
 *   positionOffset: 'end'
 * }
 * ```
 *
 * Now, the downcast result will be:
 *
 * ```xml
 * <table>
 *   <tbody>
 *     <tr>...</tr>
 *     <tr>...</tr>
 *   </tbody>
 *   <colgroup>...</colgroup>
 * </table>
 * ```
 */
export interface AdditionalSlot {

	/**
	 * Filter for elements that should be placed inside given slot.
	 */
	filter: SlotFilter;

	/**
	 * Position of the slot within the table.
	 */
	positionOffset: PositionOffset;
}
