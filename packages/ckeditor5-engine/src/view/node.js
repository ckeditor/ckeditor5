/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/node
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';
import { clone } from 'lodash-es';

// To check if component is loaded more than once.
import '@ckeditor/ckeditor5-utils/src/version';

/**
 * Abstract view node class.
 *
 * This is an abstract class. Its constructor should not be used directly.
 * Use the {@link module:engine/view/downcastwriter~DowncastWriter} or {@link module:engine/view/upcastwriter~UpcastWriter}
 * to create new instances of view nodes.
 *
 * @abstract
 */
export default class Node {
	/**
	 * Creates a tree view node.
	 *
	 * @protected
	 * @param {module:engine/view/document~Document} document The document instance to which this node belongs.
	 */
	constructor( document ) {
		/**
		 * The document instance to which this node belongs.
		 *
		 * @readonly
		 * @member {module:engine/view/document~Document}
		 */
		this.document = document;

		/**
		 * Parent element. Null by default. Set by {@link module:engine/view/element~Element#_insertChild}.
		 *
		 * @readonly
		 * @member {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|null}
		 */
		this.parent = null;
	}

	/**
	 * Index of the node in the parent element or null if the node has no parent.
	 *
	 * Accessing this property throws an error if this node's parent element does not contain it.
	 * This means that view tree got broken.
	 *
	 * @readonly
	 * @type {Number|null}
	 */
	get index() {
		let pos;

		if ( !this.parent ) {
			return null;
		}

		// No parent or child doesn't exist in parent's children.
		if ( ( pos = this.parent.getChildIndex( this ) ) == -1 ) {
			/**
			 * The node's parent does not contain this node. It means that the document tree is corrupted.
			 *
			 * @error view-node-not-found-in-parent
			 */
			throw new CKEditorError( 'view-node-not-found-in-parent', this );
		}

		return pos;
	}

