/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/dataprocessor/htmlwriter
 */

/**
 * The HTML writer interface.
 */
export default interface HtmlWriter {

	/**
	 * Returns an HTML string created from a document fragment.
	 */
	getHtml( fragment: DocumentFragment ): string;
}
