/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/legacyerrors
 */

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

if ( false ) {
	/**
	 * The `config.initialData` option cannot be used together with the initial data passed as the first parameter of
	 * {@link module:core/editor/editor~Editor.create `Editor.create()`}.
	 *
	 * @error editor-create-initial-data
	 */
	throw new CKEditorError( 'editor-create-initial-data', null );
}
