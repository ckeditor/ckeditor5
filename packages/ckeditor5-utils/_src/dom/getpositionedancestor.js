/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * This is just a temporary migration file, please ignore it. This will be removed after migration to TypeScript is complete.
 */

/**
 * @module utils/dom/getpositionedancestor
 */

import global from './global';

/**
 * For a given element, returns the nearest ancestor element which CSS position is not "static".
 *
 * @param {HTMLElement} element The native DOM element to be checked.
 * @returns {HTMLElement|null}
 */
export default function getPositionedAncestor( element ) {
	if ( !element || !element.parentNode ) {
		return null;
	}

	if ( element.offsetParent === global.document.body ) {
		return null;
	}

	return element.offsetParent;
}
