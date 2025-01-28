/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/utils/ui/widget
 */

import type { ViewDocumentFragment, ViewDocumentSelection, ViewElement, ViewNode } from 'ckeditor5/src/engine.js';

import { isWidget } from 'ckeditor5/src/widget.js';

/**
 * Depending on the position of the selection either return the selected table or the table higher in the hierarchy.
 */
export function getSelectionAffectedTableWidget( selection: ViewDocumentSelection ): ViewElement | null {
	const selectedTable = getSelectedTableWidget( selection );

	if ( selectedTable ) {
		return selectedTable;
	}

	return getTableWidgetAncestor( selection );
}

/**
 * Returns a table widget editing view element if one is selected.
 */
export function getSelectedTableWidget( selection: ViewDocumentSelection ): ViewElement | null {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isTableWidget( viewElement ) ) {
		return viewElement;
	}

	return null;
}

/**
 * Returns a table widget editing view element if one is among the selection's ancestors.
 */
export function getTableWidgetAncestor( selection: ViewDocumentSelection ): ViewElement | null {
	const selectionPosition = selection.getFirstPosition();

	if ( !selectionPosition ) {
		return null;
	}

	let parent: ViewNode | ViewDocumentFragment | null = selectionPosition.parent;

	while ( parent ) {
		if ( parent.is( 'element' ) && isTableWidget( parent ) ) {
			return parent;
		}

		parent = parent.parent;
	}

	return null;
}

/**
 * Checks if a given view element is a table widget.
 */
function isTableWidget( viewElement: ViewElement ): boolean {
	return !!viewElement.getCustomProperty( 'table' ) && isWidget( viewElement );
}
