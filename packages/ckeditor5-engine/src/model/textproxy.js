/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/textproxy
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * `TextProxy` represents a part of {@link module:engine/model/text~Text text node}.
 *
 * Since {@link module:engine/model/position~Position positions} can be placed between characters of a text node,
 * {@link module:engine/model/range~Range ranges} may contain only parts of text nodes. When {@link module:engine/model/range~Range#getItems
 * getting items}
 * contained in such range, we need to represent a part of that text node, since returning the whole text node would be incorrect.
 * `TextProxy` solves this issue.
 *
 * `TextProxy` has an API similar to {@link module:engine/model/text~Text Text} and allows to do most of the common tasks performed
 * on model nodes.
 *
 * **Note:** Some `TextProxy` instances may represent whole text node, not just a part of it.
 * See {@link module:engine/model/textproxy~TextProxy#isPartial}.
 *
 * **Note:** `TextProxy` is not an instance of {@link module:engine/model/node~Node node}. Keep this in mind when using it as a
 * parameter of methods.
 *
 * **Note:** `TextProxy` is a readonly interface. If you want to perform changes on model data represented by a `TextProxy`
 * use {@link module:engine/model/writer~Writer model writer API}.
 *
 * **Note:** `TextProxy` instances are created on the fly, basing on the current state of model. Because of this, it is
 * highly unrecommended to store references to `TextProxy` instances. `TextProxy` instances are not refreshed when
 * model changes, so they might get invalidated. Instead, consider creating {@link module:engine/model/liveposition~LivePosition live
 * position}.
 *
 * `TextProxy` instances are created by {@link module:engine/model/treewalker~TreeWalker model tree walker}. You should not need to create
 * an instance of this class by your own.
 */
export default class TextProxy {
	/**
	 * Creates a text proxy.
	 *
	 * @protected
	 * @param {module:engine/model/text~Text} textNode Text node which part is represented by this text proxy.
	 * @param {Number} offsetInText Offset in {@link module:engine/model/textproxy~TextProxy#textNode text node} from which the text proxy
	 * starts.
	 * @param {Number} length Text proxy length, that is how many text node's characters, starting from `offsetInText` it represents.
	 * @constructor
	 */
	constructor( textNode, offsetInText, length ) {
		/**
		 * Text node which part is represented by this text proxy.
		 *
		 * @readonly
		 * @member {module:engine/model/text~Text}
		 */
		this.textNode = textNode;

		if ( offsetInText < 0 || offsetInText > textNode.offsetSize ) {
			/**
			 * Given `offsetInText` value is incorrect.
			 *
			 * @error model-textproxy-wrong-offsetintext
			 */
			throw new CKEditorError( 'model-textproxy-wrong-offsetintext: Given offsetInText value is incorrect.', this );
		}

		if ( length < 0 || offsetInText + length > textNode.offsetSize ) {
			/**
			 * Given `length` value is incorrect.
			 *
			 * @error model-textproxy-wrong-length
			 */
			throw new CKEditorError( 'model-textproxy-wrong-length: Given length value is incorrect.', this );
		}

		/**
		 * Text data represented by this text proxy.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.data = textNode.data.substring( offsetInText, offsetInText + length );

		/**
		 * Offset in {@link module:engine/model/textproxy~TextProxy#textNode text node} from which the text proxy starts.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.offsetInText = offsetInText;
	}

	/**
	 * Offset at which this text proxy starts in it's parent.
	 *
	 * @see module:engine/model/node~Node#startOffset
	 * @readonly
	 * @type {Number}
	 */
	get startOffset() {
		return this.textNode.startOffset !== null ? this.textNode.startOffset + this.offsetInText : null;
	}

	/**
	 * Offset size of this text proxy. Equal to the number of characters represented by the text proxy.
	 *
	 * @see module:engine/model/node~Node#offsetSize
	 * @readonly
	 * @type {Number}
	 */
	get offsetSize() {
		return this.data.length;
	}

	/**
	 * Offset at which this text proxy ends in it's parent.
	 *
	 * @see module:engine/model/node~Node#endOffset
	 * @readonly
	 * @type {Number}
	 */
	get endOffset() {
		return this.startOffset !== null ? this.startOffset + this.offsetSize : null;
	}

	/**
	 * Flag indicating whether `TextProxy` instance covers only part of the original {@link module:engine/model/text~Text text node}
	 * (`true`) or the whole text node (`false`).
	 *
	 * This is `false` when text proxy starts at the very beginning of {@link module:engine/model/textproxy~TextProxy#textNode textNode}
	 * ({@link module:engine/model/textproxy~TextProxy#offsetInText offsetInText} equals `0`) and text proxy sizes is equal to
	 * text node size.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isPartial() {
		return this.offsetSize !== this.textNode.offsetSize;
	}

	/**
	 * Parent of this text proxy, which is same as parent of text node represented by this text proxy.
	 *
	 * @readonly
	 * @type {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment|null}
	 */
	get parent() {
		return this.textNode.parent;
	}

	/**
	 * Root of this text proxy, which is same as root of text node represented by this text proxy.
	 *
	 * @readonly
	 * @type {module:engine/model/node~Node|module:engine/model/documentfragment~DocumentFragment}
	 */
	get root() {
		return this.textNode.root;
	}

	/**
	 * {@link module:engine/model/document~Document Document} that owns text node represented by this text proxy or `null` if the text node
	 * has no parent or is inside a {@link module:engine/model/documentfragment~DocumentFragment DocumentFragment}.
	 *
	 * @readonly
	 * @type {module:engine/model/document~Document|null}
	 */
	get document() {
		return this.textNode.document;
	}

	/**
	 * Checks whether given model tree object is of given type.
	 *
	 * Read more in {@link module:engine/model/node~Node#is}.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type == 'textProxy';
	}

	/**
	 * Gets path to this text proxy.
	 *
	 * @see module:engine/model/node~Node#getPath
	 * @returns {Array.<Number>}
	 */
	getPath() {
		const path = this.textNode.getPath();

		if ( path.length > 0 ) {
			path[ path.length - 1 ] += this.offsetInText;
		}

		return path;
	}

	/**
	 * Returns ancestors array of this text proxy.
	 *
	 * @param {Object} options Options object.
	 * @param {Boolean} [options.includeSelf=false] When set to `true` this text proxy will be also included in parent's array.
	 * @param {Boolean} [options.parentFirst=false] When set to `true`, array will be sorted from text proxy parent to root element,
	 * otherwise root element will be the first item in the array.
	 * @returns {Array} Array with ancestors.
	 */
	getAncestors( options = { includeSelf: false, parentFirst: false } ) {
		const ancestors = [];
		let parent = options.includeSelf ? this : this.parent;

		while ( parent ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
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
	 * @returns {Iterable.<String>}
	 */
	getAttributeKeys() {
		return this.textNode.getAttributeKeys();
	}
}
