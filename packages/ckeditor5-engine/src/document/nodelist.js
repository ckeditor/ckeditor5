/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/character', 'document/node', 'utils' ], function( Character, Node, utils ) {
	/**
	 * @class document.NodeList
	 */
	class NodeList {
		constructor( nodes ) {
			if ( nodes instanceof NodeList ) {
				// We do not clone anything.
				return nodes;
			}

			this._nodes = [];

			if ( nodes ) {
				var node, i, j, nodeLen, nodesLen;

				if ( !utils.isArray( nodes ) ) {
					nodes = [ nodes ];
				}

				for ( i = 0, nodesLen = nodes.length; i < nodesLen; i++ ) {
					node = nodes[ i ];

					if ( node instanceof Node ) {
						this._nodes.push( node );
					} else {
						for ( j = 0, nodeLen = node.length; j < nodeLen; j++ ) {
							this._nodes.push( new Character( null, node[ j ] ) );
						}
					}
				}
			}
		}

		get( index ) {
			return this._nodes[ index ];
		}

		insert( index, nodeList ) {
			this._nodes.splice.apply( this._nodes, [ index, 0 ].concat( nodeList._nodes ) );
		}

		push( nodes ) {
			this.insert( this._nodes.length, new NodeList( nodes ) );
		}

		remove( index, number ) {
			this._nodes.splice( index, number );
		}

		indexOf( node ) {
			return this._nodes.indexOf( node );
		}

		get length() {
			return this._nodes.length;
		}
	}

	return NodeList;
} );