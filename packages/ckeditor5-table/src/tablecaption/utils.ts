/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecaption/utils
 */

import type {
	DocumentFragment,
	DocumentSelection,
	Element,
	ViewElement
} from 'ckeditor5/src/engine';

/**
 * Checks if the provided model element is a `table`.
 *
 * @param modelElement Element to check if it is a table.
 */
export function isTable( modelElement: Element | DocumentFragment | null ): boolean {
	return !!modelElement && modelElement.is( 'element', 'table' );
}

/**
 * Returns the caption model element from a given table element. Returns `null` if no caption is found.
 *
 * @param tableModelElement Table element in which we will try to find a caption element.
 */
export function getCaptionFromTableModelElement( tableModelElement: Element ): Element | null {
	for ( const node of tableModelElement.getChildren() ) {
		if ( node.is( 'element', 'caption' ) ) {
			return node;
		}
	}

	return null;
}

/**
 * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
 *
 * @param selection The selection checked for caption presence.
 */
export function getCaptionFromModelSelection( selection: DocumentSelection ): Element | null {
	const tableElement = getSelectionAffectedTable( selection );

	if ( !tableElement ) {
		return null;
	}

	return getCaptionFromTableModelElement( tableElement );
}

/**
 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a caption.
 *
 * There are two possible forms of the valid caption:
 *  - A `<figcaption>` element inside a `<figure class="table">` element.
 *  - A `<caption>` inside a <table>.
 *
 * @returns Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element cannot be matched.
 */
export function matchTableCaptionViewElement( element: ViewElement ): { name: true } | null {
	const parent = element.parent;

	if ( element.name == 'figcaption' && parent && parent.is( 'element', 'figure' ) && parent.hasClass( 'table' ) ) {
		return { name: true };
	}

	if ( element.name == 'caption' && parent && parent.is( 'element', 'table' ) ) {
		return { name: true };
	}

	return null;
}

/**
 * Depending on the position of the selection we either return the table under cursor or look for the table higher in the hierarchy.
 */
export function getSelectionAffectedTable( selection: DocumentSelection ): Element {
	const selectedElement = selection.getSelectedElement();

	// Is the command triggered from the `tableToolbar`?
	if ( selectedElement && selectedElement.is( 'element', 'table' ) ) {
		return selectedElement;
	}

	return selection.getFirstPosition()!.findAncestor( 'table' )!;
}
