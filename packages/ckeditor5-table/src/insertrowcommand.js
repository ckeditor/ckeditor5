/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/insertrowcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { CellSpans, getNumericAttribute } from './converters/downcasttable';

/**
 * The insert row command.
 *
 * @extends module:core/command~Command
 */
export default class InsertRowCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		const tableParent = getValidParent( doc.selection.getFirstPosition() );

		this.isEnabled = !!tableParent;
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {Number} [options.rows=1] Number of rows to insert.
	 * @param {Number} [options.at=0] Row index to insert at.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const rows = parseInt( options.rows ) || 1;
		const insertAt = parseInt( options.at ) || 0;

		const table = getValidParent( selection.getFirstPosition() );

		const headingRows = table.getAttribute( 'headingRows' ) || 0;

		const columns = getColumns( table );

		const cellSpans = new CellSpans();

		model.change( writer => {
			if ( headingRows > insertAt ) {
				writer.setAttribute( 'headingRows', headingRows + rows, table );
			}

			let tableRow;

			for ( let rowIndex = 0; rowIndex < insertAt + rows; rowIndex++ ) {
				if ( rowIndex < insertAt ) {
					tableRow = table.getChild( rowIndex );

					// Record spans, update rowspans
					let columnIndex = 0;

					for ( const tableCell of Array.from( tableRow.getChildren() ) ) {
						columnIndex = cellSpans.getNextFreeColumnIndex( rowIndex, columnIndex );

						const colspan = getNumericAttribute( tableCell, 'colspan', 1 );
						let rowspan = getNumericAttribute( tableCell, 'rowspan', 1 );

						if ( rowspan > 1 ) {
							// check whether rowspan overlaps inserts:
							if ( rowIndex < insertAt && rowIndex + rowspan > insertAt ) {
								rowspan = rowspan + rows;

								writer.setAttribute( 'rowspan', rowspan, tableCell );
							}

							cellSpans.recordSpans( rowIndex, columnIndex, rowspan, colspan );
						}

						columnIndex = columnIndex + colspan;
					}
				} else {
					// Create new rows
					tableRow = writer.createElement( 'tableRow' );

					writer.insert( tableRow, table, insertAt );

					for ( let columnIndex = 0; columnIndex < columns; columnIndex++ ) {
						columnIndex = cellSpans.getNextFreeColumnIndex( rowIndex, columnIndex );

						const cell = writer.createElement( 'tableCell' );

						writer.insert( cell, tableRow, 'end' );
					}
				}
			}
		} );
	}
}

function getValidParent( firstPosition ) {
	let parent = firstPosition.parent;

	while ( parent ) {
		if ( parent.name === 'table' ) {
			return parent;
		}

		parent = parent.parent;
	}
}

function getColumns( table ) {
	const row = table.getChild( 0 );

	return [ ...row.getChildren() ].reduce( ( columns, row ) => {
		const columnWidth = parseInt( row.getAttribute( 'colspan' ) ) || 1;

		return columns + ( columnWidth );
	}, 0 );
}
