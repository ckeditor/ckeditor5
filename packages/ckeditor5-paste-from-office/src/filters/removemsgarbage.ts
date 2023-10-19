/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/removestyleblock
 */

import type { UpcastWriter, ViewDocumentFragment } from 'ckeditor5/src/engine';

/**
 * Removes `<style>` block added by Google Sheets to a copied content.
 *
 * @param documentFragment element `data.content` obtained from clipboard
 */
export default function removeMSGarbage( documentFragment: ViewDocumentFragment, writer: UpcastWriter ): void {
	console.log( Array.from( documentFragment.getChildren() ) );
}
