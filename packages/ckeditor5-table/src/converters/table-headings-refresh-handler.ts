/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/table-headings-refresh-handler
 */

import type {
	EditingController,
	Element,
	Model
} from 'ckeditor5/src/engine';

import TableWalker from '../tablewalker';

/**
 * A table headings refresh handler which marks the table cells or rows in the differ to have it re-rendered
 * if the headings attribute changed.
 *
 * Table heading rows and heading columns are represented in the model by a `headingRows` and `headingColumns` attributes.
 *
 * When table headings attribute changes, all the cells/rows are marked to re-render to change between `<td>` and `<th>`.
 */
export default function tableHeadingsRefreshHandler( model: Model, editing: EditingController ): void {
	const differ = model.document.differ;

	for ( const change of differ.getChanges() ) {
		let table;
		let isRowChange = false;

		if ( change.type == 'attribute' ) {
			const element = change.range.start.nodeAfter;

			if ( !element || !element.is( 'element', 'table' ) ) {
				continue;
			}

			if ( change.attributeKey != 'headingRows' && change.attributeKey != 'headingColumns' ) {
				continue;
			}

			table = element;
			isRowChange = change.attributeKey == 'headingRows';
		} else if ( change.name == 'tableRow' || change.name == 'tableCell' ) {
			table = change.position.findAncestor( 'table' );
			isRowChange = change.name == 'tableRow';
		}

		if ( !table ) {
			continue;
		}

		const headingRows = table.getAttribute( 'headingRows' ) || 0;
		const headingColumns = table.getAttribute( 'headingColumns' ) || 0;

		const tableWalker = new TableWalker( table );

		for ( const tableSlot of tableWalker ) {
			const isHeading = tableSlot.row < headingRows || tableSlot.column < headingColumns;
			const expectedElementName = isHeading ? 'th' : 'td';

			const viewElement = editing.mapper.toViewElement( tableSlot.cell );

			if ( viewElement && viewElement.is( 'element' ) && viewElement.name != expectedElementName ) {
				editing.reconvertItem( ( isRowChange ? tableSlot.cell.parent : tableSlot.cell ) as Element );
			}
		}
	}
}
