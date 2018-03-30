/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/insertcolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import CellSpans from './cellspans';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

/**
 * The insert column command.
 *
 * @extends module:core/command~Command
 */
export default class InsertColumnCommand extends Command {
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
	 * @param {Number} [options.columns=1] Number of rows to insert.
	 * @param {Number} [options.at=0] Row index to insert at.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const columns = parseInt( options.columns ) || 1;
		const insertAt = parseInt( options.at ) || 0;

		const table = getValidParent( selection.getFirstPosition() );

		const cellSpans = new CellSpans();

		model.change( writer => {
			let rowIndex = 0;

			const headingColumns = table.getAttribute( 'headingColumns' );

			if ( insertAt < headingColumns ) {
				writer.setAttribute( 'headingColumns', headingColumns + columns, table );
			}

			for ( const row of table.getChildren() ) {
				// TODO: what to do with max columns?

				let columnIndex = 0;

				// Cache original children.
				const children = [ ...row.getChildren() ];

				for ( const tableCell of children ) {
					let colspan = tableCell.hasAttribute( 'colspan' ) ? parseInt( tableCell.getAttribute( 'colspan' ) ) : 1;
					const rowspan = tableCell.hasAttribute( 'rowspan' ) ? parseInt( tableCell.getAttribute( 'rowspan' ) ) : 1;

					columnIndex = cellSpans.getAdjustedColumnIndex( rowIndex, columnIndex );

					// TODO: this is not cool:
					const shouldExpandSpan = colspan > 1 &&
						( columnIndex !== insertAt ) &&
						( columnIndex <= insertAt ) &&
						( columnIndex <= insertAt + columns ) &&
						( columnIndex + colspan > insertAt );

					if ( shouldExpandSpan ) {
						colspan += columns;

						writer.setAttribute( 'colspan', colspan, tableCell );
					}

					while ( columnIndex >= insertAt && columnIndex < insertAt + columns ) {
						const cell = writer.createElement( 'tableCell' );

						writer.insert( cell, Position.createBefore( tableCell ) );

						columnIndex++;
					}

					cellSpans.recordSpans( rowIndex, columnIndex, rowspan, colspan );

					columnIndex += colspan;
				}

				// Insert at the end of column
				while ( columnIndex >= insertAt && columnIndex < insertAt + columns ) {
					const cell = writer.createElement( 'tableCell' );

					writer.insert( cell, row, 'end' );

					columnIndex++;
				}

				rowIndex++;
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
