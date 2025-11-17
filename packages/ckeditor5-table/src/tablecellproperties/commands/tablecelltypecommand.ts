/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/commands/tablecelltypecommand
 */

import type { Editor } from 'ckeditor5/src/core.js';
import type { Batch, ModelElement, ModelWriter } from 'ckeditor5/src/engine.js';

import { TableCellPropertyCommand } from './tablecellpropertycommand.js';
import type { TableUtils } from '../../tableutils.js';

/**
 * The table cell type command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellType'` editor command.
 *
 * To change the type of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellType', {
 *   value: 'header'
 * } );
 * ```
 *
 * The `value` can be either `'header'` or `'data'`.
 */
export class TableCellTypeCommand extends TableCellPropertyCommand {
	/**
	 * Creates a new `TableCellTypeCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 */
	constructor( editor: Editor ) {
		super( editor, 'tableCellType' );
	}

	/**
	 * @inheritDoc
	 */
	public override execute( options: { value?: string | number; batch?: Batch } = {} ): void {
		const { value, batch } = options;
		const model = this.editor.model;
		const tableUtils: TableUtils = this.editor.plugins.get( 'TableUtils' );
		const tableCells = tableUtils.getSelectionAffectedTableCells( model.document.selection );
		const valueToSet = this._getValueToSet( value );

		model.enqueueChange( batch, writer => {
			if ( valueToSet ) {
				tableCells.forEach( tableCell => writer.setAttribute( this.attributeName, valueToSet, tableCell ) );
			} else {
				tableCells.forEach( tableCell => writer.removeAttribute( this.attributeName, tableCell ) );
			}

			// If changing cell type to 'data', adjust headingRows/headingColumns if necessary.
			if ( valueToSet === 'data' ) {
				this._adjustHeadingAttributesWhenChangingToData( tableCells, writer, tableUtils );
			}
		} );
	}

	/**
	 * Adjusts `headingRows` or `headingColumns` when cells in heading sections are changed to 'data' type.
	 */
	private _adjustHeadingAttributesWhenChangingToData(
		tableCells: Array<ModelElement>,
		writer: ModelWriter,
		tableUtils: TableUtils
	): void {
		// Group cells by their parent table.
		const tableMap = new Map<ModelElement, Array<ModelElement>>();

		for ( const tableCell of tableCells ) {
			const table = tableCell.findAncestor( 'table' ) as ModelElement;

			if ( !table ) {
				continue;
			}

			if ( !tableMap.has( table ) ) {
				tableMap.set( table, [] );
			}

			tableMap.get( table )!.push( tableCell );
		}

		// Process each table.
		for ( const [ table, cells ] of tableMap ) {
			const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
			const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

			if ( headingRows === 0 && headingColumns === 0 ) {
				continue;
			}

			let minHeadingRow = headingRows;
			let minHeadingColumn = headingColumns;

			// Check each cell being changed to 'data'
			for ( const cell of cells ) {
				const { row, column } = tableUtils.getCellLocation( cell );

				// If cell is in heading rows.
				if ( row < headingRows ) {
					minHeadingRow = Math.min( minHeadingRow, row );
				}

				// If cell is in heading columns.
				if ( column < headingColumns ) {
					minHeadingColumn = Math.min( minHeadingColumn, column );
				}
			}

			// Update headingRows if necessary.
			if ( minHeadingRow < headingRows ) {
				if ( minHeadingRow === 0 ) {
					writer.removeAttribute( 'headingRows', table );
				} else {
					writer.setAttribute( 'headingRows', minHeadingRow, table );
				}
			}

			// Update headingColumns if necessary.
			if ( minHeadingColumn < headingColumns ) {
				if ( minHeadingColumn === 0 ) {
					writer.removeAttribute( 'headingColumns', table );
				} else {
					writer.setAttribute( 'headingColumns', minHeadingColumn, table );
				}
			}
		}
	}
}
