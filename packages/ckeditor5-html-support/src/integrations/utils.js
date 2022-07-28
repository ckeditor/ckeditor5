/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/utils
 */

const VALID_NAME_REGEXP = /^(?!xml|xmL|xMl|xML|Xml|XmL|XMl|XML)[a-zA-Z][a-zA-Z0-9\-_.]*$/;

/**
 * Checks if the given name is a valid HTML tag name including custom element name.
 *
 * @param {String} name
 * @returns {Boolean}
 */
export function isValidTagName( name ) {
	return name.match( VALID_NAME_REGEXP );
}
