/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AttributeElement from '../engine/view/attributeelement.js';

/**
 * This class is to mark specific {@link engine.view.Node} as {@link link.LinkElement}.
 * E.g. There could be a situation when different features will create nodes with the same names,
 * and hence they must be identified somehow.
 *
 * @memberOf link
 * @extends engine.view.AttributeElement
 */
export default class LinkElement extends AttributeElement {
}
