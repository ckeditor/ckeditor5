/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * This is just a temporary migration file, please ignore it. This will be removed after migration to TypeScript is complete.
 */

/**
 * @module utils/dom/insertat
 */

/**
 * Inserts node to the parent at given index.
 *
 * @param {Element} parentElement Parent element.
 * @param {Number} index Insertions index.
 * @param {Node} nodeToInsert Node to insert.
 */
export default function insertAt( parentElement, index, nodeToInsert ) {
	parentElement.insertBefore( nodeToInsert, parentElement.childNodes[ index ] || null );
}
