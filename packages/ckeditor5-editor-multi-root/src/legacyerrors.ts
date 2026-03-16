/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module editor-multi-root/legacyerrors
 */

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

if ( false ) {
	/**
	 * Trying to set attributes on a non-existing root.
	 *
	 * Roots specified in legacy `config.rootsAttributes` do not match initial editor roots.
	 * Use `config.roots.<rootName>.modelAttributes` instead.
	 *
	 * @error multi-root-editor-root-attributes-no-root
	 */
	throw new CKEditorError( 'multi-root-editor-root-attributes-no-root', null );
}
