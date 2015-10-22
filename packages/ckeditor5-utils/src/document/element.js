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
		 * @param {document.Element|Null} parent Node parent.
		 * @param {String} name Node name.
		 * @param {Array} attrs Array of attributes.
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
			 * Array of children nodes.
			 *
			 * @property {Array} children
			 */
			this.children = new NodeList();

			if ( children ) {
				this.insertChildren( 0, children );
			}
		}

		insertChildren( index, nodes ) {
			this.children.insert( index, new NodeList( nodes ) );

			for ( var node of this.children ) {
				node.parent = this;
			}
		}
	}

	return Element;
} );