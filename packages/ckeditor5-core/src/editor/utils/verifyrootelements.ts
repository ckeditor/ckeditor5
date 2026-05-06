/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/verifyrootelements
 */

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import type { Editor } from '../editor.js';

/**
 * Verifies that all model root elements are registered in the schema as limit elements.
 *
 * @internal
 */
export function verifyRootElements( editor: Editor ): void {
	const schema = editor.model.schema;
	const document = editor.model.document;

	// Iterate `document.roots` directly instead of `document.getRootNames()` because the latter filters out roots
	// that are not loaded yet (e.g. lazy roots in the multi-root editor), which still need to be verified.
	// Detached roots are skipped – a detached root is equivalent to being removed, so there is no point in validating it.
	for ( const root of document.roots ) {
		if ( root === document.graveyard || !root.isAttached() ) {
			continue;
		}

		if ( !schema.isLimit( root ) ) {
			/**
			 * The model root element must be a {@link module:engine/model/schema~ModelSchemaItemDefinition#isLimit limit element}.
			 * The element name specified in
			 * {@link module:core/editor/editorconfig~RootConfig#modelElement `config.root.modelElement`}
			 * (or `config.roots.<rootName>.modelElement`) must be registered in the schema
			 * with `isLimit` set to `true`.
			 *
			 * @error editor-root-element-is-not-limit
			 * @param rootName The name of the root that uses a non-limit element.
			 * @param elementName The name of the model element used for the root.
			 */
			throw new CKEditorError( 'editor-root-element-is-not-limit', null, {
				rootName: root.rootName,
				elementName: root.name
			} );
		}
	}
}
