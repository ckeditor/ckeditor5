/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/table-heading-rows-refresh-post-fixer
 */

import TableWalker from '../tablewalker';

/**
 * TODO
 *
 * Injects a table post-fixer into the model which marks the table in the differ to have it re-rendered.
 *
 * Table heading rows are represented in the model by a `headingRows` attribute. However, in the view, it's represented as separate
 * sections of the table (`<thead>` or `<tbody>`) and changing `headingRows` attribute requires moving table rows between two sections.
 * This causes problems with structural changes in a table (like adding and removing rows) thus atomic converters cannot be used.
 *
 * When table `headingRows` attribute changes, the entire table is re-rendered.
 *
 * @param {module:engine/model/model~Model} model
 */
export default function tableHeadingsRefreshHandler( model, mapper ) {
	const differ = model.document.differ;

	for ( const change of differ.getChanges() ) {
		if ( change.type == 'attribute' ) {
			const element = change.range.start.nodeAfter;

			if ( !element || !element.is( 'element', 'table' ) ) {
				continue;
			}

			if ( change.attributeKey == 'headingRows' ) {
				reconvertOnAttributeChange( differ, change, element, 'startRow', 'endRow' );
			} else if ( change.attributeKey == 'headingColumns' ) {
				reconvertOnAttributeChange( differ, change, element, 'startColumn', 'endColumn' );
			}
		} else {
			/* istanbul ignore else */
			if ( change.type == 'insert' || change.type == 'remove' ) {
				if ( change.name != 'tableRow' && change.name != 'tableCell' ) {
					continue;
				}

				const table = change.position.findAncestor( 'table' );
				const headingRows = table.getAttribute( 'headingRows' ) || 0;
				const headingColumns = table.getAttribute( 'headingColumns' ) || 0;

				const tableWalker = new TableWalker( table );

				for ( const tableSlot of tableWalker ) {
					const isHeading = tableSlot.row < headingRows || tableSlot.column < headingColumns;
					const expectedElementName = isHeading ? 'th' : 'td';

					const viewElement = mapper.toViewElement( tableSlot.cell );

					if ( viewElement && viewElement.is( 'element' ) && viewElement.name != expectedElementName ) {
						differ.refreshItem( change.name == 'tableRow' ? tableSlot.cell.parent : tableSlot.cell );
					}
				}
			}
		}
	}
}

// TODO
function reconvertOnAttributeChange( differ, change, table, startOption, endOption ) {
	const oldHeadings = change.attributeOldValue || 0;
	const newHeadings = change.attributeNewValue || 0;

	const tableWalker = new TableWalker( table, {
		[ startOption ]: Math.min( oldHeadings, newHeadings ),
		[ endOption ]: Math.max( oldHeadings, newHeadings ) - 1
	} );

	for ( const tableSlot of tableWalker ) {
		differ.refreshItem( tableSlot.cell );
	}
}
