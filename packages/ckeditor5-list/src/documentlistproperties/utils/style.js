/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
* @module list/documentlistproperties/utils/style
*/

const BULLETED_LIST_STYLE_TYPES = [ 'disc', 'circle', 'square' ];

// There's a lot of them (https://www.w3.org/TR/css-counter-styles-3/#typedef-counter-style).
// Let's support only those that can be selected by ListPropertiesUI.
const NUMBERED_LIST_STYLE_TYPES = [
	'decimal',
	'decimal-leading-zero',
	'lower-roman',
	'upper-roman',
	'lower-latin',
	'upper-latin',
	'lower-alpha',
	'upper-alpha'
];

/**
* Checks whether the given list-style-type is supported by numbered or bulleted list.
*
* @param {String} listStyleType
* @returns {'bulleted'|'numbered'|null}
*/
export function getListTypeFromListStyleType( listStyleType ) {
	if ( BULLETED_LIST_STYLE_TYPES.includes( listStyleType ) ) {
		return 'bulleted';
	}

	if ( NUMBERED_LIST_STYLE_TYPES.includes( listStyleType ) ) {
		return 'numbered';
	}

	return null;
}
