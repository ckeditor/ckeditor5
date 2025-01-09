/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/insertat
 */

/**
 * Inserts node to the parent at given index.
 *
 * @param parentElement Parent element.
 * @param index Insertions index.
 * @param nodeToInsert Node to insert.
 */
export default function insertAt(
	parentElement: Element,
	index: number,
	nodeToInsert: Node
): void {
	parentElement.insertBefore( nodeToInsert, parentElement.childNodes[ index ] || null );
}
