/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
* @module list/listproperties/utils/style
*/

const LIST_STYLE_TO_LIST_TYPE: Record<string, 'bulleted' | 'numbered' | undefined> = {};
const LIST_STYLE_TO_TYPE_ATTRIBUTE: Record<string, string | null | undefined> = {};
const TYPE_ATTRIBUTE_TO_LIST_STYLE: Record<string, string | undefined> = {};

const LIST_STYLE_TYPES: Array<{ listStyle: string; typeAttribute: string | null; listType: 'bulleted' | 'numbered' }> = [
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
 */
export function getAllSupportedStyleTypes(): Array<string> {
	return LIST_STYLE_TYPES.map( x => x.listStyle );
}

/**
 * Checks whether the given list-style-type is supported by numbered or bulleted list.
 */
export function getListTypeFromListStyleType( listStyleType: string ): 'bulleted' | 'numbered' | null {
	return LIST_STYLE_TO_LIST_TYPE[ listStyleType ] || null;
}

/**
 * Converts `type` attribute of `<ul>` or `<ol>` elements to `list-style-type` equivalent.
 */
export function getListStyleTypeFromTypeAttribute( value: string ): string | null {
	return TYPE_ATTRIBUTE_TO_LIST_STYLE[ value ] || null;
}

/**
 * Converts `list-style-type` style to `type` attribute of `<ul>` or `<ol>` elements.
 */
export function getTypeAttributeFromListStyleType( value: string ): string | null {
	return LIST_STYLE_TO_TYPE_ATTRIBUTE[ value ] || null;
}

/**
 * Returns a list of list styles that are aliases of the given list style.
 * For example:
 *
 * 	* `lower-alpha` is an alias of `lower-latin`
 * 	* `upper-alpha` is an alias of `upper-latin`
 *
 * See more: https://www.w3.org/TR/1998/PR-CSS2-19980324/lists.html#list-props
 *
 * @param listStyle The list style to get aliases for. E.g. `lower-alpha`. If `null`, an empty array is returned.
 * @returns A list of list styles that are aliases of the given list style (excluding the given list style).
 */
export function getListStyleAliases( listStyle: string | null ): Array<string> {
	switch ( listStyle ) {
		case 'lower-latin': return [ 'lower-alpha' ];
		case 'lower-alpha': return [ 'lower-latin' ];
		case 'upper-latin': return [ 'upper-alpha' ];
		case 'upper-alpha': return [ 'upper-latin' ];
		default:
			return [];
	}
}
