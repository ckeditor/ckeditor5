/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/attribute', 'utils', 'ckeditorerror' ], function( Attribute, utils, CKEditorError ) {
	/**
	 * Abstract document tree node class.
	 *
	 * @abstract
	 * @class document.Node
	 */
	class Node {
		/**
		 * Creates a tree node.
		 *
		 * This is an abstract class, so this constructor should not be used directly.
		 *
		 * @param {Iterable} attrs Iterable collection of {@link document.Attribute attributes}.
		 * @constructor
		 */
		constructor( attrs ) {
			/**
			 * Parent element. Null by default. Set by {@link document.Element#insertChildren}.
			 *
			 * @readonly
			 * @property {document.Element|null} parent
			 */
			this.parent = null;

			/**
			 * Attributes set.
			 *
			 * Attributes of nodes attached to the document can be changed only be the {@link document.operation.ChangeOperation}.
			 *
			 * @private
			 * @property {Set} _attrs
			 */
			this._attrs = new Set( attrs );
		}

		/**
		 * Index of the node in the parent element or null if the node has no parent.
		 *
		 * Throws error if the parent element does not contain this node.
		 *
		 * @returns {Number|Null} Index of the node in the parent element or null if the node has not parent.
		 */
		getIndex() {
			var pos;

			if ( !this.parent ) {
				return null;
			}

			// No parent or child doesn't exist in parent's children.
			if ( ( pos = this.parent.getChildIndex( this ) ) == -1 ) {
				/**
				 * The nodes parent does not contain that node. It means that document tree is corrupted.
				 *
				 * @error node-not-found-in-parent
				 * @param {document.Node} node
				 */
				throw new CKEditorError( 'node-not-found-in-parent: The node\'s parent does not contain that node.' );
			}

			return pos;
		}

		/**
		 * Depth of the node, which equals to total number of its parents.
		 *
		 * @readonly
		 * @property {Number} depth
		 */
		get depth() {
			var depth = 0;
			var parent = this.parent;

			while ( parent ) {
				depth++;

				parent = parent.parent;
			}

			return depth;
		}

		/**
		 * The top parent for the node. If node has no parent it is the root itself.
		 *
		 * @readonly
		 * @property {Number} depth
		 */
		get root() {
			var root = this; // jscs:ignore safeContextKeyword

			while ( root.parent ) {
				root = root.parent;
			}

			return root;
		}

		/**
		 * Nodes next sibling or `null` if it is the last child.
		 *
		 * @readonly
		 * @property {document.Node|null} nextSibling
		 */
		get nextSibling() {
			var index = this.getIndex();

			return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
		}

		/**
		 * Nodes previous sibling or null if it is the last child.
		 *
		 * @readonly
		 * @property {document.Node|null} previousSibling
		 */
		get previousSibling() {
			var index = this.getIndex();

			return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
		}

		/**
		 * Returns `true` if the node contains an attribute with the same key and value as given or the same key if the
		 * given parameter is a string.
		 *
		 * @param {document.Attribute|String} attr An attribute or a key to compare.
		 * @returns {Boolean} True if node contains given attribute or an attribute with the given key.
		 */
		hasAttr( key ) {
			var attr;

			// Attribute.
			if ( key instanceof Attribute ) {
				for ( attr of this._attrs ) {
					if ( attr.isEqual( key ) ) {
						return true;
					}
				}
			}
			// Key.
			else {
				for ( attr of this._attrs ) {
					if ( attr.key == key ) {
						return true;
					}
				}
			}

			return false;
		}

		/**
		 * Finds an attribute by a key.
		 *
		 * @param {String} attr The attribute key.
		 * @returns {document.Attribute} The found attribute.
		 */
		getAttr( key ) {
			for ( var attr of this._attrs ) {
				if ( attr.key == key ) {
					return attr.value;
				}
			}

			return null;
		}

		/**
		 * Removes attribute from the list of attributes.
		 *
		 * @param {String} key The attribute key.
		 */
		removeAttr( key ) {
			for ( var attr of this._attrs ) {
				if ( attr.key == key ) {
					this._attrs.delete( attr );

					return;
				}
			}
		}

		/**
		 * Sets a given attribute. If the attribute with the same key already exists it will be removed.
		 *
		 * @param {document.Attribute} attr Attribute to set.
		 */
		setAttr( attr ) {
			this.removeAttr( attr.key );

			this._attrs.add( attr );
		}

		/**
		 * Gets path to the node. For example if the node is the second child of the first child of the root then the path
		 * will be `[ 1, 2 ]`. This path can be used as a parameter of {@link document.Position}.
		 *
		 * @returns {Number[]} The path.
		 */
		getPath() {
			var path = [];
			var node = this; // jscs:ignore safeContextKeyword

			while ( node.parent ) {
				path.unshift( node.getIndex() );
				node = node.parent;
			}

			return path;
		}

		/**
		 * Custom toJSON method to solve child-parent circular dependencies.
		 *
		 * @returns {Object} Clone of this object with the parent property replaced with its name.
		 */
		toJSON() {
			var json = utils.clone( this );

			// Due to circular references we need to remove parent reference.
			json.parent = this.parent ? this.parent.name : null;

			return json;
		}

		/**
		 * Gets the number of attributes.
		 *
		 * @protected
		 * @returns {Number} Number of attributes.
		 */
		_getAttrCount() {
			var count = 0;

			for ( var attr of this._attrs ) { // jshint ignore:line
				count++;
			}

			return count;
		}
	}

	return Node;
} );
