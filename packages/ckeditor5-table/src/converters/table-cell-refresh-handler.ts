/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/table-cell-refresh-handler
 */

import type { Editor } from 'ckeditor5/src/core.js';
import type {
	EditingController,
	ModelElement,
	Mapper,
	Model
} from 'ckeditor5/src/engine.js';

import { isSingleParagraphWithoutAttributes } from './downcast.js';
import { isTableCellTypeEnabled } from '../utils/common.js';

/**
 * A table cell refresh handler which marks the table cell in the differ to have it re-rendered.
 *
 * Model `paragraph` inside a table cell can be rendered as `<span>` or `<p>`. It is rendered as `<span>` if this is the only block
 * element in that table cell and it does not have any attributes. It is rendered as `<p>` otherwise.
 *
 * When table cell content changes, for example a second `paragraph` element is added, we need to ensure that the first `paragraph` is
 * re-rendered so it changes from `<span>` to `<p>`. The easiest way to do it is to re-render the entire table cell.
 *
 * @internal
 */
export function tableCellRefreshHandler( editor: Editor ): void {
	const { model, editing } = editor;

	refreshIfNestedChildChanged( model, editing );

	if ( isTableCellTypeEnabled( editor ) ) {
		refreshIfCellTypeChanged( model, editing );
	}
}

function refreshIfCellTypeChanged( model: Model, editing: EditingController ): void {
	const differ = model.document.differ;
	const cellsToReconvert = new Set<ModelElement>();

	for ( const change of differ.getChanges() ) {
		// If the `tableCellType` attribute changed, the entire cell needs to be re-rendered.
		if ( change.type === 'attribute' && change.attributeKey === 'tableCellType' ) {
			const tableCell = change.range.start.nodeAfter as ModelElement;

			if ( tableCell.is( 'element', 'tableCell' ) ) {
				cellsToReconvert.add( tableCell );
			}
		}
	}

	// Reconvert table cells that had their `tableCellType` attribute changed.
	for ( const tableCell of cellsToReconvert ) {
		const viewElement = editing.mapper.toViewElement( tableCell );
		const cellType = tableCell.getAttribute( 'tableCellType' );
		const expectedElementName = cellType === 'header' ? 'th' : 'td';

		if ( viewElement?.name !== expectedElementName ) {
			editing.reconvertItem( tableCell );
		}
	}
}

function refreshIfNestedChildChanged( model: Model, editing: EditingController ): void {
	const differ = model.document.differ;
	const cellsToCheck = new Set<ModelElement>();

	for ( const change of differ.getChanges() ) {
		// If any change happened inside a table cell, mark it for checking.
		const parent = change.type == 'attribute' ? change.range.start.parent : change.position.parent;

		if ( parent.is( 'element', 'tableCell' ) ) {
			cellsToCheck.add( parent as ModelElement );
		}
	}

	// Reconvert paragraphs inside table cells that need refreshing.
	for ( const tableCell of cellsToCheck ) {
		const paragraphsToRefresh = Array.from( tableCell.getChildren() )
			.filter( child => shouldRefreshCellParagraph( child as ModelElement, editing.mapper ) );

		for ( const paragraph of paragraphsToRefresh ) {
			editing.reconvertItem( paragraph );
		}
	}
}

/**
 * Check if given model element needs refreshing.
 */
function shouldRefreshCellParagraph( child: ModelElement, mapper: Mapper ) {
	if ( !child.is( 'element', 'paragraph' ) ) {
		return false;
	}

	const viewElement = mapper.toViewElement( child );

	if ( !viewElement ) {
		return false;
	}

	return isSingleParagraphWithoutAttributes( child ) !== viewElement.is( 'element', 'span' );
}
