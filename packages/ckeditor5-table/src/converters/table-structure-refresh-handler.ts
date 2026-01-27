/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/table-structure-refresh-handler
 */

import type {
	EditingController,
	ModelElement,
	Model
} from '@ckeditor/ckeditor5-engine';

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
export function tableStructureRefreshHandler( model: Model, editing: EditingController ): void {
	const differ = model.document.differ;
	const movedRows = new Set<ModelElement>();
	const rowsToReconvert = new Set<ModelElement>();
	const cellsToReconvert = new Set<ModelElement>();

	for ( const change of differ.getChanges() ) {
		let table;

		if ( change.type == 'attribute' ) {
			const element = change.range.start.nodeAfter;

			if ( !element || !element.is( 'element', 'table' ) ) {
				continue;
			}

			if (
				change.attributeKey != 'headingRows' &&
				change.attributeKey != 'headingColumns' &&
				change.attributeKey != 'footerRows'
			) {
				continue;
			}

			table = element;
		}
		else if ( change.name == 'tableRow' || change.name == 'tableCell' ) {
			table = change.position.findAncestor( 'table' );
		}

		if ( !table ) {
			continue;
		}

		// Mark row to be reconverted when it was moved around so that `<th>` and `<td>` elements can be updated.
		// See https://github.com/ckeditor/ckeditor5/issues/19671.
		if (
			change.type == 'insert' &&
			change.name == 'tableRow' &&
			editing.mapper.toViewElement( change.position.nodeAfter as ModelElement )
		) {
			movedRows.add( change.position.nodeAfter as ModelElement );
		}

		const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
		const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

		const tableWalker = new TableWalker( table );

		for ( const tableSlot of tableWalker ) {
			const viewElement = editing.mapper.toViewElement( tableSlot.cell );

			if ( !viewElement || !viewElement.is( 'element' ) ) {
				continue;
			}

			const isHeading = tableSlot.row < headingRows || tableSlot.column < headingColumns;
			const expectedElementName = isHeading ? 'th' : 'td';

			if ( viewElement.name != expectedElementName ) {
				cellsToReconvert.add( tableSlot.cell );

				// Reconvert rows that were just inserted (moved) as marking cells inside for reconversion does not work.
				// See https://github.com/ckeditor/ckeditor5/issues/19671.
				if ( movedRows.has( tableSlot.cell.parent as ModelElement ) ) {
					rowsToReconvert.add( tableSlot.cell.parent as ModelElement );
				}
			}
		}
	}

	for ( const item of rowsToReconvert ) {
		editing.reconvertItem( item );
	}

	for ( const item of cellsToReconvert ) {
		editing.reconvertItem( item );
	}
}
