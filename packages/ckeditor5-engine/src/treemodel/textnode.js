/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';

/**
 * A proxy object representing one or more characters stored in the tree data model. It looks like and behaves like
 * normal node, but is a readonly structure. This is a representation of the data. Manipulating it won't affect
 * the actual nodes in tree model.
 *
 * TextNode instance is static, meaning that it is up-to-date only for actual tree model state. No mutations
 * of a tree model containing this character are reflected in its properties. Because of this, it is not advised to store
 * instances of TextNode class. Comparing TextNode instances is pointless too. If you want to keep live reference
 * to a point in a text, you should use {@link treeModel.LivePosition}.
 *
 * In most scenarios you should not create an instance of this class by your own. When passing parameters to
 * constructors, use string literals or {@link treeModel.Text} instead.
 *
 * @class treeModel.TextNode
 */
export default class TextNode extends Node {
	/**
	 * Creates text node.
	 *
	 * @param {String} text Characters contained in this text node.
	 * @param {Iterable} attrs Iterable collection of {@link treeModel.Attribute attributes}.
	 * @constructor
	 */
	constructor( textItem, start, length ) {
		super( textItem.attrs );

		/**
		 * {@link treeModel.Text} instance that contains text represented by this text node.
		 *
		 * @protected
		 * @readonly
		 * @property {treeModel.Text} textItem
		 */
		this._textItem = textItem;

		/**
		 * Defines where text represented by this text node starts in original {@link treeModel.Text text} object.
		 *
		 * @protected
		 * @readonly
		 * @property {Number} start
		 */
		this._start = start;

		/**
		 * Characters contained in this text node.
		 *
		 * @protected
		 * @readonly
		 * @property {String} text
		 */
		this.text = textItem.text.substr( start, length );
	}

	/**
	 * @readonly
	 * @property {treeModel.Element} parent
	 * @see {@link treeModel.Node#parent}
	 */
	get parent() {
		return this._textItem.parent;
	}

	/**
	 * Does nothing as parent is readonly property in {@link treeModel.TextNode}.
	 */
	set parent( parent ) {
		/* jshint unused:false */
	}

	/**
	 * @see {@link treeModel.Node#nextSibling}
	 */
	get nextSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index + this.text.length ) ) || null;
	}
}
