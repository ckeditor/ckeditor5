/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Creates a position.
 *
 * @param {core.treeView.Element} parent Position parent element.
 * @param {Number} offset Position offset.
 *
 * @class core.treeView.Position
 * @classdesc Position in the tree. Position is always located before or after a node.
 */
export default class Position {
	constructor( parent, offset ) {
		/**
		 * Position parent element.
		 *
		 * @member core.treeView.Position#parent
		 * @type {core.treeView.Element}
		 */
		this.parent = parent;

		/**
		 * Position offset.
		 *
		 * @member core.treeView.Position#offset
		 * @type {Number}
		 */
		this.offset = offset;
	}
}
