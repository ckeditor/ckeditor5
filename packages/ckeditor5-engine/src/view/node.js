/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/node
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Abstract tree view node class.
 *
 * @abstract
 */
export default class Node {
	/**
	 * Creates a tree view node.
	 *
	 * This is an abstract class, so this constructor should not be used directly.
	 */
	constructor() {
		/**
		 * Parent element. Null by default. Set by {@link module:engine/view/element~Element#insertChildren}.
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
			throw new CKEditorError( 'view-node-not-found-in-parent: The node\'s parent does not contain this node.' );
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
	 * {@link module:engine/view/document~Document View document} that owns this node, or `null` if the node is inside
	 * {@link module:engine/view/documentfragment~DocumentFragment document fragment}.
	 *
	 * @readonly
	 * @type {module:engine/view/document~Document|null}
	 */
	get document() {
		// Parent might be Node, null or DocumentFragment.
		if ( this.parent instanceof Node ) {
			return this.parent.document;
		} else {
			return null;
		}
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
	 * Removes node from parent.
	 */
	remove() {
		this.parent.removeChildren( this.index );
	}

	/**
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
	 * Clones this node.
	 *
	 * @method #clone
	 * @returns {module:engine/view/node~Node} Clone of this node.
	 */

	/**
	 * Checks if provided node is similar to this node.
	 *
	 * @method #isSimilar
	 * @returns {Boolean} True if nodes are similar.
	 */

	/**
	 * Checks whether given view tree object is of given type.
	 *
	 * This method is useful when processing view tree objects that are of unknown type. For example, a function
	 * may return {@link module:engine/view/documentfragment~DocumentFragment} or {@link module:engine/view/node~Node}
	 * that can be either text node or element. This method can be used to check what kind of object is returned.
	 *
	 *		obj.is( 'node' ); // true for any node, false for document fragment
	 *		obj.is( 'documentFragment' ); // true for document fragment, false for any node
	 *		obj.is( 'element' ); // true for any element, false for text node or document fragment
	 *		obj.is( 'element', 'p' ); // true only for element which name is 'p'
	 *		obj.is( 'p' ); // shortcut for obj.is( 'element', 'p' )
	 *		obj.is( 'text' ); // true for text node, false for element and document fragment
	 *
	 * @method #is
	 * @param {'element'|'containerElement'|'attributeElement'|'emptyElement'|'uiElement'|
	 * 'rootElement'|'documentFragment'|'text'|'textProxy'} type
	 * @returns {Boolean}
	 */
}

/**
 * Fired when list of {@link module:engine/view/element~Element elements} children changes.
 *
 * Change event is bubbled – it is fired on all ancestors.
 *
 * @event change:children
 * @param {module:engine/view/node~Node} Changed node.
 */

/**
 * Fired when list of {@link module:engine/view/element~Element elements} attributes changes.
 *
 * Change event is bubbled – it is fired on all ancestors.
 *
 * @event change:attributes
 * @param {module:engine/view/node~Node} Changed node.
 */

/**
 * Fired when {@link module:engine/view/text~Text text nodes} data changes.
 *
 * Change event is bubbled – it is fired on all ancestors.
 *
 * @event change:text
 * @param {module:engine/view/node~Node} Changed node.
 */

/**
 * @event change
 */

mix( Node, EmitterMixin );