	/**
	 * Node's next sibling, or `null` if it is the last child.
	 *
	 * @readonly
	 * @type {module:engine/view/node~Node|null}
	 */
	get nextSibling() {
		const index = this.index;

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	/**
	 * Node's previous sibling, or `null` if it is the first child.
	 *
	 * @readonly
	 * @type {module:engine/view/node~Node|null}
	 */
	get previousSibling() {
		const index = this.index;

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	/**
	 * Top-most ancestor of the node. If the node has no parent it is the root itself.
	 *
	 * @readonly
	 * @type {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment}
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
	 * Gets a path to the node. The path is an array containing indices of consecutive ancestors of this node,
	 * beginning from {@link module:engine/view/node~Node#root root}, down to this node's index.
	 *
	 *		const abc = downcastWriter.createText( 'abc' );
	 *		const foo = downcastWriter.createText( 'foo' );
	 *		const h1 = downcastWriter.createElement( 'h1', null, downcastWriter.createText( 'header' ) );
	 *		const p = downcastWriter.createElement( 'p', null, [ abc, foo ] );
	 *		const div = downcastWriter.createElement( 'div', null, [ h1, p ] );
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
			path.unshift( node.index );
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
	 * Returns a {@link module:engine/view/element~Element} or {@link module:engine/view/documentfragment~DocumentFragment}
	 * which is a common ancestor of both nodes.
	 *
	 * @param {module:engine/view/node~Node} node The second node.
	 * @param {Object} options Options object.
	 * @param {Boolean} [options.includeSelf=false] When set to `true` both nodes will be considered "ancestors" too.
	 * Which means that if e.g. node A is inside B, then their common ancestor will be B.
	 * @returns {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|null}
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
	 * in different {@link module:engine/view/documentfragment~DocumentFragment}s).
	 *
	 * @param {module:engine/view/node~Node} node Node to compare with.
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
	 * in different {@link module:engine/view/documentfragment~DocumentFragment}s).
	 *
	 * @param {module:engine/view/node~Node} node Node to compare with.
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
	 * Removes node from parent.
	 *
	 * @protected
	 */
	_remove() {
		this.parent._removeChildren( this.index );
	}

	/**
	 * @protected
	 * @param {module:engine/view/document~ChangeType} type Type of the change.
	 * @param {module:engine/view/node~Node} node Changed node.
	 * @fires change
	 */
	_fireChange( type, node ) {
		this.fire( 'change:' + type, node );

		if ( this.parent ) {
			this.parent._fireChange( type, node );
		}
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @returns {Object} Clone of this object with the parent property removed.
	 */
	toJSON() {
		const json = clone( this );

		// Due to circular references we need to remove parent reference.
		delete json.parent;

		return json;
	}

	/**
	 * Checks whether this object is of the given type.
	 *
	 * This method is useful when processing view objects that are of unknown type. For example, a function
	 * may return a {@link module:engine/view/documentfragment~DocumentFragment} or a {@link module:engine/view/node~Node}
	 * that can be either a text node or an element. This method can be used to check what kind of object is returned.
	 *
	 *		someObject.is( 'element' ); // -> true if this is an element
	 *		someObject.is( 'node' ); // -> true if this is a node (a text node or an element)
	 *		someObject.is( 'documentFragment' ); // -> true if this is a document fragment
	 *
	 * Since this method is also available on a range of model objects, you can prefix the type of the object with
	 * `model:` or `view:` to check, for example, if this is the model's or view's element:
	 *
	 *		viewElement.is( 'view:element' ); // -> true
	 *		viewElement.is( 'model:element' ); // -> false
	 *
	 * By using this method it is also possible to check a name of an element:
	 *
	 *		imgElement.is( 'element', 'img' ); // -> true
	 *		imgElement.is( 'view:element', 'img' ); // -> same as above, but more precise
	 *
	 * The list of view objects which implement the `is()` method:
	 *
	 * * {@link module:engine/view/attributeelement~AttributeElement#is `AttributeElement#is()`}
	 * * {@link module:engine/view/containerelement~ContainerElement#is `ContainerElement#is()`}
	 * * {@link module:engine/view/documentfragment~DocumentFragment#is `DocumentFragment#is()`}
	 * * {@link module:engine/view/documentselection~DocumentSelection#is `DocumentSelection#is()`}
	 * * {@link module:engine/view/editableelement~EditableElement#is `EditableElement#is()`}
	 * * {@link module:engine/view/element~Element#is `Element#is()`}
	 * * {@link module:engine/view/emptyelement~EmptyElement#is `EmptyElement#is()`}
	 * * {@link module:engine/view/node~Node#is `Node#is()`}
	 * * {@link module:engine/view/position~Position#is `Position#is()`}
	 * * {@link module:engine/view/range~Range#is `Range#is()`}
	 * * {@link module:engine/view/rooteditableelement~RootEditableElement#is `RootEditableElement#is()`}
	 * * {@link module:engine/view/selection~Selection#is `Selection#is()`}
	 * * {@link module:engine/view/text~Text#is `Text#is()`}
	 * * {@link module:engine/view/textproxy~TextProxy#is `TextProxy#is()`}
	 * * {@link module:engine/view/uielement~UIElement#is `UIElement#is()`}
	 *
	 * @method #is
	 * @param {String} type Type to check.
	 * @returns {Boolean}
	 */
	is( type ) {
		return type === 'node' || type === 'view:node';
	}

	/**
	 * Clones this node.
	 *
	 * @protected
	 * @method #_clone
	 * @returns {module:engine/view/node~Node} Clone of this node.
	 */

	/**
	 * Checks if provided node is similar to this node.
	 *
	 * @method #isSimilar
	 * @returns {Boolean} True if nodes are similar.
	 */
}

/**
 * Fired when list of {@link module:engine/view/element~Element elements} children changes.
 *
 * Change event is bubbled – it is fired on all ancestors.
 *
 * @event change:children
 * @param {module:engine/view/node~Node} changedNode
 */

/**
 * Fired when list of {@link module:engine/view/element~Element elements} attributes changes.
 *
 * Change event is bubbled – it is fired on all ancestors.
 *
 * @event change:attributes
 * @param {module:engine/view/node~Node} changedNode
 */

/**
 * Fired when {@link module:engine/view/text~Text text nodes} data changes.
 *
 * Change event is bubbled – it is fired on all ancestors.
 *
 * @event change:text
 * @param {module:engine/view/node~Node} changedNode
 */

/**
 * @event change
 */

mix( Node, EmitterMixin );
