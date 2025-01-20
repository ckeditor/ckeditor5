/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/table-cell-paragraph-post-fixer
 */

import type { Model, Writer, Element, DiffItemInsert, DiffItemRemove } from 'ckeditor5/src/engine.js';

/**
 * Injects a table cell post-fixer into the model which inserts a `paragraph` element into empty table cells.
 *
 * A table cell must contain at least one block element as a child. An empty table cell will have an empty `paragraph` as a child.
 *
 * ```xml
 * <table>
 *   <tableRow>
 *      <tableCell></tableCell>
 *   </tableRow>
 * </table>
 * ```
 *
 * Will be fixed to:
 *
 * ```xml
 * <table>
 *   <tableRow>
 *      <tableCell><paragraph></paragraph></tableCell>
 *   </tableRow>
 * </table>
 * ```
 */
export default function injectTableCellParagraphPostFixer( model: Model ): void {
	model.document.registerPostFixer( writer => tableCellContentsPostFixer( writer, model ) );
}

/**
 * The table cell contents post-fixer.
 */
function tableCellContentsPostFixer( writer: Writer, model: Model ) {
	const changes = model.document.differ.getChanges();

	let wasFixed = false;

	for ( const entry of changes ) {
		if ( entry.type == 'insert' && entry.name == 'table' ) {
			wasFixed = fixTable( entry.position.nodeAfter as Element, writer ) || wasFixed;
		}

		if ( entry.type == 'insert' && entry.name == 'tableRow' ) {
			wasFixed = fixTableRow( entry.position.nodeAfter as Element, writer ) || wasFixed;
		}

		if ( entry.type == 'insert' && entry.name == 'tableCell' ) {
			wasFixed = fixTableCellContent( entry.position.nodeAfter as Element, writer ) || wasFixed;
		}

		if ( ( entry.type == 'remove' || entry.type == 'insert' ) && checkTableCellChange( entry ) ) {
			wasFixed = fixTableCellContent( entry.position.parent as Element, writer ) || wasFixed;
		}
	}

	return wasFixed;
}

/**
 * Fixes all table cells in a table.
 */
function fixTable( table: Element, writer: Writer ) {
	let wasFixed = false;

	for ( const row of table.getChildren() ) {
		if ( row.is( 'element', 'tableRow' ) ) {
			wasFixed = fixTableRow( row, writer ) || wasFixed;
		}
	}

	return wasFixed;
}

/**
 * Fixes all table cells in a table row.
 */
function fixTableRow( tableRow: Element, writer: Writer ) {
	let wasFixed = false;

	for ( const tableCell of tableRow.getChildren() as IterableIterator<Element> ) {
		wasFixed = fixTableCellContent( tableCell, writer ) || wasFixed;
	}

	return wasFixed;
}

/**
 * Fixes all table cell content by:
 * - Adding a paragraph to a table cell without any child.
 * - Wrapping direct $text in a `<paragraph>`.
 */
function fixTableCellContent( tableCell: Element, writer: Writer ) {
	// Insert paragraph to an empty table cell.
	if ( tableCell.childCount == 0 ) {
		// @if CK_DEBUG_TABLE // console.log( 'Post-fixing table: insert paragraph in empty cell.' );

		writer.insertElement( 'paragraph', tableCell );

		return true;
	}

	// Check table cell children for directly placed text nodes.
	// Temporary solution. See https://github.com/ckeditor/ckeditor5/issues/1464.
	const textNodes = Array.from( tableCell.getChildren() ).filter( child => child.is( '$text' ) );

	// @if CK_DEBUG_TABLE // textNodes.length && console.log( 'Post-fixing table: wrap cell content with paragraph.' );

	for ( const child of textNodes ) {
		writer.wrap( writer.createRangeOn( child ), 'paragraph' );
	}

	// Return true when there were text nodes to fix.
	return !!textNodes.length;
}

/**
 * Checks if a differ change should fix the table cell. This happens on:
 * - Removing content from the table cell (i.e. `tableCell` can be left empty).
 * - Adding a text node directly into a table cell.
 */
function checkTableCellChange( entry: DiffItemInsert | DiffItemRemove ) {
	if ( !entry.position.parent.is( 'element', 'tableCell' ) ) {
		return false;
	}

	return entry.type == 'insert' && entry.name == '$text' || entry.type == 'remove';
}
