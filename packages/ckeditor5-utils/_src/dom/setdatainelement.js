/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * This is just a temporary migration file, please ignore it. This will be removed after migration to TypeScript is complete.
 */

/**
 * @module utils/dom/setdatainelement
 */

/* globals HTMLTextAreaElement */

/**
 * Sets data in a given element.
 *
 * @param {HTMLElement} el The element in which the data will be set.
 * @param {String} data The data string.
 */
export default function setDataInElement( el, data ) {
	if ( el instanceof HTMLTextAreaElement ) {
		el.value = data;
	}

	el.innerHTML = data;
}
