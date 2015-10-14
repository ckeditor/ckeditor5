/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation', 'document/insertoperation' ], function( Operation ) {
	/**
	 *
	 *
	 * @class document.Operation
	 */
	class RemoveOperation extends Operation {
		/**
		 *
		 */
		constructor( position, nodes, baseVersion ) {
			super( baseVersion );

			this.position = position;
			this.nodes = nodes;
		}

		_execute() {
			this.position.parent.children.splice( this.position.offset, Operation.uncompress( this.nodes ).length );
		}

		reverseOperation() {
			var InsertOperation = CKEDITOR.require( 'document/insertoperation' );

			return new InsertOperation( this.position, this.nodes, this.baseVersion + 1 );
		}
	}

	return RemoveOperation;
} );