/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getdatafromelement
 */

/**
 * Gets data from a given source element.
 *
 * @param el The element from which the data will be retrieved.
 * @returns The data string.
 */
export default function getDataFromElement( el: HTMLElement ): string {
	if ( el instanceof HTMLTextAreaElement ) {
		return el.value;
	}

	return el.innerHTML;
}
