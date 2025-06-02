/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/legacyerrors
 */

import { CKEditorError } from 'ckeditor5/src/utils.js';

if ( false ) {
	/**
	 * The `DocumentList` plugin is obsolete. Use `List` instead.
	 *
	 * @error plugin-obsolete-documentlist
	 */
	throw new CKEditorError( 'plugin-obsolete-documentlist', null );

	/**
	 * The `DocumentListProperties` plugin is obsolete. Use `ListProperties` instead.
	 *
	 * @error plugin-obsolete-documentlistproperties
	 */
	throw new CKEditorError( 'plugin-obsolete-documentlistproperties', null );

	/**
	 * The `TodoDocumentList` plugin is obsolete. Use `TodoList` instead.
	 *
	 * @error plugin-obsolete-tododocumentlist
	 */
	throw new CKEditorError( 'plugin-obsolete-tododocumentlist', null );
}
