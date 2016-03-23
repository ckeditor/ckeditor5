/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';

/**
 * A proxy object representing one character stored in the tree data model. It looks and behaves like
 * normal node, but is a read-only structure. This is a representation of the data. Manipulating it won't affect
 * the actual nodes in tree model.
 *
 * Keep in mind that CharacterProxy is static, meaning that it won't change when tree model changes. For example, if you
 * have a {engine.treeModel.Element element} `myEl` containing text `foobar` and then assign `let b = myEl.getChild( 3 )`
 * and then remove all nodes from `myEl`, `b` will still have character `b`, parent `myEl` and offset `3`.
 *
 * CharacterProxy is created on the fly basing on tree model. It is not an explicit node in a tree model but
 * rather represents it. Because of this, it is not advised to store or compare instances of CharacterProxy class.
 * If you want to keep live reference to a point in a text, you should use {@link engine.treeModel.LivePosition}.
 *
 * You should never create an instance of this class by your own. When passing parameters to constructors,
 * use string literals or {@link engine.treeModel.Text} instead.
 *
 * @memberOf engine.treeModel
 * @extends engine.treeModel.Node
 */
export default class CharacterProxy extends Node {
	/**
	 * Creates character node proxy.
	 *
	 * @protected
	 * @param {engine.treeModel.NodeListText} nodeListText Reference to a text object in a node list containing this character.
	 * @param {Number} index Index of the character in `nodeListText`.
	 */
	constructor( nodeListText, index ) {
		super( nodeListText._attrs );

		/**
		 * Character represented by this proxy.
		 *
		 * @readonly
		 * @member {String} engine.treeModel.CharacterProxy#character
		 */
		this.character = nodeListText.text.substr( index, 1 );

		/**
		 * @inheritdoc
		 */
		this.parent = nodeListText.parent;

		/**
		 * Reference to a text object in a node list containing this character.
		 *
		 * @protected
		 * @readonly
		 * @member {engine.treeModel.NodeListText} engine.treeModel.CharacterProxy#_nodeListText
		 */
		this._nodeListText = nodeListText;

		/**
		 * Index of the character in `nodeListText`.
		 *
		 * @protected
		 * @readonly
		 * @member {Number} engine.treeModel.CharacterProxy#_index
		 */
		this._index = index;
	}
}
