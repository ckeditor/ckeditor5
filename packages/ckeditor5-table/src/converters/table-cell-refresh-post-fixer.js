/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/table-cell-refresh-post-fixer
 */

/**
 * Injects a table cell post-fixer into the model which marks the table cell in the differ to have it re-rendered.
 *
 * Model `paragraph` inside a table cell can be rendered as `<span>` or `<p>`. It is rendered as `<span>` if this is the only block
 * element in that table cell and it doesn't have any attributes. It is rendered as `<p>` otherwise.
 *
 * When table cell content changes, for example a second `paragraph` element is added we need to ensure that the first `paragraph` is
 * re-rendered so it changes to `<p>` from `<span>`. The easiest way to do it is to re-render whole table cell.
 *
 * @param {module:engine/model/model~Model} model
 */
export default function injectTableCellRefreshPostFixer( model ) {
	model.document.registerPostFixer( () => tableCellRefreshPostFixer( model ) );
}

function tableCellRefreshPostFixer( model ) {
	const differ = model.document.differ;

	// Stores cells to be refreshed so the table cell will be refreshed once for multiple changes.
	const cellToRefresh = new Set();

	for ( const change of differ.getChanges() ) {
		const parent = change.type == 'insert' || change.type == 'remove' ? change.position.parent : change.range.start.parent;

		if ( parent.is( 'tableCell' ) && checkRefresh( parent, change.type ) ) {
			cellToRefresh.add( parent );
		}
	}

	if ( cellToRefresh.size ) {
		for ( const tableCell of cellToRefresh.values() ) {
			differ.refreshItem( tableCell );
		}

		return true;
	}

	return false;
}

// Check if the model table cell requires refreshing to be re-rendered to a proper state in the view.
//
// This methods detects changes that will require renaming <span> to <p> (or vice versa) in the view,
//
// This method is simple heuristic that check only single change and will give false positive result when many changes will result
// in a state that does not require renaming in the view.
//
// For instance: The <span> to <p> should be renamed when adding an attribute to a <paragraph>.
// But adding one attribute and removing another will result in false positive: the check for added attribute will see one attribute
// on a paragraph and will falsy qualify such change as adding attribute to a paragraph without any attribute.
//
// @param {module:engine/model/element~Element} tableCell Table cell to check.
// @param {String} type Type of change.
function checkRefresh( tableCell, type ) {
	// If all children of a table cell were removed - refresh it.
	if ( !tableCell.childCount ) {
		return true;
	}

	const hasInnerParagraph = Array.from( tableCell.getChildren() ).some( child => child.is( 'paragraph' ) );

	// If there is no paragraph in table cell then the view doesn't require refreshing.
	if ( !hasInnerParagraph ) {
		return false;
	}

	// For attribute change we only refresh single paragraphs as they might trigger <span> to <p> change in the view.
	if ( type == 'attribute' ) {
		return tableCell.childCount === 1 && Array.from( tableCell.getChild( 0 ).getAttributeKeys() ).length < 2;
	}

	// For other changes (insert/remove) the <span> to <p> change can occur when:
	// - sibling is added to a single paragraph (childCount == 2)
	// - sibling is removed and single paragraph is left (childCount == 1)
	return tableCell.childCount <= ( type == 'insert' ? 2 : 1 );
}
