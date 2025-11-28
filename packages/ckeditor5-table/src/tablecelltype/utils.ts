/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecelltype/utils
 */

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
