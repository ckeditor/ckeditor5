/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/table-post-fixer
 */

import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import { getParentTable, updateNumericAttribute } from './../commands/utils';
import TableWalker from './../tablewalker';

export default function injectTablePostFixer( model, tableUtils ) {
	model.document.registerPostFixer( writer => tablePostFixer( writer, model, tableUtils ) );
}

function tablePostFixer( writer, model, tableUtils ) {
	const changes = model.document.differ.getChanges();

	let wasFixed = false;

	for ( const entry of changes ) {
		let table;

		// Fix table on table insert.
		if ( entry.name == 'table' && entry.type == 'insert' ) {
			table = entry.position.nodeAfter;
		}

		// Fix table on adding/removing table cells and rows.
		if ( entry.name == 'tableRow' || entry.name == 'tableCell' ) {
			table = getParentTable( entry.position );
		}

		// Fix table on any table's attribute change - including attributes of table cells.
		if ( isTableAttributeEntry( entry ) ) {
			table = getParentTable( entry.range.start );
		}

		if ( table ) {
			wasFixed = makeTableRowsSameLength( tableUtils, table, writer );
		}
	}

	return wasFixed;
}

function getCellsToTrim( table ) {
	const headingRows = parseInt( table.getAttribute( 'headingRows' ) || 0 );

	const cellsToTrim = [];

	for ( const { row, rowspan, cell } of new TableWalker( table ) ) {
		const maxRows = table.childCount;

		if ( headingRows > row ) {
			if ( row + rowspan > headingRows ) {
				const newRowspan = headingRows - row;

				cellsToTrim.push( { cell, rowspan: newRowspan } );
			}
		} else {
			if ( row + rowspan + headingRows > maxRows ) {
				const newRowspan = maxRows - row - headingRows + 1;

				cellsToTrim.push( { cell, rowspan: newRowspan } );
			}
		}
	}

	return cellsToTrim;
}

function getRowsLengths( table ) {
	const lengths = {};

	for ( const { row } of new TableWalker( table, { includeSpanned: true } ) ) {
		if ( !lengths[ row ] ) {
			lengths[ row ] = 0;
		}

		lengths[ row ] += 1;
	}

	return lengths;
}

function makeTableRowsSameLength( tableUtils, table, writer ) {
	let wasFixed = false;

	const tableSize = tableUtils.getColumns( table );

	// First: trim rowspanned table cells on section boundaries
	const cellsToTrim = getCellsToTrim( table );

	if ( cellsToTrim.length ) {
		for ( const data of cellsToTrim ) {
			updateNumericAttribute( 'rowspan', data.rowspan, data.cell, writer, 1 );
		}
	}

	const lengths = getRowsLengths( table );

	const isValid = Object.values( lengths ).every( length => length === tableSize );

	if ( !isValid ) {
		const maxColumns = Object.values( lengths ).reduce( ( prev, current ) => current > prev ? current : prev, 0 );

		for ( const [ rowIndex, size ] of Object.entries( lengths ) ) {
			const columnsToInsert = maxColumns - size;

			if ( columnsToInsert ) {
				for ( let i = 0; i < columnsToInsert; i++ ) {
					writer.insertElement( 'tableCell', Position.createAt( table.getChild( rowIndex ), 'end' ) );
				}

				wasFixed = true;
			}
		}
	}

	return wasFixed;
}

// Checks if differ entry for attribute change is one of table's attributes.
//
// @param entry
// @returns {Boolean}
function isTableAttributeEntry( entry ) {
	const isAttributeType = entry.type === 'attribute';
	const key = entry.attributeKey;

	return isAttributeType && ( key === 'headingRows' || key === 'colspan' || key === 'rowspan' );
}
