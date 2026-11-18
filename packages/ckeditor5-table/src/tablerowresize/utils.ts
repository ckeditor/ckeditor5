/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablerowresize/utils
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import type { ModelElement, ModelWriter } from '@ckeditor/ckeditor5-engine';

import { TableWalker } from '../tablewalker.js';
import { type TableUtils } from '../tableutils.js';
import { getNormalizedDefaultCellProperties, getNormalizedDefaultTableProperties } from '../utils/table-properties.js';

/**
 * Returns the row indexes on the top and bottom edges of a cell. They differ if the cell spans across multiple rows.
 * The bottom edge is the row that dragging the bottom edge of the cell resizes.
 *
 * @internal
 * @param cell A table cell model element.
 * @param tableUtils The Table Utils plugin instance.
 * @returns An object containing the indexes of the top and bottom edges of the cell.
 */
export function getRowEdgesIndexes( cell: ModelElement, tableUtils: TableUtils ): { topEdge: number; bottomEdge: number } {
	const cellRowIndex = tableUtils.getCellLocation( cell ).row;
	const cellHeight = cell.getAttribute( 'rowspan' ) as number || 1;

	return {
		topEdge: cellRowIndex,
		bottomEdge: cellRowIndex + cellHeight - 1
	};
}

/**
 * Sets the height of a table row and clears the height of every cell covering that row, including cells spanned from
 * the rows above. The browser renders a row as high as its highest cell, so a cell height would keep the row from shrinking.
 *
 * @internal
 * @param unsetCellHeight The height set on the cells covering the row in place of their own height: `'auto'` to override
 * a configured default cell height, or `null` to remove the cell height.
 */
export function setRowHeight( writer: ModelWriter, row: ModelElement, height: string, unsetCellHeight: string | null ): void {
	writer.setAttribute( 'rowHeight', height, row );
	clearCellHeightsCoveringRow( writer, row, unsetCellHeight );
}

/**
 * Removes the height of a table row, together with the height of every cell covering that row, so the row gets the height
 * its content requires.
 *
 * @internal
 * @param unsetCellHeight The height set on the cells covering the row in place of their own height: `'auto'` to override
 * a configured default cell height, or `null` to remove the cell height.
 */
export function removeRowHeight( writer: ModelWriter, row: ModelElement, unsetCellHeight: string | null ): void {
	writer.removeAttribute( 'rowHeight', row );
	clearCellHeightsCoveringRow( writer, row, unsetCellHeight );
}

/**
 * Returns the value that unsets the table or the cell height: `'auto'` when a default height is configured, as a removed
 * height would fall back to the default one from the content styles, or `null` to remove the height.
 * The layout tables do not use the default table and cell properties.
 *
 * @internal
 */
export function getUnsetHeightValue( editor: Editor, table: ModelElement, type: 'table' | 'cell' ): string | null {
	if ( table.getAttribute( 'tableType' ) === 'layout' ) {
		return null;
	}

	const defaultHeight = type === 'table' ?
		getNormalizedDefaultTableProperties( editor.config.get( 'table.tableProperties.defaultProperties' ) ).height :
		getNormalizedDefaultCellProperties( editor.config.get( 'table.tableCellProperties.defaultProperties' ) ).height;

	return defaultHeight ? 'auto' : null;
}

/**
 * Clears the height of every cell covering the given row, including cells spanned from the rows above.
 */
function clearCellHeightsCoveringRow( writer: ModelWriter, row: ModelElement, unsetCellHeight: string | null ): void {
	const table = row.parent as ModelElement;

	// The rows come before the other children of the table (the caption and the column group), so the index of the row
	// among the table children is its row index.
	for ( const { cell } of new TableWalker( table, { row: row.index!, includeAllSlots: true } ) ) {
		if ( unsetCellHeight ) {
			writer.setAttribute( 'tableCellHeight', unsetCellHeight, cell );
		} else if ( cell.hasAttribute( 'tableCellHeight' ) ) {
			writer.removeAttribute( 'tableCellHeight', cell );
		}
	}
}

/**
 * Returns a row height value (a non-negative number without a unit or in pixels) as a height in pixels, for example
 * `'50'` as `'50px'`. Returns `null` for any other value, as a changed row height is always stored in pixels.
 *
 * @internal
 */
export function toRowHeightInPixels( value: string | number ): string | null {
	const match = String( value ).trim().match( /^(\d+(?:\.\d+)?|\.\d+)(?:px)?$/ );

	return match ? `${ parseFloat( match[ 1 ] ) }px` : null;
}

/**
 * Checks whether a height value is empty: missing, an empty string, or only whitespace (the height field accepts
 * whitespace as an empty value).
 *
 * @internal
 */
export function isEmptyHeightValue( value: string | number | undefined ): boolean {
	return value === undefined || String( value ).trim() === '';
}

/**
 * Returns the `tableRow` elements of a table, skipping other children such as the column group or the caption.
 *
 * @internal
 */
export function getTableRows( table: ModelElement ): Array<ModelElement> {
	return Array
		.from( table.getChildren() as IterableIterator<ModelElement> )
		.filter( child => child.is( 'element', 'tableRow' ) );
}
