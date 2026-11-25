/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/tablecellpropertiesutils
 */

import type { ModelElement } from '@ckeditor/ckeditor5-engine';

/**
 * Type of the table cell.
 */
export type TableCellType = 'data' | 'header' | `header-${ 'row' | 'column' }`;

/**
 * Checks if the given cell type represents a header cell.
 *
 * @param cellType The type of the table cell.
 * @returns `true` if the cell type represents a header cell, `false` otherwise.
 */
export function isTableHeaderCellType( cellType: TableCellType | undefined ): boolean {
	return (
		cellType === 'header' ||
		cellType === 'header-row' ||
		cellType === 'header-column'
	);
}

/**
 * Checks if all given table cells are of the same type. Either all header cells or all data cells.
 *
 * @internal
 */
export function areTableCellsOfSameType( tableCells: Array<ModelElement> ): boolean {
	const isHeader = ( cell: ModelElement ) => isTableHeaderCellType( cell.getAttribute( 'tableCellType' ) as TableCellType );
	const [ firstCell, ...otherCells ] = tableCells;

	return !firstCell || otherCells.every( cell => isHeader( cell ) === isHeader( firstCell ) );
}
