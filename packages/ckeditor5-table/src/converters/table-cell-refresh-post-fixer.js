/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/table-cell-refresh-post-fixer
 */

import { isSingleParagraphWithoutAttributes } from './downcast';

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
 * @param {module:engine/conversion/mapper~Mapper} mapper
 */
export default function injectTableCellRefreshPostFixer( model, mapper ) {
	model.document.registerPostFixer( () => tableCellRefreshPostFixer( model.document.differ, mapper ) );
}

function tableCellRefreshPostFixer( differ, mapper ) {
	// Stores cells to be refreshed, so the table cell will be refreshed once for multiple changes.

	// 1. Gather all changes inside table cell.
	const cellsToCheck = new Set();

	for ( const change of differ.getChanges() ) {
		const parent = change.type == 'attribute' ? change.range.start.parent : change.position.parent;

		if ( parent.is( 'element', 'tableCell' ) ) {
			cellsToCheck.add( parent );
		}
	}

	// @if CK_DEBUG_TABLE // console.log( `Post-fixing table: Checking table cell to refresh (${ cellsToCheck.size }).` );
	// @if CK_DEBUG_TABLE // let paragraphsRefreshed = 0;

	for ( const tableCell of cellsToCheck.values() ) {
		for ( const paragraph of [ ...tableCell.getChildren() ].filter( child => shouldRefresh( child, mapper ) ) ) {
			// @if CK_DEBUG_TABLE // console.log( `Post-fixing table: refreshing paragraph in table cell (${++paragraphsRefreshed}).` );
			differ.refreshItem( paragraph );
		}
	}

	// Always return false to prevent the refresh post-fixer from re-running on the same set of changes and going into an infinite loop.
	// This "post-fixer" does not change the model structure so there shouldn't be need to run other post-fixers again.
	// See https://github.com/ckeditor/ckeditor5/issues/1936 & https://github.com/ckeditor/ckeditor5/issues/8200.
	return false;
}

// Check if given model element needs refreshing.
//
// @param {module:engine/model/element~Element} modelElement
// @param {module:engine/conversion/mapper~Mapper} mapper
// @returns {Boolean}
function shouldRefresh( child, mapper ) {
	if ( !child.is( 'element', 'paragraph' ) ) {
		return false;
	}

	const viewElement = mapper.toViewElement( child );

	if ( !viewElement ) {
		return false;
	}

	return isSingleParagraphWithoutAttributes( child ) !== viewElement.is( 'element', 'span' );
}
