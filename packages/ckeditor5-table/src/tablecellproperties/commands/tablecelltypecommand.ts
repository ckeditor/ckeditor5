/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/commands/tablecelltypecommand
 */

import type { Editor } from 'ckeditor5/src/core.js';
import type { ModelElement, ModelWriter } from 'ckeditor5/src/engine.js';

import { TableUtils } from '../../tableutils.js';
import {
	TableCellPropertyCommand,
	type TableCellPropertyCommandAfterExecuteEvent
} from './tablecellpropertycommand.js';

import { groupCellsByTable, getSelectionAffectedTable } from '../../utils/common.js';
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
		super( editor, 'tableCellType', 'data' );

		this.on<TableCellPropertyCommandAfterExecuteEvent>( 'afterExecute', ( _, data ) => {
			const { writer, tableCells } = data;
			const tableUtils = this.editor.plugins.get( TableUtils );
			const tablesMap = groupCellsByTable( tableCells );

			updateTablesHeadingAttributes( tableUtils, writer, tablesMap.keys() );
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		super.refresh();

		const table = getSelectionAffectedTable( this.editor.model.document.selection );

		if ( this.isEnabled && table && table.getAttribute( 'tableType' ) === 'layout' ) {
			this.isEnabled = false;
		}
	}
}

/**
 * Type of the table cell.
 */
export type TableCellType = 'data' | 'header';

/**
 * Updates the `headingRows` and `headingColumns` attributes of the given tables
 * based on the `tableCellType` of their cells.
 */
export function updateTablesHeadingAttributes(
	tableUtils: TableUtils,
	writer: ModelWriter,
	tables: Iterable<ModelElement>
): boolean {
	let changed = false;

	for ( const table of tables ) {
		let headingRows = table.getAttribute( 'headingRows' ) as number || 0;
		let headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

		// Prioritize the dimension that is already larger to prevent the other dimension from
		// aggressively consuming "orphaned" header cells. In other words, if table has tree
		// heading columns (which fills entire table), we should not count all rows as heading rows.
		// User might later add column to the right which should not be heading.
		//
		// The other example, in a 2x2 table where all cells are headers (e.g. due to concurrent edits),
		// if headingColumns=0 and headingRows=0 (but all cells are headers):
		// - Processing rows first would expand headingRows to 2 (covering all cells), leaving headingColumns at 0.
		// - Processing columns first expands headingColumns to 2, leaving headingRows at 0.
		//
		// However, if we have a hint (e.g. headingColumns > headingRows), we should follow it.
		// If headingColumns=1 and headingRows=0:
		// - Processing rows first would expand headingRows to 2 (covering all cells), leaving headingColumns at 1.
		// - Processing columns first expands headingColumns to 2, which is the intended result if we started with columns.
		//
		// It should be good enough to resolve conflicts in most cases.
		const processColumnsFirst = headingColumns > headingRows;

		if ( processColumnsFirst ) {
			const newHeadingColumns = getAdjustedHeadingSectionSize( tableUtils, table, 'column', headingColumns, headingRows );

			if ( newHeadingColumns !== headingColumns ) {
				tableUtils.setHeadingColumnsCount( writer, table, newHeadingColumns, { shallow: true } );
				headingColumns = newHeadingColumns;
				changed = true;
			}
		}

		const newHeadingRows = getAdjustedHeadingSectionSize( tableUtils, table, 'row', headingRows, headingColumns );

		if ( newHeadingRows !== headingRows ) {
			tableUtils.setHeadingRowsCount( writer, table, newHeadingRows, { shallow: true } );
			headingRows = newHeadingRows;
			changed = true;
		}

		if ( !processColumnsFirst ) {
			const newHeadingColumns = getAdjustedHeadingSectionSize( tableUtils, table, 'column', headingColumns, headingRows );

			if ( newHeadingColumns !== headingColumns ) {
				tableUtils.setHeadingColumnsCount( writer, table, newHeadingColumns, { shallow: true } );
				changed = true;
			}
		}
	}

	return changed;
}

/**
 * Calculates the adjusted size of a heading section (rows or columns).
 */
function getAdjustedHeadingSectionSize(
	tableUtils: TableUtils,
	table: ModelElement,
	mode: 'row' | 'column',
	currentSize: number,
	perpendicularHeadingSize: number
): number {
	const totalRowsOrColumns = mode === 'row' ? tableUtils.getRows( table ) : tableUtils.getColumns( table );
	let size = currentSize;

	// Iterate through each row/column to check if all cells are headers.
	for ( let currentIndex = 0; currentIndex < totalRowsOrColumns; currentIndex++ ) {
		const walkerOptions = mode === 'row' ? { row: currentIndex } : { column: currentIndex };
		const walker = new TableWalker( table, walkerOptions );

		let allCellsAreHeaders = true;
		let hasHeaderOutsidePerpendicularSection = false;

		// Check each cell in the current row/column.
		for ( const { cell, row, column } of walker ) {
			// If we find a non-header cell, this row/column can't be part of the heading section.
			if ( cell.getAttribute( 'tableCellType' ) !== 'header' ) {
				allCellsAreHeaders = false;
				break;
			}

			// Check if this header cell extends beyond the perpendicular heading section.
			// E.g., when checking rows, see if the cell extends beyond headingColumns.
			const perpendicularIndex = mode === 'row' ? column : row;

			if ( perpendicularIndex >= perpendicularHeadingSize ) {
				hasHeaderOutsidePerpendicularSection = true;
			}
		}

		// If not all cells are headers, we can't extend the heading section any further.
		if ( !allCellsAreHeaders ) {
			// The section cannot extend beyond the last valid header row/column.
			return Math.min( size, currentIndex );
		}

		// If there's a header extending beyond the perpendicular section,
		// we must include this row/column in the heading section.
		if ( hasHeaderOutsidePerpendicularSection ) {
			size = Math.max( size, currentIndex + 1 );
		}
	}

	return Math.min( size, totalRowsOrColumns );
}
