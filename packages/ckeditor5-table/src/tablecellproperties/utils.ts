/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/utils
 */

import { TableWalker } from '../tablewalker.js';
import type { ModelElement } from 'ckeditor5/src/engine.js';

/**
 * Groups table cells by their parent table.
 *
 * @internal
 */
export function groupCellsByTable( tableCells: Array<ModelElement> ): Map<ModelElement, Array<ModelElement>> {
	const tableMap = new Map<ModelElement, Array<ModelElement>>();

	for ( const tableCell of tableCells ) {
		const table = tableCell.findAncestor( 'table' ) as ModelElement;

		if ( !tableMap.has( table ) ) {
			tableMap.set( table, [] );
		}

		tableMap.get( table )!.push( tableCell );
	}

	return tableMap;
}

/**
 * Checks if all cells in a given row or column are header cells.
 *
 * @internal
 */
export function isEntireCellsLineHeader(
	{
		table,
		row,
		column
	}: {
		table: ModelElement;
		row?: number;
		column?: number;
	}
): boolean {
	const tableWalker = new TableWalker( table, { row, column } );

	for ( const { cell } of tableWalker ) {
		const cellType = cell.getAttribute( 'tableCellType' );

		if ( cellType !== 'header' ) {
			return false;
		}
	}

	return true;
}
