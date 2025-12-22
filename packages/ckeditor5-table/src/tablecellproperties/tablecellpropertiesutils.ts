/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/tablecellpropertiesutils
 */

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
export function isHeaderCellType( cellType: TableCellType | undefined ): boolean {
	return (
		cellType === 'header' ||
		cellType === 'header-row' ||
		cellType === 'header-column'
	);
}
