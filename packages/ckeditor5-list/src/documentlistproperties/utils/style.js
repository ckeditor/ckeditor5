/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
* @module list/documentlistproperties/utils/style
*/

const LIST_STYLE_TO_LIST_TYPE = {};
const LIST_STYLE_TO_TYPE_ATTRIBUTE = {};
const TYPE_ATTRIBUTE_TO_LIST_STYLE = {};

const LIST_STYLE_TYPES = [
	{ listStyle: 'disc', typeAttribute: 'disc', listType: 'bulleted' },
	{ listStyle: 'circle', typeAttribute: 'circle', listType: 'bulleted' },
	{ listStyle: 'square', typeAttribute: 'square', listType: 'bulleted' },
	{ listStyle: 'decimal', typeAttribute: '1', listType: 'numbered' },
	{ listStyle: 'decimal-leading-zero', typeAttribute: null, listType: 'numbered' },
	{ listStyle: 'lower-roman', typeAttribute: 'i', listType: 'numbered' },
	{ listStyle: 'upper-roman', typeAttribute: 'I', listType: 'numbered' },
	{ listStyle: 'lower-alpha', typeAttribute: 'a', listType: 'numbered' },
	{ listStyle: 'upper-alpha', typeAttribute: 'A', listType: 'numbered' },
	{ listStyle: 'lower-latin', typeAttribute: 'a', listType: 'numbered' },
	{ listStyle: 'upper-latin', typeAttribute: 'A', listType: 'numbered' }
];

for ( const { listStyle, typeAttribute, listType } of LIST_STYLE_TYPES ) {
	LIST_STYLE_TO_LIST_TYPE[ listStyle ] = listType;
	LIST_STYLE_TO_TYPE_ATTRIBUTE[ listStyle ] = typeAttribute;

	if ( typeAttribute ) {
		TYPE_ATTRIBUTE_TO_LIST_STYLE[ typeAttribute ] = listStyle;
	}
}

/**
 * Gets all the style types supported by given list type.
 *
 * @returns {Array.<String>}
 */
export function getAllSupportedStyleTypes() {
	return LIST_STYLE_TYPES.map( x => x.listStyle );
}

/**
* Checks whether the given list-style-type is supported by numbered or bulleted list.
*
* @param {String} listStyleType
* @returns {'bulleted'|'numbered'|null}
*/
export function getListTypeFromListStyleType( listStyleType ) {
	return LIST_STYLE_TO_LIST_TYPE[ listStyleType ] || null;
}

/**
 * Converts `type` attribute of `<ul>` or `<ol>` elements to `list-style-type` equivalent.
 *
 * @param {String} value
 * @returns {String|null}
 */
export function getListStyleTypeFromTypeAttribute( value ) {
	return TYPE_ATTRIBUTE_TO_LIST_STYLE[ value ] || null;
}

/**
 * Converts `list-style-type` style to `type` attribute of `<ul>` or `<ol>` elements.
 *
 * @param {String} value
 * @returns {String|null}
 */
export function getTypeAttributeFromListStyleType( value ) {
	return LIST_STYLE_TO_TYPE_ATTRIBUTE[ value ] || null;
}
