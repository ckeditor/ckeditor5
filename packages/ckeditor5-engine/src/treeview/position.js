/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**Position in the tree. Position is always located before or after a node.
 *
 * @memberOf core.treeView
 */
export default class Position {
	/**
	 * Creates a position.
	 *
	 * @param {core.treeView.Element} parent Position parent element.
	 * @param {Number} offset Position offset.
	 */
	constructor( parent, offset ) {
		/**
		 * Position parent element.
		 *
		 * @member {core.treeView.Element} core.treeView.Position#parent
		 */
		this.parent = parent;

		/**
		 * Position offset.
		 *
		 * @member {Number} core.treeView.Position#offset
		 */
		this.offset = offset;
	}
}
