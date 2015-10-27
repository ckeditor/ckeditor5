/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/attribute', 'utils' ], function( Attribute, utils ) {
	/**
	 * Abstract document tree node class.
	 *
	 * @class document.Node
	 */
	class Node {
		/**
		 * Creates tree node.
		 *
		 * This is an abstract class, it should not be created directly.
		 *
		 * Created node has no parent. Parent of the node is set when it is attached to the {@link document.Element}.
		 *
		 * @param {Array} attrs Array of attributes.
		 * @constructor
		 */
		constructor( attrs ) {
			/**
			 * Parent element. Null by default.
			 *
			 * @property {document.Element|Null} parent
			 */
			this.parent = null;

			/**
			 * Array of attributes.
			 *
			 * Attributes of nodes attached to the document can be changed only be the {@link document.ChangeOpeation}.
			 *
			 * @private
			 * @property {Array} attr
			 */
			this._attrs = new Set( attrs );
		}

		/**
		 * Returns true if node contain attribute with the same key and value as given or the same key if the
		 * given parameter is a string.
		 *
		 * @param {document.Attribute|String} attr Attribute or key to compare.
		 * @returns {Boolean} True if node contains given attribute or attribute with given key.
		 */
		hasAttr( key ) {
			var attr;

			// Attribute
			if ( key instanceof Attribute ) {
				for ( attr of this._attrs ) {
					if ( attr.isEqual( key ) ) {
						return true;
					}
				}
			}
			// Key
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
		 * Returns attribute if node contain attribute with the same key and value as given or the same key if the
		 * given parameter is a string.
		 *
		 * @param {document.Attribute|String|Null} attr Attribute or key to compare.
		 * @returns {document.Attribute} Attribute if node contains given attribute or attribute with given key,
		 * or null if attribute was not found.
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
		 * Removes attribute from the list of attribute.
		 *
		 * @param {String} key Attribute key.
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
		 * Get number of attributes.
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

		/**
		 * Insert a given attribute. If the attribute with the same key already exists it will be removed.
		 *
		 * @param {document.Attribute} attr Attribute to insert.
		 */
		setAttr( attr ) {
			this.removeAttr( attr.key );

			this._attrs.add( attr );
		}

		/**
		 * Position of the node in the parent element.
		 *
		 * @readonly
		 * @property {Number} positionInParent
		 */
		get positionInParent() {
			var pos;

			// No parent or child doesn't exist in parent's children.
			if ( !this.parent || ( pos = this.parent.getChildIndex( this ) ) == -1 ) {
				return null;
			}

			return pos;
		}

		/**
		 * Dept of the node, which equals total number of its parents.
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
		 * The top parent for the node. If node has no parent it is its own root.
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
		 * Nodes next sibling or null if it is the last child.
		 *
		 * @readonly
		 * @property {document.Node|Null} nextSibling
		 */
		get nextSibling() {
			var pos = this.positionInParent;

			return ( pos !== null && this.parent.getChild( pos + 1 ) ) || null;
		}

		/**
		 * Nodes previous sibling or null if it is the last child.
		 *
		 * @readonly
		 * @property {document.Node|Null} previousSibling
		 */
		get previousSibling() {
			var pos = this.positionInParent;

			return ( pos !== null && this.parent.getChild( pos - 1 ) ) || null;
		}

		/**
		 * Get path to the node. For example if the node is the second child of the first child of the root then the path
		 * will be [ 1, 2 ]. This path can be used as a parameter of in {@link document.Position}.
		 *
		 * @returns {Array} Path, array of numbers.
		 */
		getPath() {
			var path = [];
			var node = this; // jscs:ignore safeContextKeyword

			while ( node.parent ) {
				path.unshift( node.positionInParent );
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
	}

	return Node;
} );