/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * Escapes HTML tags in string to prevent XSS attack.
 *
 * @param html HTML string
 * @returns String with escaped HTML tags.
 */
export default function sanitizeHTML( html: string ): string {
	const temp = document.createElement( 'div' );
	temp.textContent = html;
	return temp.innerHTML;
}
