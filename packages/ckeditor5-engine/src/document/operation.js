/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/character', 'document/node', 'utils' ], function( Character, Node, utils ) {
	/**
	 *
	 *
	 * @class document.Operation
	 */
	class Operation {
		/**
		 *
		 */
		constructor( baseVersion ) {
			this.baseVersion = baseVersion;
		}

		static uncompress( nodes ) {
			var uncompress = [];
			var node;

			if ( !utils.isArray( nodes ) ) {
				nodes = [ nodes ];
			}

			for ( var i = 0, nodesLen = nodes.length; i < nodesLen; i++ ) {
				node = nodes[ i ];

				if ( node instanceof Node ) {
					uncompress.push( node );
				} else {
					for ( var j = 0, nodeLen = node.length; j < nodeLen; j++ ) {
						uncompress.push( new Character( null, node[ j ] ) );
					}
				}
			}

			return uncompress;
		}
	}

	return Operation;
} );