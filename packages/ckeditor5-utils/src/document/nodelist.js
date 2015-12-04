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
], ( Character, Text, Node, utils ) => {
	/**
	 * List of nodes. It is used to represent multiple nodes with a given order, for example children of
	 * {@link document.Element} object or nodes inserted using {@link document.operation.InsertOperation}.
	 *
	 * Thanks to the constructor, which accepts various arguments, this class lets you easily create desired list of nodes.
	 *
	 * It also may internally compress nodes.
	 *
	 * @class document.NodeList
	 */
	class NodeList {
		/**
		 * Constructor let you create a list of nodes in many ways. See examples:
		 *
		 *		let nodeList = new NodeList( [ new Element( p1 ), new Element( p1 ) ] );
		 *		nodeList.length; // 2
		 *
		 *		let nodeList = new NodeList( new Element( p ) );
		 *		nodeList.length; // 1
		 *
		 *		let nodeList = new NodeList( [ 'foo', new Element( p ), 'bar' ] );
		 *		nodeList.length; // 7
		 *
		 *		let nodeList = new NodeList( 'foo' );
		 *		nodeList.length; // 3
		 *
		 *		let nodeList = new NodeList( new Text( 'foo', [ new Attribute( 'bar', 'bom' ) ] ) );
		 *		nodeList.length; // 3
		 *		nodeList.get( 0 ).getAttr( 'bar' ); // 'bom'
		 *		nodeList.get( 1 ).getAttr( 'bar' ); // 'bom'
		 *		nodeList.get( 2 ).getAttr( 'bar' ); // 'bom'
		 *
		 *		let nodeListA = new NodeList( 'foo' );
		 *		let nodeListB = new NodeList( nodeListA );
		 *		nodeListA === nodeListB // true
		 *		nodeListB.length // 3
		 *
		 * @param {document.Node|document.Text|document.NodeList|String|Iterable} nodes List of nodes.
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
			 * @property {Array}
			 */
			this._nodes = [];

			if ( nodes ) {
				let node, character;

				if ( !utils.isIterable( nodes ) ) {
					nodes = [ nodes ];
				}

				for ( node of nodes ) {
					// Node.
					if ( node instanceof Node ) {
						this._nodes.push( node );
					}
					// Text.
					else if ( node instanceof Text ) {
						for ( character of node.text ) {
							this._nodes.push( new Character( character, node.attrs ) );
						}
					}
					// String.
					else {
						for ( character of node ) {
							this._nodes.push( new Character( character ) );
						}
					}
				}
			}
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
		 * Search for the node in the node list.
		 *
		 * @param {document.Node} node Node to find.
		 * @returns {Number} Position of the node in the list.
		 */
		indexOf( node ) {
			return this._nodes.indexOf( node );
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
		 * @returns {document.NodeList} List of removed nodes.
		 */
		remove( index, number ) {
			return new NodeList( this._nodes.splice( index, number ) );
		}
	}

	return NodeList;
} );
