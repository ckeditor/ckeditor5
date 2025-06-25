/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/legacyerrors
 */

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

if ( false ) {
	/**
	 * The `Batch#type` property has been deprecated and will be removed in the near
	 * future. Use `Batch#isLocal`, `Batch#isUndoable`, `Batch#isUndo` and `Batch#isTyping` instead.
	 *
	 * @error batch-type-deprecated
	 */
	throw new CKEditorError( 'batch-type-deprecated', null );
}
