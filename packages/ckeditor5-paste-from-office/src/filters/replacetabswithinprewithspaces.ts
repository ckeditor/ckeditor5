/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/replacetabswithinprewithspaces
 */

import type { ViewDocumentFragment, ViewUpcastWriter, ViewText, ViewElement } from 'ckeditor5/src/engine.js';

/**
 * Replaces tab characters with spaces in text nodes that are inside elements styled with `white-space: pre-wrap`.
 *
 * This is a workaround for incorrect detection of pre-like formatting in the DOM converter for pasted Google Docs documents.
 * When an element uses `white-space: pre-wrap`, the editor reduces tab characters to a single space, causing
 * inconsistent spacing in pasted content. This function replaces tabs with spaces to ensure visual consistency.
 * This is intended as a temporary solution.
 *
 * See: https://github.com/ckeditor/ckeditor5/issues/18995
 *
 * @param documentFragment The `data.content` element obtained from the clipboard.
 * @param writer The upcast writer used to manipulate the view structure.
 * @param tabWidth The number of spaces to replace each tab with. Defaults to 8.
 * @internal
 */
export function replaceTabsWithinPreWithSpaces(
	documentFragment: ViewDocumentFragment,
	writer: ViewUpcastWriter,
	tabWidth: number
): void {
	// Collect all text nodes with tabs that are inside pre-wrap elements.
	const textNodesToReplace: Set<ViewText> = new Set();

	for ( const child of writer.createRangeIn( documentFragment ).getItems() ) {
		if ( !child.is( 'view:$textProxy' ) || !child.data.includes( '\t' ) ) {
			continue;
		}

		// Check if any parent has `white-space: pre-wrap`.
		if ( hasPreWrapParent( child.parent ) ) {
			textNodesToReplace.add( child.textNode );
		}
	}

	// Replace tabs in each collected text node.
	for ( const textNode of textNodesToReplace ) {
		replaceTabsInTextNode( textNode, writer, tabWidth );
	}
}

/**
 * Checks if element or any of its parents has `white-space: pre-wrap` style.
 */
function hasPreWrapParent( element: ViewDocumentFragment | ViewElement | null ): boolean {
	let parent = element;

	while ( parent ) {
		if ( parent.is( 'element' ) ) {
			const whiteSpace = parent.getStyle?.( 'white-space' );

			if ( whiteSpace === 'pre-wrap' ) {
				return true;
			}
		}

		parent = parent.parent;
	}

	return false;
}

/**
 * Replaces all tabs with spaces in the given text node.
 */
function replaceTabsInTextNode( textNode: ViewText, writer: ViewUpcastWriter, tabWidth: number ): void {
	const { parent, data } = textNode;

	const replacedData = data.replaceAll( '\t', ' '.repeat( tabWidth ) );
	const index = parent!.getChildIndex( textNode );

	// Remove old node and insert new one with replaced tabs.
	writer.remove( textNode );
	writer.insertChild( index, writer.createText( replacedData ), parent! );
}
