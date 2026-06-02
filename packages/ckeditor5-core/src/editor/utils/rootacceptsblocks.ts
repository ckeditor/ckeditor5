/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/rootacceptsblocks
 */

import type { Editor } from '../editor.js';

/**
 * Returns whether the model root with the given name accepts `$block` children according to the editor's schema.
 *
 * Call this once the plugin initialization phase is finished — typically during UI init or right after creating
 * a new editable — so the schema reflects any plugin-registered root types or additional content rules.
 *
 * @internal
 */
export function rootAcceptsBlocks( editor: Editor, rootName: string ): boolean {
	const root = editor.model.document.getRoot( rootName )!;

	return editor.model.schema.checkChild( root, '$block' );
}
