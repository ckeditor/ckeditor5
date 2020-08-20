/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/node
 */

import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';
// To check if component is loaded more than once.
import '@ckeditor/ckeditor5-utils/src/version';

/**
 * Model node. Most basic structure of model tree.
 *
 * This is an abstract class that is a base for other classes representing different nodes in model.
 *
 * **Note:** If a node is detached from the model tree, you can manipulate it using it's API.
 * However, it is **very important** that nodes already attached to model tree should be only changed through
 * {@link module:engine/model/writer~Writer Writer API}.
 *
 * Changes done by `Node` methods, like {@link module:engine/model/element~Element#_insertChild _insertChild} or
 * {@link module:engine/model/node~Node#_setAttribute _setAttribute}
 * do not generate {@link module:engine/model/operation/operation~Operation operations}
 * which are essential for correct editor work if you modify nodes in {@link module:engine/model/document~Document document} root.
 *
 * The flow of working on `Node` (and classes that inherits from it) is as such:
 * 1. You can create a `Node` instance, modify it using it's API.
 * 2. Add `Node` to the model using `Batch` API.
 * 3. Change `Node` that was already added to the model using `Batch` API.
 *
 * Similarly, you cannot use `Batch` API on a node that has not been added to the model tree, with the exception
 * of {@link module:engine/model/writer~Writer#insert inserting} that node to the model tree.
 *
 * Be aware that using {@link module:engine/model/writer~Writer#remove remove from Batch API} does not allow to use `Node` API because
 * the information about `Node` is still kept in model document.
 *
 * In case of {@link module:engine/model/element~Element element node}, adding and removing children also counts as changing a node and
 * follows same rules.
 */
