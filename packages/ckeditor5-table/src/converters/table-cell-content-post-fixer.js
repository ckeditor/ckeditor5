/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/table-cell-content-post-fixer
 */

/**
 * Injects a table cell post-fixer into the model.
 *
 * The role of the table post-fixer is to ensure that the table cells have the correct content
 * after a {@link module:engine/model/model~Model#change `change()`} block was executed.
 *
 * A table cells must contains at least one block as a child. The empty table cell will have empty `<paragraph>` as a child.
 *
 *        <table>
 *            <tableRow>
 *                <tableCell></tableCell>
 *            </tableRow>
 *        </table>
 *
 * Will be fixed to:
 *
 *        <table>
 *            <tableRow>
 *                <tableCell><paragraph></paragraph></tableCell>
 *            </tableRow>
 *        </table>
 *
 * @param {module:engine/model/model~Model} model
 */
export default function injectTableCellContentPostFixer( model ) {
	model.document.registerPostFixer( writer => tableCellContentsPostFixer( writer, model ) );
}

// The table cell contents post-fixer.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/model~Model} model
function tableCellContentsPostFixer( writer, model ) {
	const changes = model.document.differ.getChanges();

	let wasFixed = false;

	for ( const entry of changes ) {
		// Enforce paragraph in tableCell even after other feature remove its contents.
		if ( entry.type == 'remove' && entry.position.parent.is( 'tableCell' ) ) {
			wasFixed = fixTableCellContent( entry.position.parent, writer ) || wasFixed;
		}

		// Analyze table cells on insertion.
		if ( entry.type == 'insert' ) {
			if ( entry.name == 'table' ) {
				wasFixed = fixTable( entry.position.nodeAfter, writer ) || wasFixed;
			}

			if ( entry.name == 'tableRow' ) {
				wasFixed = fixTableRow( entry.position.nodeAfter, writer ) || wasFixed;
			}

			if ( entry.name == 'tableCell' ) {
				wasFixed = fixTableCellContent( entry.position.nodeAfter, writer ) || wasFixed;
			}
		}
	}

	return wasFixed;
}

// Fixes all table cells in a table.
//
// @param {module:engine/model/element~Element} table
// @param {module:engine/model/writer~Writer} writer
function fixTable( table, writer ) {
	let wasFixed = false;

	for ( const row of table.getChildren() ) {
		wasFixed = fixTableRow( row, writer ) || wasFixed;
	}

	return wasFixed;
}

// Fixes all table cells in a table row.
//
// @param {module:engine/model/element~Element} tableRow
// @param {module:engine/model/writer~Writer} writer
function fixTableRow( tableRow, writer ) {
	let wasFixed = false;

	for ( const tableCell of tableRow.getChildren() ) {
		wasFixed = fixTableCellContent( tableCell, writer ) || wasFixed;
	}

	return wasFixed;
}

// Fixes all table cell content by:
// - adding paragraph to a table cell without any child.
// - wrapping direct $text in <paragraph>.
//
// @param {module:engine/model/element~Element} table
// @param {module:engine/model/writer~Writer} writer
// @returns {Boolean}
function fixTableCellContent( tableCell, writer ) {
	// Insert paragraph to an empty table cell.
	if ( tableCell.childCount == 0 ) {
		writer.insertElement( 'paragraph', tableCell );

		return true;
	}

	// Check table cell children for directly placed $text nodes.
	// Temporary solution. See https://github.com/ckeditor/ckeditor5/issues/1464.
	const textNodes = Array.from( tableCell.getChildren() ).filter( child => child.is( 'text' ) );

	for ( const child of textNodes ) {
		writer.wrap( writer.createRangeOn( child ), 'paragraph' );
	}

	// Return true when there were text nodes to fix.
	return !!textNodes.length;
}
