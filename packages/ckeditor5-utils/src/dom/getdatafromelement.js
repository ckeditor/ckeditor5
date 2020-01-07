/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals HTMLTextAreaElement */

/**
 * @module utils/dom/getdatafromelement
 */

/**
 * Gets data from a given source element.
 *
 * @param {HTMLElement} el The element from which the data will be retrieved.
 * @returns {String} The data string.
 */
export default function getDataFromElement( el ) {
	if ( el instanceof HTMLTextAreaElement ) {
		return el.value;
	}

	return el.innerHTML;
}