export default class Node {
	/**
	 * Creates a model node.
	 *
	 * This is an abstract class, so this constructor should not be used directly.
	 *
	 * @abstract
	 * @param {Object} [attrs] Node's attributes. See {@link module:utils/tomap~toMap} for a list of accepted values.
	 */
	constructor( attrs ) {
		/**
		 * Parent of this node. It could be {@link module:engine/model/element~Element}
		 * or {@link module:engine/model/documentfragment~DocumentFragment}.
		 * Equals to `null` if the node has no parent.
		 *
		 * @readonly
		 * @member {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment|null}
		 */
		this.parent = null;

		/**
		 * Attributes set on this node.
		 *
		 * @private
		 * @member {Map} module:engine/model/node~Node#_attrs
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
			throw new CKEditorError( 'model-node-not-found-in-parent', this );
		}

		return pos;
	}

	/**
	 * Offset at which this node starts in it's parent. It is equal to the sum of {@link #offsetSize offsetSize}
	 * of all it's previous siblings. Equals to `null` if node has no parent.
	 *
	 * Accessing this property throws an error if this node's parent element does not contain it.
	 * This means that model tree got broken.
	 *
	 * @readonly
	 * @type {Number|null}
	 */
	get startOffset() {
		let pos;

		if ( !this.parent ) {
			return null;
		}

		if ( ( pos = this.parent.getChildStartOffset( this ) ) === null ) {
			throw new CKEditorError( 'model-node-not-found-in-parent', this );
		}

		return pos;
	}

	/**
	 * Offset size of this node. Represents how much "offset space" is occupied by the node in it's parent.
	 * It is important for {@link module:engine/model/position~Position position}. When node has `offsetSize` greater than `1`, position
	 * can be placed between that node start and end. `offsetSize` greater than `1` is for nodes that represents more
	 * than one entity, i.e. {@link module:engine/model/text~Text text node}.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get offsetSize() {
		return 1;
	}

	/**
	 * Offset at which this node ends in it's parent. It is equal to the sum of this node's
	 * {@link module:engine/model/node~Node#startOffset start offset} and {@link #offsetSize offset size}.
	 * Equals to `null` if the node has no parent.
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
	 * @type {module:engine/model/node~Node|null}
	 */
	get nextSibling() {
		const index = this.index;

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	/**
	 * Node's previous sibling or `null` if the node is a first child of it's parent or if the node has no parent.
	 *
	 * @readonly
	 * @type {module:engine/model/node~Node|null}
	 */
	get previousSibling() {
		const index = this.index;

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	/**
	 * The top-most ancestor of the node. If node has no parent it is the root itself. If the node is a part
	 * of {@link module:engine/model/documentfragment~DocumentFragment}, it's `root` is equal to that `DocumentFragment`.
	 *
	 * @readonly
	 * @type {module:engine/model/node~Node|module:engine/model/documentfragment~DocumentFragment}
	 */
	get root() {
		let root = this; // eslint-disable-line consistent-this

		while ( root.parent ) {
			root = root.parent;
		}

		return root;
	}

	/**
	 * Returns true if the node is in a tree rooted in the document (is a descendant of one of its roots).
	 *
	 * @returns {Boolean}
	 */
	isAttached() {
		return this.root.is( 'rootElement' );
	}

	/**
	 * Gets path to the node. The path is an array containing starting offsets of consecutive ancestors of this node,
	 * beginning from {@link module:engine/model/node~Node#root root}, down to this node's starting offset. The path can be used to
	 * create {@link module:engine/model/position~Position Position} instance.
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
		let node = this; // eslint-disable-line consistent-this

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
	 * @param {Boolean} [options.includeSelf=false] When set to `true` this node will be also included in parent's array.
	 * @param {Boolean} [options.parentFirst=false] When set to `true`, array will be sorted from node's parent to root element,
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
	 * Returns a {@link module:engine/model/element~Element} or {@link module:engine/model/documentfragment~DocumentFragment}
	 * which is a common ancestor of both nodes.
	 *
	 * @param {module:engine/model/node~Node} node The second node.
	 * @param {Object} options Options object.
	 * @param {Boolean} [options.includeSelf=false] When set to `true` both nodes will be considered "ancestors" too.
	 * Which means that if e.g. node A is inside B, then their common ancestor will be B.
	 * @returns {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment|null}
	 */
	getCommonAncestor( node, options = {} ) {
		const ancestorsA = this.getAncestors( options );
		const ancestorsB = node.getAncestors( options );

		let i = 0;

		while ( ancestorsA[ i ] == ancestorsB[ i ] && ancestorsA[ i ] ) {
			i++;
		}

		return i === 0 ? null : ancestorsA[ i - 1 ];
	}

	/**
	 * Returns whether this node is before given node. `false` is returned if nodes are in different trees (for example,
	 * in different {@link module:engine/model/documentfragment~DocumentFragment}s).
	 *
	 * @param {module:engine/model/node~Node} node Node to compare with.
	 * @returns {Boolean}
	 */
	isBefore( node ) {
		// Given node is not before this node if they are same.
		if ( this == node ) {
			return false;
		}

		// Return `false` if it is impossible to compare nodes.
		if ( this.root !== node.root ) {
			return false;
		}

		const thisPath = this.getPath();
		const nodePath = node.getPath();

		const result = compareArrays( thisPath, nodePath );

		switch ( result ) {
			case 'prefix':
				return true;

			case 'extension':
				return false;

			default:
				return thisPath[ result ] < nodePath[ result ];
		}
	}

	/**
	 * Returns whether this node is after given node. `false` is returned if nodes are in different trees (for example,
	 * in different {@link module:engine/model/documentfragment~DocumentFragment}s).
	 *
	 * @param {module:engine/model/node~Node} node Node to compare with.
	 * @returns {Boolean}
	 */
	isAfter( node ) {
		// Given node is not before this node if they are same.
		if ( this == node ) {
			return false;
		}

		// Return `false` if it is impossible to compare nodes.
		if ( this.root !== node.root ) {
			return false;
		}

		// In other cases, just check if the `node` is before, and return the opposite.
		return !this.isBefore( node );
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
	 * @returns {Iterable.<String>}
	 */
	getAttributeKeys() {
		return this._attrs.keys();
	}

	/**
	 * Converts `Node` to plain object and returns it.
	 *
	 * @returns {Object} `Node` converted to plain object.
	 */
	toJSON() {
		const json = {};

		// Serializes attributes to the object.
		// attributes = { a: 'foo', b: 1, c: true }.
		if ( this._attrs.size ) {
			json.attributes = Array.from( this._attrs ).reduce( ( result, attr ) => {
				result[ attr[ 0 ] ] = attr[ 1 ];

				return result;
			}, {} );
		}

		return json;
	}

	/**
	 * Checks whether this object is of the given type.
	 *
	 * This method is useful when processing model objects that are of unknown type. For example, a function
	 * may return a {@link module:engine/model/documentfragment~DocumentFragment} or a {@link module:engine/model/node~Node}
	 * that can be either a text node or an element. This method can be used to check what kind of object is returned.
	 *
	 *		someObject.is( 'element' ); // -> true if this is an element
	 *		someObject.is( 'node' ); // -> true if this is a node (a text node or an element)
	 *		someObject.is( 'documentFragment' ); // -> true if this is a document fragment
	 *
	 * Since this method is also available on a range of view objects, you can prefix the type of the object with
	 * `model:` or `view:` to check, for example, if this is the model's or view's element:
	 *
	 *		modelElement.is( 'model:element' ); // -> true
	 *		modelElement.is( 'view:element' ); // -> false
	 *
	 * By using this method it is also possible to check a name of an element:
	 *
	 *		imageElement.is( 'element', 'image' ); // -> true
	 *		imageElement.is( 'element', 'image' ); // -> same as above
	 *		imageElement.is( 'model:element', 'image' ); // -> same as above, but more precise
	 *
	 * The list of model objects which implement the `is()` method:
	 *
	 * * {@link module:engine/model/node~Node#is `Node#is()`}
	 * * {@link module:engine/model/text~Text#is `Text#is()`}
	 * * {@link module:engine/model/element~Element#is `Element#is()`}
	 * * {@link module:engine/model/rootelement~RootElement#is `RootElement#is()`}
	 * * {@link module:engine/model/position~Position#is `Position#is()`}
	 * * {@link module:engine/model/liveposition~LivePosition#is `LivePosition#is()`}
	 * * {@link module:engine/model/range~Range#is `Range#is()`}
	 * * {@link module:engine/model/liverange~LiveRange#is `LiveRange#is()`}
	 * * {@link module:engine/model/documentfragment~DocumentFragment#is `DocumentFragment#is()`}
	 * * {@link module:engine/model/selection~Selection#is `Selection#is()`}
	 * * {@link module:engine/model/documentselection~DocumentSelection#is `DocumentSelection#is()`}
	 * * {@link module:engine/model/markercollection~Marker#is `Marker#is()`}
	 * * {@link module:engine/model/textproxy~TextProxy#is `TextProxy#is()`}
	 *
	 * @method #is
	 * @param {String} type Type to check.
	 * @returns {Boolean}
	 */
	is( type ) {
		return type === 'node' || type === 'model:node';
	}

	/**
	 * Creates a copy of this node, that is a node with exactly same attributes, and returns it.
	 *
	 * @protected
	 * @returns {module:engine/model/node~Node} Node with same attributes as this node.
	 */
	_clone() {
		return new Node( this._attrs );
	}

	/**
	 * Removes this node from it's parent.
	 *
	 * @see module:engine/model/writer~Writer#remove
	 * @protected
	 */
	_remove() {
		this.parent._removeChildren( this.index );
	}

	/**
	 * Sets attribute on the node. If attribute with the same key already is set, it's value is overwritten.
	 *
	 * @see module:engine/model/writer~Writer#setAttribute
	 * @protected
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	_setAttribute( key, value ) {
		this._attrs.set( key, value );
	}

	/**
	 * Removes all attributes from the node and sets given attributes.
	 *
	 * @see module:engine/model/writer~Writer#setAttributes
	 * @protected
	 * @param {Object} [attrs] Attributes to set. See {@link module:utils/tomap~toMap} for a list of accepted values.
	 */
	_setAttributesTo( attrs ) {
		this._attrs = toMap( attrs );
	}

	/**
	 * Removes an attribute with given key from the node.
	 *
	 * @see module:engine/model/writer~Writer#removeAttribute
	 * @protected
	 * @param {String} key Key of attribute to remove.
	 * @returns {Boolean} `true` if the attribute was set on the element, `false` otherwise.
	 */
	_removeAttribute( key ) {
		return this._attrs.delete( key );
	}

	/**
	 * Removes all attributes from the node.
	 *
	 * @see module:engine/model/writer~Writer#clearAttributes
	 * @protected
	 */
	_clearAttributes() {
		this._attrs.clear();
	}
}
