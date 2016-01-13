/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Position in the tree. Position is always located before or after a node.
 *
 * @class treeModel.Position
 */
 export default class Position {
	/**
	 * Creates a position.
	 *
	 * @param {treeView.Element} parent Position parent element.
	 * @param {Number} offset Position offset.
	 * @constructor
	 */
	constructor( parent, offset ) {
		/**
		 * Position parent element.
		 *
		 * @type {treeView.Element}
		 */
		this.parent = parent;

		/**
		 * Position offset.
		 *
		 * @type {Number}
		 */
		this.offset = offset;
	}
}
