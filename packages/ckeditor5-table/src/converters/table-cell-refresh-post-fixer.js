/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/table-cell-refresh-post-fixer
 */

/**
 * Injects a table cell post-fixer into the model which marks the table cell in the differ to have it re-rendered.
 *
 * Model `paragraph` inside a table cell can be rendered as `<span>` or `<p>`. It is rendered as `<span>` if this is the only block
 * element in that table cell and it does not have any attributes. It is rendered as `<p>` otherwise.
 *
 * When table cell content changes, for example a second `paragraph` element is added, we need to ensure that the first `paragraph` is
 * re-rendered so it changes from `<span>` to `<p>`. The easiest way to do it is to re-render the entire table cell.
 *
 * @param {module:engine/model/model~Model} model
 */
export default function injectTableCellRefreshPostFixer( model ) {
	model.document.registerPostFixer( () => tableCellRefreshPostFixer( model ) );
}

function tableCellRefreshPostFixer( model ) {
	const differ = model.document.differ;

	// Stores cells to be refreshed so the table cell will be refreshed once for multiple changes.
	const cellsToRefresh = new Set();

	// Counting the paragraph inserts to verify if it increased to more than one paragraph in the current differ.
	let insertCount = 0;

	for ( const change of differ.getChanges() ) {
		const parent = change.type == 'insert' || change.type == 'remove' ? change.position.parent : change.range.start.parent;

		if ( !parent.is( 'tableCell' ) ) {
			continue;
		}

		if ( change.type == 'insert' ) {
			insertCount++;
		}

		if ( checkRefresh( parent, change.type, insertCount ) ) {
			cellsToRefresh.add( parent );
		}
	}

	if ( cellsToRefresh.size ) {
		for ( const tableCell of cellsToRefresh.values() ) {
			differ.refreshItem( tableCell );
		}

		return true;
	}

	return false;
}

// Checks if the model table cell requires refreshing to be re-rendered to a proper state in the view.
//
// This method detects changes that will require renaming `<span>` to `<p>` (or vice versa) in the view.
//
// This method is a simple heuristic that checks only a single change and will sometimes give a false positive result when multiple changes
// will result in a state that does not require renaming in the view (but will be seen as requiring a refresh).
//
// For instance: A `<span>` should be renamed to `<p>` when adding an attribute to a `<paragraph>`.
// But adding one attribute and removing another one will result in a false positive: the check for an added attribute will see one
// attribute on a paragraph and will falsely qualify such change as adding an attribute to a paragraph without any attribute.
//
// @param {module:engine/model/element~Element} tableCell The table cell to check.
// @param {String} type Type of change.
// @param {Number} insertCount The number of inserts in differ.
function checkRefresh( tableCell, type, insertCount ) {
	const hasInnerParagraph = Array.from( tableCell.getChildren() ).some( child => child.is( 'paragraph' ) );

	// If there is no paragraph in table cell then the view doesn't require refreshing.
	//
	// Why? What we really want to achieve is to make all the old paragraphs (which weren't added in this batch) to be
	// converted once again, so that the paragraph-in-table-cell converter can correctly create a `<p>` or a `<span>` element.
	// If there are no paragraphs in the table cell, we don't care.
	if ( !hasInnerParagraph ) {
		return false;
	}

	// For attribute change we only refresh if there is a single paragraph as in this case we may want to change existing `<span>` to `<p>`.
	if ( type == 'attribute' ) {
		const attributesCount = Array.from( tableCell.getChild( 0 ).getAttributeKeys() ).length;

		return tableCell.childCount === 1 && attributesCount < 2;
	}

	// For other changes (insert, remove) the `<span>` to `<p>` change is needed when:
	//
	// - another element is added to a single paragraph (childCount becomes >= 2)
	// - another element is removed and a single paragraph is left (childCount == 1)
	//
	// Change is not needed if there was multiple blocks before change.
	return tableCell.childCount <= ( type == 'insert' ? insertCount + 1 : 1 );
}
