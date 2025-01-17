/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/table-cell-refresh-handler
 */

import type {
	EditingController,
	Element,
	Mapper,
	Model
} from 'ckeditor5/src/engine.js';

import { isSingleParagraphWithoutAttributes } from './downcast.js';

/**
 * A table cell refresh handler which marks the table cell in the differ to have it re-rendered.
 *
 * Model `paragraph` inside a table cell can be rendered as `<span>` or `<p>`. It is rendered as `<span>` if this is the only block
 * element in that table cell and it does not have any attributes. It is rendered as `<p>` otherwise.
 *
 * When table cell content changes, for example a second `paragraph` element is added, we need to ensure that the first `paragraph` is
 * re-rendered so it changes from `<span>` to `<p>`. The easiest way to do it is to re-render the entire table cell.
 */
export default function tableCellRefreshHandler( model: Model, editing: EditingController ): void {
	const differ = model.document.differ;

	// Stores cells to be refreshed, so the table cell will be refreshed once for multiple changes.
	const cellsToCheck = new Set();

	for ( const change of differ.getChanges() ) {
		const parent = change.type == 'attribute' ? change.range.start.parent : change.position.parent;

		if ( parent.is( 'element', 'tableCell' ) ) {
			cellsToCheck.add( parent );
		}
	}

	for ( const tableCell of cellsToCheck.values() as Iterable<Element> ) {
		const paragraphsToRefresh = Array.from( tableCell.getChildren() )
			.filter( child => shouldRefresh( child as Element, editing.mapper ) );

		for ( const paragraph of paragraphsToRefresh ) {
			editing.reconvertItem( paragraph );
		}
	}
}

/**
 * Check if given model element needs refreshing.
 */
function shouldRefresh( child: Element, mapper: Mapper ) {
	if ( !child.is( 'element', 'paragraph' ) ) {
		return false;
	}

	const viewElement = mapper.toViewElement( child );

	if ( !viewElement ) {
		return false;
	}

	return isSingleParagraphWithoutAttributes( child ) !== viewElement.is( 'element', 'span' );
}
