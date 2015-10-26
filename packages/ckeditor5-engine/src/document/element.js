/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/node', 'document/nodelist' ], function( Node, NodeList ) {
	/**
	 * Linear data element.
	 *
	 * @class document.Element
	 */
	class Element extends Node {
		/**
		 * Creates linear data element.
		 *
		 * This constructor should be used only internally by the document.
		 *
		 * @param {String} name Node name.
		 * @param {Array} attrs Array of {@link document.Attribute attributes}.
		 * @param {document.Node|document.Text|document.NodeList|String|Array} nodes List of nodes to be inserted.
		 * List of nodes can be any type accepted by the {@link document.NodeList} constructor.
		 * @constructor
		 */
		constructor( name, attrs, children ) {
			super( attrs );

			/**
			 * Element name.
			 *
			 * @readonly
			 * @property {String} name
			 */
			this.name = name;

			/**
			 * List of children nodes.
			 *
			 * @readonly
			 * @property {document.NodeList} children
			 */
			this.children = new NodeList();

			if ( children ) {
				this.insertChildren( 0, children );
			}
		}

		/**
		 * Insert a list of child nodes on the given index and set the parent of these node to this.
		 *
		 * Note that list of children can be modified only in elements not attached yet to the document.
		 * All attached nodes should be modified using the {@link document.InsertOperation}.
		 *
		 * @param {Nuber} index Position where nodes should be inserted.
		 * @param {document.Node|document.Text|document.NodeList|String|Array} nodes List of nodes to be inserted.
		 * List of nodes can be any type accepted by the {@link document.NodeList} constructor.
		 */
		insertChildren( index, nodes ) {
			this.children.insert( index, new NodeList( nodes ) );

			for ( var node of this.children ) {
				node.parent = this;
			}
		}

		/**
		 * Removes number of child nodes starting at the given index and set the parent of these node to null.
		 *
		 * Note that list of children can be modified only in elements not attached yet to the document.
		 * All attached nodes should be modified using the {@link document.RemoveOperation}.
		 *
		 * @param {Number} index Position of the first node to remove.
		 * @param {Number} number Number of nodes to remove.
		 */

		removeChildren( index, number ) {
			for ( var i = index; i < index + number; i++ ) {
				this.children.get( i ).parent = null;
			}

			this.children.remove( index, number );
		}
	}

	return Element;
} );