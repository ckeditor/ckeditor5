/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import toMap from '../../utils/tomap.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * Model node. Most basic structure of model tree.
 *
 * This is an abstract class that is a base for other classes representing different nodes in model.
 *
 * **Note:** If a node is detached from the model tree, you can manipulate it using it's API.
 * However, it is **very important** that nodes already attached to model tree should be only changed through
 * {@link engine.model.Document#batch Batch API}.
 *
 * Changes done by `Node` methods, like {@link engine.model.Node#insertChildren insertChildren} or
 * {@link engine.model.Node#setAttribute setAttribute} do not generate {@link engine.model.operation.Operation operations}
 * which are essential for correct editor work if you modify nodes in {@link engine.model.Document document} root.
 *
 * The flow of working on `Node` (and classes that inherits from it) is as such:
 * 1. You can create a `Node` instance, modify it using it's API.
 * 2. Add `Node` to the model using `Batch` API.
 * 3. Change `Node` that was already added to the model using `Batch` API.
 *
 * Similarly, you cannot use `Batch` API on a node that has not been added to the model tree, with the exception
 * of {@link engine.model.Batch#insert inserting} that node to the model tree.
 *
 * Be aware that using {@link engine.model.Batch#remove remove from Batch API} does not allow to use `Node` API because
 * the information about `Node` is still kept in model document.
 *
 * In case of {@link engine.model.Element element node}, adding and removing children also counts as changing a node and
 * follows same rules.
 *
 * @memberOf engine.model
 */
export default class Node {
	/**
	 * Creates a model node.
	 *
	 * This is an abstract class, so this constructor should not be used directly.
	 *
	 * @abstract
	 * @param {Object} [attrs] Node's attributes. See {@link utils.toMap} for a list of accepted values.
	 */
	constructor( attrs ) {
		/**
		 * Parent of this node. It could be {@link engine.model.Element} or {@link engine.model.DocumentFragment}.
		 * Equals to `null` if the node has no parent.
		 *
		 * @readonly
		 * @member {engine.model.Element|engine.model.DocumentFragment|null} engine.model.Node#parent
		 */
		this.parent = null;

		/**
		 * Attributes set on this node.
		 *
		 * @private
		 * @member {Map} engine.model.Node#_attrs
		 */
		this._attrs = toMap( attrs );
	}

	/**
	 * Index of this node in it's parent or `null` if the node has no parent.
	 *
	 * Accessing this property throws an error if this node's parent element does not contain it.
	 * This means that model tree got broken.
	 *
	 * @readonly
	 * @type {Number|null}
	 */
	get index() {
		let pos;

		if ( !this.parent ) {
			return null;
		}

		if ( ( pos = this.parent.getChildIndex( this ) ) === null ) {
			/**
			 * The node's parent does not contain this node.
			 *
			 * @error node-not-found-in-parent
			 */
			throw new CKEditorError( 'model-node-not-found-in-parent: The node\'s parent does not contain this node.' );
		}

		return pos;
	}

	/**
	 * Offset at which this node starts in it's parent. It is equal to the sum of {@link engine.model.Node#offsetSize offsetSize}
	 * of all it's previous siblings. Equals to `null` if node has no parent.
	 *
	 * Accessing this property throws an error if this node's parent element does not contain it.
	 * This means that model tree got broken.
	 *
	 * @readonly
	 * @type {Number|Null}
	 */
	get startOffset() {
		let pos;

		if ( !this.parent ) {
			return null;
		}

		if ( ( pos = this.parent.getChildStartOffset( this ) ) === null ) {
			/**
			 * The node's parent does not contain this node.
			 *
			 * @error node-not-found-in-parent
			 */
			throw new CKEditorError( 'model-node-not-found-in-parent: The node\'s parent does not contain this node.' );
		}

		return pos;
	}

	/**
	 * Offset size of this node. Represents how much "offset space" is occupied by the node in it's parent.
	 * It is important for {@link engine.model.Position position}. When node has `offsetSize` greater than `1`, position
	 * can be placed between that node start and end. `offsetSize` greater than `1` is for nodes that represents more
	 * than one entity, i.e. {@link engine.model.Text text node}.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get offsetSize() {
		return 1;
	}

	/**
	 * Offset at which this node ends in it's parent. It is equal to the sum of this node's
	 * {@link engine.model.Node#startOffset start offset} and {@link engine.model.Node#offsetSize offset size}. Equals
	 * to `null` if the node has no parent.
	 *
	 * @readonly
	 * @type {Number|null}
	 */
	get endOffset() {
		if ( !this.parent ) {
			return null;
		}

		return this.startOffset + this.offsetSize;
	}

	/**
	 * Node's next sibling or `null` if the node is a last child of it's parent or if the node has no parent.
	 *
	 * @readonly
	 * @type {engine.model.Node|null}
	 */
	get nextSibling() {
		const index = this.index;

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	/**
	 * Node's previous sibling or `null` if the node is a first child of it's parent or if the node has no parent.
	 *
	 * @readonly
	 * @type {engine.model.Node|null}
	 */
	get previousSibling() {
		const index = this.index;

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	/**
	 * The top-most ancestor of the node. If node has no parent it is the root itself. If the node is a part
	 * of {@link engine.model.DocumentFragment}, it's `root` is equal to that `DocumentFragment`.
	 *
	 * @readonly
	 * @type {engine.model.Node|engine.model.DocumentFragment}
	 */
	get root() {
		let root = this;

		while ( root.parent ) {
			root = root.parent;
		}

		return root;
	}

	/**
	 * {@link engine.model.Document Document} that owns this node or `null` if the node has no parent or is inside
	 * a {@link engine.model.DocumentFragment DocumentFragment}.
	 *
	 * @readonly
	 * @type {engine.model.Document|null}
	 */
	get document() {
		// This is a top element of a sub-tree.
		if ( this.root == this ) {
			return null;
		}

		// Root may be `DocumentFragment` which does not have document property.
		return this.root.document || null;
	}

	/**
	 * Creates a copy of this node, that is a node with exactly same attributes, and returns it.
	 *
	 * @returns {engine.model.Node} Node with same attributes as this node.
	 */
	clone() {
		return new Node( this._attrs );
	}

	/**
	 * Gets path to the node. The path is an array containing starting offsets of consecutive ancestors of this node,
	 * beginning from {@link engine.model.Node#root root}, down to this node's starting offset. The path can be used to
	 * create {@link engine.model.Position Position} instance.
	 *
	 *		const abc = new Text( 'abc' );
	 *		const foo = new Text( 'foo' );
	 *		const h1 = new Element( 'h1', null, new Text( 'header' ) );
	 *		const p = new Element( 'p', null, [ abc, foo ] );
	 *		const div = new Element( 'div', null, [ h1, p ] );
	 *		foo.getPath(); // Returns [ 1, 3 ]. `foo` is in `p` which is in `div`. `p` starts at offset 1, while `foo` at 3.
	 *		h1.getPath(); // Returns [ 0 ].
	 *		div.getPath(); // Returns [].
	 *
	 * @returns {Array.<Number>} The path.
	 */
	getPath() {
		const path = [];
		let node = this;

		while ( node.parent ) {
			path.unshift( node.startOffset );
			node = node.parent;
		}

		return path;
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

		while ( parent ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
	}

	/**
	 * Removes this node from it's parent.
	 */
	remove() {
		this.parent.removeChildren( this.index );
	}

	/**
	 * Checks if the node has an attribute with given key.
	 *
	 * @param {String} key Key of attribute to check.
	 * @returns {Boolean} `true` if attribute with given key is set on node, `false` otherwise.
	 */
	hasAttribute( key ) {
		return this._attrs.has( key );
	}

	/**
	 * Gets an attribute value for given key or `undefined` if that attribute is not set on node.
	 *
	 * @param {String} key Key of attribute to look for.
	 * @returns {*} Attribute value or `undefined`.
	 */
	getAttribute( key ) {
		return this._attrs.get( key );
	}

	/**
	 * Returns iterator that iterates over this node's attributes.
	 *
	 * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
	 * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
	 *
	 * @returns {Iterable.<*>}
	 */
	getAttributes() {
		return this._attrs.entries();
	}

	/**
	 * Returns iterator that iterates over this node's attribute keys.
	 *
	 * @returns {Iterator.<String>}
	 */
	getAttributeKeys() {
		return this._attrs.keys();
	}

	/**
	 * Sets attribute on the node. If attribute with the same key already is set, it's value is overwritten.
	 *
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	setAttribute( key, value ) {
		this._attrs.set( key, value );
	}

	/**
	 * Removes all attributes from the node and sets given attributes.
	 *
	 * @param {Object} [attrs] Attributes to set. See {@link utils.toMap} for a list of accepted values.
	 */
	setAttributesTo( attrs ) {
		this._attrs = toMap( attrs );
	}

	/**
	 * Removes an attribute with given key from the node.
	 *
	 * @param {String} key Key of attribute to remove.
	 * @returns {Boolean} `true` if the attribute was set on the element, `false` otherwise.
	 */
	removeAttribute( key ) {
		return this._attrs.delete( key );
	}

	/**
	 * Removes all attributes from the node.
	 */
	clearAttributes() {
		this._attrs.clear();
	}

	/**
	 * Converts `Node` to plain object and returns it.
	 *
	 * @returns {Object} `Node` converted to plain object.
	 */
	toJSON() {
		let json = {};

		if ( this._attrs.size ) {
			json.attributes = [ ...this._attrs ];
		}

		return json;
	}
}
