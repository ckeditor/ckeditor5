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

	let fixed = false;

	for ( const change of differ.getChanges() ) {
		const parent = change.type == 'insert' || change.type == 'remove' ? change.position.parent : change.range.start.parent;

		if ( parent.is( 'tableCell' ) ) {
			differ.refreshItem( parent );

			fixed = true;
		}
	}

	return fixed;
}
