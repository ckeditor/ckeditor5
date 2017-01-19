/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/linkelement
 */

import AttributeElement from '@ckeditor/ckeditor5-engine/src/view/attributeelement';

/**
 * This class is to mark specific {@link module:engine/view/node~Node} as {@link module:link/linkelement~LinkElement}.
 * E.g. There could be a situation when different features will create nodes with the same names,
 * and hence they must be identified somehow.
 *
 * @extends module:engine/view/attributelement~AttributeElement
 */
export default class LinkElement extends AttributeElement {
}
