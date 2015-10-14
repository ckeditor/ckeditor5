/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation', 'document/removeoperation' ], function( Operation ) {
	/**
	 *
	 *
	 * @class document.Operation
	 */
	class InsertOperation extends Operation {
		/**
		 *
		 */
		constructor( position, nodes, baseVersion ) {
			super( baseVersion );

			this.position = position;
			this.nodes = nodes;
		}

		_execute() {
			var children = this.position.parent.children;

			children.splice.apply( children, [ this.position.offset, 0 ].concat( Operation.uncompress( this.nodes ) ) );
		}

		reverseOperation() {
			var RemoveOperation = CKEDITOR.require( 'document/removeoperation' );

			return new RemoveOperation( this.position, this.nodes, this.baseVersion + 1 );
		}
	}

	return InsertOperation;
} );