/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';

/**
 * Tree view text proxy.
 * It is a wrapper for substring of {@link engine.view.Text}.
 *
 * @memberOf engine.view
 */
export default class TextProxy {
	/**
	 * Creates a tree view text proxy.
	 *
	 * @param {engine.view.Text} textNode Text node which text proxy is a substring.
	 * @param {Number} startOffset Offset from beginning of {#_textNodeParent} and first character of {#_data}.
	 * @param {Number} [length] Length of substring. If is not set the end offset is at the end of {#_textNodeParent}.
	 */
	constructor( textNode, startOffset, length ) {
		/**
		 * Element that is a parent of this node.
		 *
		 * @readonly
		 * @member {engine.view.Element|engine.view.DocumentFragment|null} engine.view.Node#parent
		 */
		this.parent = textNode.parent;

		/**
		 * Reference to the {@link engine.view.Text} element which TextProxy is a substring.
		 *
		 * @protected
		 * @readonly
		 * @member {engine.view.Text} engine.view.TextProxy#_textNode
		 */
		this._textNode = textNode;

		/**
		 * Index of the substring in the `textParent`.
		 *
		 * @protected
		 * @readonly
		 * @member {Number} engine.view.TextProxy#_index
		 */
		this._index = startOffset;

		/**
		 * The text content.
		 *
		 * @protected
		 * @readonly
		 * @member {String} engine.view.TextProxy#_data
		 */

		this._data = textNode._data.substring(
			startOffset,
			startOffset + ( length || textNode._data.length - startOffset )
		);
	}

	/**
	 * Gets {@link engine.view.Document} reference, from the {@link engine.view.Node#getRoot root} or
	 * returns null if the root has no reference to the {@link engine.view.Document}.
	 *
	 * @returns {engine.view.Document|null} View Document of the node or null.
	 */
	getDocument() {
		// Parent might be Node, null or DocumentFragment.
		if ( this.parent instanceof Node ) {
			return this.parent.getDocument();
		} else {
			return null;
		}
	}

	/**
	 * Gets the top parent for the node. If node has no parent it is the root itself.
	 *
	 * @returns {engine.view.Node}
	 */
	getRoot() {
		let root = this;

		while ( root.parent ) {
			root = root.parent;
		}

		return root;
	}

	/**
	 * Returns ancestors array of this node.
	 *
	 * @param {Object} options Options object.
	 * @param {Boolean} [options.includeNode=false] When set to `true` this node will be also included in parent's array.
	 * @param {Boolean} [options.parentFirst=false] When set to `true`, array will be sorted from node's parent to root element,
	 * otherwise root element will be the first item in the array.
	 * @returns {Array} Array with ancestors.
	 */
	getAncestors( options = { includeNode: false, parentFirst: false } ) {
		const ancestors = [];
		let parent = options.includeNode ? this : this.parent;

		while ( parent !== null ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
	}
}
