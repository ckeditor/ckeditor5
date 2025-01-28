/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/elementdefinition
 */

import type { ArrayOrItem } from '@ckeditor/ckeditor5-utils';

/**
 * A plain object that describes a view element in a way that a concrete, exact view element could be created from that description.
 *
 * ```ts
 * const viewDefinition = {
 * 	name: 'h1',
 * 	classes: [ 'foo', 'bar' ]
 * };
 * ```
 *
 * Above describes a view element:
 *
 * ```html
 * <h1 class="foo bar"></h1>
 * ```
 *
 * An example with styles and attributes:
 *
 * ```ts
 * const viewDefinition = {
 * 	name: 'span',
 * 	styles: {
 * 		'font-size': '12px',
 * 		'font-weight': 'bold'
 * 	},
 * 	attributes: {
 * 		'data-id': '123'
 * 	}
 * };
 * ```
 *
 * Describes:
 *
 * ```ts
 * <span style="font-size:12px;font-weight:bold" data-id="123"></span>
 * ```
 */
export interface ElementObjectDefinition {

	/**
	 * View element name.
	 */
	name: string;

	/**
	 * Class name or array of class names to match. Each name can be provided in a form of string.
	 */
	classes?: ArrayOrItem<string>;

	/**
	 * Object with key-value pairs representing styles. Each object key represents style name. Value under that key must be a string.
	 */
	styles?: Record<string, string>;

	/**
	 * Object with key-value pairs representing attributes. Each object key represents attribute name.
	 * Value under that key must be a string.
	 */
	attributes?: Record<string, string>;

	/**
	 * Element's {@link module:engine/view/attributeelement~AttributeElement#priority priority}.
	 */
	priority?: number;
}

/**
 * A plain object that describes a view element or element name.
 *
 * Elements without attributes can be given simply as a string:
 *
 * ```ts
 * const viewDefinition = 'p';
 * ```
 *
 * Which will be treated as:
 *
 * ```ts
 * const viewDefinition = {
 * 	name: 'p'
 * };
 * ```
 */
type ElementDefinition = string | ElementObjectDefinition;

export default ElementDefinition;
