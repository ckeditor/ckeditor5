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
import { TableUtils } from '../../tableutils.js';
import { TableWalker } from '../../tablewalker.js';

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

			switch ( valueToSet ) {
				// If changing cell type to 'header', increment headingRows/headingColumns if entire row/column is of header type.
				case 'header':
					this._adjustHeadingAttributesWhenChangingToHeader( tableCells, writer );
					break;

				// If changing cell type to 'data', decrement headingRows/headingColumns
				// if at least one row/column is no longer of header type.
				case 'data':
					this._adjustHeadingAttributesWhenChangingToData( tableCells, writer );
					break;
			}
		} );
	}

	/**
	 * Increments the `headingRows` and `headingColumns` attributes of the tables
	 * containing the given table cells being changed to `header` cell type,
	 * but only if the entire row/column is of header type and the heading attributes
	 * are directly preceding the changed cell.
	 */
	private _adjustHeadingAttributesWhenChangingToHeader( tableCells: Array<ModelElement>, writer: ModelWriter ): void {
		const tableMap = groupCellsByTable( tableCells );
		const tableUtils = this.editor.plugins.get( TableUtils );

		// Process each table.
		for ( const [ table, cells ] of tableMap ) {
			const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
			const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

			const tableRowCount = tableUtils.getRows( table );
			const tableColumnCount = tableUtils.getColumns( table );

			// Track which rows and columns were changed.
			const changedRowsSet = new Set<number>();
			const changedColumnsSet = new Set<number>();

			for ( const cell of cells ) {
				const { row, column } = tableUtils.getCellLocation( cell );
				changedRowsSet.add( row );
				changedColumnsSet.add( column );
			}

			// Check if we should increment headingRows.
			// We only increment if the changed row index equals the current headingRows value.
			if (
				changedRowsSet.has( headingRows ) &&
				headingRows < tableRowCount &&
				isEntireLineHeader( {
					table,
					index: headingRows,
					cellsBeingChanged: cells,
					lineType: 'row'
				} )
			) {
				writer.setAttribute( 'headingRows', headingRows + 1, table );
			}

			// Check if we should increment headingColumns.
			// We only increment if the changed column index equals the current headingColumns value.
			if (
				changedColumnsSet.has( headingColumns ) &&
				headingColumns < tableColumnCount &&
				isEntireLineHeader( {
					table,
					index: headingColumns,
					cellsBeingChanged: cells,
					lineType: 'column'
				} )
			) {
				writer.setAttribute( 'headingColumns', headingColumns + 1, table );
			}
		}
	}

	/**
	 * Decrements the `headingRows` and `headingColumns` attributes of the tables
	 * containing the given table cells being changed to `data` cell type.
	 */
	private _adjustHeadingAttributesWhenChangingToData( tableCells: Array<ModelElement>, writer: ModelWriter ): void {
		const tableMap = groupCellsByTable( tableCells );
		const tableUtils = this.editor.plugins.get( TableUtils );

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
				setOrRemoveAttribute( writer, 'headingRows', minHeadingRow, table );
			}

			// Update headingColumns if necessary.
			if ( minHeadingColumn < headingColumns ) {
				setOrRemoveAttribute( writer, 'headingColumns', minHeadingColumn, table );
			}
		}
	}
}

/**
 * Checks if all cells in a given row or column are header cells.
 */
function isEntireLineHeader(
	{
		table,
		index,
		cellsBeingChanged,
		lineType
	}: {
		table: ModelElement;
		index: number;
		cellsBeingChanged: Array<ModelElement>;
		lineType: 'row' | 'column';
	}
): boolean {
	const tableWalker = new TableWalker( table, { [ lineType ]: index } );

	for ( const { cell } of tableWalker ) {
		const cellType = cell.getAttribute( 'tableCellType' ) || 'data';
		const isBeingChangedToType = cellsBeingChanged.includes( cell );

		if ( cellType !== 'header' && !isBeingChangedToType ) {
			return false;
		}
	}

	return true;
}

/**
 * Sets or removes an attribute on the table depending on the value.
 * If value is 0, removes the attribute; otherwise sets it.
 */
function setOrRemoveAttribute(
	writer: ModelWriter,
	attributeName: string,
	value: number,
	table: ModelElement
): void {
	if ( value === 0 ) {
		writer.removeAttribute( attributeName, table );
	} else {
		writer.setAttribute( attributeName, value, table );
	}
}

/**
 * Groups table cells by their parent table.
 */
function groupCellsByTable( tableCells: Array<ModelElement> ): Map<ModelElement, Array<ModelElement>> {
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

	return tableMap;
}
