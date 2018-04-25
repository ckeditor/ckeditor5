/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/utils
 */

import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import TableWalker from '../tablewalker';

/**
 * Returns parent table.
 *
 * @param {module:engine/model/position} position
 * @returns {*}
 */
export function getParentTable( position ) {
	let parent = position.parent;

	while ( parent ) {
		if ( parent.name === 'table' ) {
			return parent;
		}

		parent = parent.parent;
	}
}

/**
 * Returns number of columns for given table.
 *
 * @param {module:engine/model/element} table
 * @returns {Number}
 */
export function getColumns( table ) {
	const row = table.getChild( 0 );

	return [ ...row.getChildren() ].reduce( ( columns, row ) => {
		const columnWidth = parseInt( row.getAttribute( 'colspan' ) ) || 1;

		return columns + ( columnWidth );
	}, 0 );
}

/**
 * Splits table cell vertically.
 *
 * @param {module:engine/model/element} tableCell
 * @param writer
 * @param {Object} [options]
 * @param {Boolean} [options.breakHorizontally=false]
 */
export function unsplitVertically( tableCell, writer, options = {} ) {
	const tableRow = tableCell.parent;
	const table = tableRow.parent;

	const rowspan = parseInt( tableCell.getAttribute( 'rowspan' ) );

	const startRow = table.getChildIndex( tableRow );
	const endRow = startRow + rowspan - 1;

	const tableWalker = new TableWalker( table, { startRow, endRow, includeSpanned: true } );

	let columnIndex;
	let previousCell;
	let cellsToInsert;

	const breakHorizontally = !!options.breakHorizontally;
	const attributes = {};

	for ( const tableWalkerInfo of tableWalker ) {
		if ( tableWalkerInfo.cell ) {
			previousCell = tableWalkerInfo.cell;
		}

		if ( tableWalkerInfo.cell === tableCell ) {
			columnIndex = tableWalkerInfo.column;
			cellsToInsert = breakHorizontally ? tableWalkerInfo.colspan : 1;

			if ( !breakHorizontally && tableWalkerInfo.colspan > 1 ) {
				attributes.colspan = tableWalkerInfo.colspan;
			}
		}

		if ( columnIndex !== undefined && columnIndex === tableWalkerInfo.column && tableWalkerInfo.row > startRow ) {
			const insertRow = table.getChild( tableWalkerInfo.row );

			if ( previousCell.parent === insertRow ) {
				for ( let i = 0; i < cellsToInsert; i++ ) {
					writer.insertElement( 'tableCell', attributes, Position.createAfter( previousCell ) );
				}
			} else {
				for ( let i = 0; i < cellsToInsert; i++ ) {
					writer.insertElement( 'tableCell', attributes, Position.createAt( insertRow ) );
				}
			}
		}
	}
}
