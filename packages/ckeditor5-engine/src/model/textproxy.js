/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * `TextProxy` represents a part of {@link engine.model.Text text node}.
 *
 * Since {@link engine.model.Position positions} can be placed between characters of a text node,
 * {@link engine.model.Range ranges} may contain only parts of text nodes. When {@link engine.model.Range#getItems getting items}
 * contained in such range, we need to represent a part of that text node, since returning the whole text node would be incorrect.
 * `TextProxy` solves this issue.
 *
 * `TextProxy` has an API similar to {@link engine.model.Text Text} and allows to do most of the common tasks performed
 * on model nodes.
 *
 * **Note:** Some `TextProxy` instances may represent whole text node, not just a part of it.
 *
 * **Note:** `TextProxy` is not an instance of {@link engine.model.Node node}. Keep this in mind when using it as a
 * parameter of methods.
 *
 * **Note:** `TextProxy` is readonly interface. If you want to perform changes on model data represented by a `TextProxy`
 * use {@link engine.model.writer model writer API}.
 *
 * **Note:** `TextProxy` instances are created on the fly, basing on the current state of model. Because of this, it is
 * highly unrecommended to store references to `TextProxy` instances. `TextProxy` instances are not refreshed when
 * model changes, so they might get invalidated.
 *
 * `TextProxy` instances are created by {@link engine.model.TreeWalker model tree walker}. You should not need to create
 * an instance of this class by your own.
 *
 * @memberOf engine.model
 */
export default class TextProxy {
	/**
	 * Creates a text proxy.
	 *
	 * @protected
	 * @param {engine.model.Text} textNode Text node which part is represented by this text proxy.
	 * @param {Number} offsetInText Offset in {@link engine.model.TextProxy#textNode text node} from which the text proxy starts.
	 * @param {Number} length Text proxy length, that is how many text node's characters, starting from `offsetInText` it represents.
	 * @constructor
	 */
	constructor( textNode, offsetInText, length ) {
		/**
		 * Text node which part is represented by this text proxy.
		 *
		 * @readonly
		 * @member {engine.model.Text} engine.model.TextProxy#textNode
		 */
		this.textNode = textNode;

		/**
		 * Text data represented by this text proxy.
		 *
		 * @readonly
		 * @member {String} engine.model.TextProxy#data
		 */
		this.data = textNode.data.substring( offsetInText, offsetInText + length );

		/**
		 * Offset in {@link engine.model.TextProxy#textNode text node} from which the text proxy starts.
		 *
		 * @readonly
		 * @member {Number} engine.model.TextProxy#offsetInText
		 */
		this.offsetInText = offsetInText;
	}

	/**
	 * Parent of this text proxy, which is same as parent of text node represented by this text proxy.
	 *
	 * @readonly
	 * @type {engine.model.Element|engine.model.DocumentFragment|null}
	 */
	get parent() {
		return this.textNode.parent;
	}

	/**
	 * Root of this text proxy, which is same as root of text node represented by this text proxy.
	 *
	 * @readonly
	 * @type {engine.model.Element|engine.model.DocumentFragment}
	 */
	get root() {
		return this.textNode.root;
	}

	/**
	 * {@link engine.model.Document Document} that owns text node represented by this text proxy or `null` if the text node
	 * has no parent or is inside a {@link engine.model.DocumentFragment DocumentFragment}.
	 *
	 * @returns {engine.model.Document|null}
	 */
	get document() {
		return this.textNode.document;
	}

	/**
	 * Offset at which this text proxy starts in it's parent.
	 *
	 * @see engine.model.Node#startOffset
	 * @readonly
	 * @type {Number}
	 */
	get startOffset() {
		return this.textNode.startOffset + this.offsetInText;
	}

	/**
	 * Offset size of this text proxy. Equal to the number of characters represented by the text proxy.
	 *
	 * @see engine.model.Node#offsetSize
	 * @readonly
	 * @type {Number}
	 */
	get offsetSize() {
		return this.data.length;
	}

	/**
	 * Offset at which this text proxy ends in it's parent.
	 *
	 * @see engine.model.Node#endOffset
	 * @readonly
	 * @type {Number}
	 */
	get endOffset() {
		return this.startOffset + this.offsetSize;
	}

	/**
	 * Gets path to this text proxy.
	 *
	 * @see engine.model.Node#getPath
	 * @readonly
	 * @type {Array.<Number>}
	 */
	getPath() {
		const path = this.textNode.getPath();
		path[ path.length - 1 ] += this.offsetInText;

		return path;
	}

	/**
	 * Checks if this text proxy has an attribute for given key.
	 *
	 * @param {String} key Key of attribute to check.
	 * @returns {Boolean} `true` if attribute with given key is set on text proxy, `false` otherwise.
	 */
	hasAttribute( key ) {
		return this.textNode.hasAttribute( key );
	}

	/**
	 * Gets an attribute value for given key or `undefined` if that attribute is not set on text proxy.
	 *
	 * @param {String} key Key of attribute to look for.
	 * @returns {*} Attribute value or `undefined`.
	 */
	getAttribute( key ) {
		return this.textNode.getAttribute( key );
	}

	/**
	 * Returns iterator that iterates over this node's attributes. Attributes are returned as arrays containing two
	 * items. First one is attribute key and second is attribute value.
	 *
	 * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
	 *
	 * @returns {Iterable.<*>}
	 */
	getAttributes() {
		return this.textNode.getAttributes();
	}

	/**
	 * Returns iterator that iterates over this node's attribute keys.
	 *
	 * @returns {Iterator.<String>}
	 */
	getAttributeKeys() {
		return this.textNode.getAttributeKeys();
	}
}
