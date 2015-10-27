/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/character',
	'document/text',
	'document/node',
	'utils'
], function( Character, Text, Node, utils ) {
	/**
	 * List of nodes. It is used to represent multiple nodes with a given order, for example children of
	 * elements {@link document.Element}.
	 *
	 * This class let you modify list of nodes, for example nodes to insert and pass the reference for such list.
	 *
	 * Thanks to the constructor which accept various structure, this class let you easily create list of text node.
	 *
	 * It also may internally compress nodes.
	 *
	 * @class document.NodeList
	 */
	class NodeList {
		/**
		 * Constructor let you create a list of nodes in many ways. See examples:
		 *
		 *		var nodeList = new NodeList( [ new Element( p1 ), new Element( p1 ) ] );
		 *		nodeList.length // 2
		 *
		 *		var nodeList = new NodeList( new Element( p ) );
		 *		nodeList.length // 1
		 *
		 *		var nodeList = new NodeList( [ 'foo', new Element( p ), 'bar' ] );
		 *		nodeList.length // 7
		 *
		 *		var nodeList = new NodeList( 'foo' );
		 *		nodeList.length // 3
		 *
		 *		var nodeList = new NodeList( new Text( 'foo', [ attrA, attrB ] ) );
		 *		nodeList.length // 3
		 *		nodeList.get( 0 ).getAttrCount() // 2
		 *		nodeList.get( 1 ).getAttrCount() // 2
		 *		nodeList.get( 2 ).getAttrCount() // 2
		 *
		 *		var nodeListA = new NodeList( 'foo' );
		 *		var nodeListB = new NodeList( nodeListA );
		 *		nodeListA === nodeListB // true
		 *		nodeListB.length // 3
		 *
		 * @param {document.Node|document.Text|document.NodeList|String|Array} nodes List of nodes.
		 * @constructor
		 */
		constructor( nodes ) {
			if ( nodes instanceof NodeList ) {
				// We do not clone anything.
				return nodes;
			}

			/**
			 * Internal array to store nodes.
			 *
			 * @private
			 * @property {Array} _nodes
			 */
			this._nodes = [];

			if ( nodes ) {
				var node, i, j, nodeLen, nodesLen;

				if ( !utils.isArray( nodes ) ) {
					nodes = [ nodes ];
				}

				for ( i = 0, nodesLen = nodes.length; i < nodesLen; i++ ) {
					node = nodes[ i ];

					// Node.
					if ( node instanceof Node ) {
						this._nodes.push( node );
					}
					// Text.
					else if ( node instanceof Text ) {
						for ( j = 0, nodeLen = node.text.length; j < nodeLen; j++ ) {
							this._nodes.push( new Character( node.text[ j ], utils.clone( node.attrs ) ) );
						}
					}
					// String.
					else {
						for ( j = 0, nodeLen = node.length; j < nodeLen; j++ ) {
							this._nodes.push( new Character( node[ j ] ) );
						}
					}
				}
			}
		}

		/**
		 * Returns node at the given index.
		 *
		 * @param {Number} index Node index.
		 * @returns {document.Node} Node at given index.
		 */
		get( index ) {
			return this._nodes[ index ];
		}

		/**
		 * Inserts nodes from the given node list into this node list at the given index.
		 *
		 * @param {Number} index Position where nodes should be inserted.
		 * @param {document.NodeList} nodeList List of nodes to insert.
		 */
		insert( index, nodeList ) {
			this._nodes.splice.apply( this._nodes, [ index, 0 ].concat( nodeList._nodes ) );
		}

		/**
		 * Removes number of nodes starting at the given index.
		 *
		 * @param {Number} index Position of the first node to remove.
		 * @param {Number} number Number of nodes to remove.
		 */
		remove( index, number ) {
			this._nodes.splice( index, number );
		}

		/**
		 * Search for the node in the node list.
		 *
		 * @param {document.Node} node Node to found.
		 * @returns {Number} Number representing the position where the specified search value occurs for the first time,
		 * or -1 if it never occurs.
		 */
		indexOf( node ) {
			return this._nodes.indexOf( node );
		}

		/**
		 * Number of nodes in the node list.
		 *
		 * @readonly
		 * @property {Number} length
		 */
		get length() {
			return this._nodes.length;
		}

		/**
		 * Node list iterator.
		 */
		[ Symbol.iterator ]() {
			return this._nodes[ Symbol.iterator ]();
		}
	}

	return NodeList;
} );