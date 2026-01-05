/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/table-headings-refresh-handler
 */

import type {
	EditingController,
	ModelElement,
	Model
} from 'ckeditor5/src/engine.js';

import type { TableUtils } from '../tableutils.js';
import { TableWalker } from '../tablewalker.js';

/**
 * A table headings refresh handler which marks the table cells or rows in the differ to have it re-rendered
 * if the headings attribute changed.
 *
 * Table heading rows and heading columns are represented in the model by a `headingRows` and `headingColumns` attributes.
 *
 * When table headings attribute changes, all the cells/rows are marked to re-render to change between `<td>` and `<th>`.
 *
 * @internal
 */
export function tableHeadingsRefreshHandler( model: Model, editing: EditingController, tableUtils: TableUtils ): void {
	const differ = model.document.differ;
	const rowsToReconvert = new Set<ModelElement>();
	const cellsToReconvert = new Set<ModelElement>();

	for ( const change of differ.getChanges() ) {
		let table;
		let isRowChange = false;

		if ( change.type == 'attribute' ) {
			const element = change.range.start.nodeAfter;

			if ( !element || !element.is( 'element', 'table' ) ) {
				continue;
			}

			if ( change.attributeKey != 'headingRows' && change.attributeKey != 'headingColumns' && change.attributeKey != 'footerRows' ) {
				continue;
			}

			table = element;
			isRowChange = change.attributeKey == 'headingRows' || change.attributeKey == 'footerRows';
		} else if ( change.name == 'tableRow' || change.name == 'tableCell' ) {
			table = change.position.findAncestor( 'table' );
			isRowChange = change.name == 'tableRow';
		}

		if ( !table ) {
			continue;
		}

		const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
		const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

		const tableWalker = new TableWalker( table );
		const totalRows = tableUtils.getRows( table );

		for ( const tableSlot of tableWalker ) {
			const viewElement = editing.mapper.toViewElement( tableSlot.cell );

			if ( !viewElement || !viewElement.is( 'element' ) ) {
				continue;
			}

			let shouldReconvert = false;

			const isHeading = tableSlot.row < headingRows || tableSlot.column < headingColumns;
			const expectedElementName = isHeading ? 'th' : 'td';

			if ( viewElement.name != expectedElementName ) {
				shouldReconvert = true;
			}

			else if ( change.type === 'attribute' && change.attributeKey === 'footerRows' ) {
				const oldValue = ( change.attributeOldValue as number | null ) || 0;
				const newValue = ( change.attributeNewValue as number | null ) || 0;

				const minFooterRows = Math.min( oldValue, newValue );
				const maxFooterRows = Math.max( oldValue, newValue );

				if ( tableSlot.row >= totalRows - maxFooterRows && tableSlot.row <= totalRows - minFooterRows ) {
					shouldReconvert = true;
				}
			}

			if ( shouldReconvert ) {
				if ( isRowChange ) {
					rowsToReconvert.add( tableSlot.cell.parent! as ModelElement );
				}

				cellsToReconvert.add( tableSlot.cell );
			}
		}
	}

	for ( const row of [ ...cellsToReconvert, ...rowsToReconvert ] ) {
		editing.reconvertItem( row );
	}
}
