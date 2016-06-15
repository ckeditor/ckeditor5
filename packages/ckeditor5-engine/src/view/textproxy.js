/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

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
	 * @param {String} text Substring of {#_textNodeParent}.
	 * @param {engine.view.Node} parent Parent of {#_textNodeParent}.
	 * @param {engine.view.Text} textNodeParent Text node which text proxy is a substring.
     * @param {Number} index Offset from beginning of {#_textNodeParent} and first character of {#_data}.
     */
	constructor( text, parent, textNodeParent, index ) {
		/**
		 * Element that is a parent of this node.
		 *
		 * @readonly
		 * @member {engine.view.Element|engine.view.DocumentFragment|null} engine.view.Node#parent
		 */
		this.parent = parent;

		/**
		 * Reference to the {@link engine.view.Text} element which TextProxy is a substring.
		 *
		 * @protected
		 * @readonly
		 * @member {engine.view.Text} engine.view.TextProxy#_textNodeParent
		 */
		this._textNodeParent = textNodeParent;

		/**
		 * Index of the substring in the `textParent`.
		 *
		 * @protected
		 * @readonly
		 * @member {Number} engine.view.TextProxy#_index
		 */
		this._index = index;

		/**
		 * The text content.
		 *
		 * @protected
		 * @readonly
		 * @member {String} engine.view.TextProxy#_data
		 */
		this._data = text;
	}
}
