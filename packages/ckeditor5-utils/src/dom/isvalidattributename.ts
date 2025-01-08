/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/isvalidattributename
 */

import global from './global.js';

/**
 * Checks if the given attribute name is valid in terms of HTML.
 *
 * @param name Attribute name.
 */
export default function isValidAttributeName( name: string ): boolean {
	try {
		global.document.createAttribute( name );
	} catch ( error ) {
		return false;
	}

	return true;
}
