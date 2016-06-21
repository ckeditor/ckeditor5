/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * TextProxy is a wrapper for substring of {@link engine.view.Text}. Instance of this class is created by
 * {@link engine.view.TreeWalker} when only a part of {@link engine.view.Text} needs to be returned.
 *
 * **Note:** TextProxy instances are created on the fly basing on the current state of parent {@link engine.view.Text}.
 * Because of this it is highly unrecommended to store references to TextProxy instances because they might get
 * invalidated due to operations on Document. Also TextProxy is not a {@link engine.view.Node} so it can not be
 * inserted as a child of {@link engine.view.Element}.
 *
 * You should never create an instance of this class by your own. Instead, use string literals or {@link engine.model.Text}.
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
		 * Element that is a parent of this text proxy.
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
	 * Gets {@link engine.view.Document} reference, from the {@link engine.view.Node#getRoot root} of
	 * {#_textNode} or returns null if the root has no reference to the {@link engine.view.Document}.
	 *
	 * @returns {engine.view.Document|null} View Document of the text proxy or null.
	 */
	getDocument() {
		return this._textNode.getDocument();
	}

	/**
	 * Gets the top parent for the {#_textNode}. If there is no parent {#_textNode} is the root.
	 *
	 * @returns {engine.view.Node}
	 */
	getRoot() {
		return this._textNode.getRoot();
	}

	/**
	 * Returns ancestors array of this text proxy.
	 *
	 * @param {Object} options Options object.
	 * @param {Boolean} [options.includeNode=false] When set to `true` {#_textNode} will be also included in parent's array.
	 * @param {Boolean} [options.parentFirst=false] When set to `true`, array will be sorted from text proxy parent to
	 * root element, otherwise root element will be the first item in the array.
	 * @returns {Array} Array with ancestors.
	 */
	getAncestors( options = { includeNode: false, parentFirst: false } ) {
		const ancestors = [];
		let parent = options.includeNode ? this._textNode : this.parent;

		while ( parent !== null ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
	}
}
