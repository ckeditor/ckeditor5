/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation', 'document/nodelist', 'document/insertoperation' ], function( Operation, NodeList ) {
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
			this.nodeList = new NodeList( nodes );
		}

		_execute() {
			this.position.parent.children.remove( this.position.offset, this.nodeList.length );
		}

		reverseOperation() {
			var InsertOperation = CKEDITOR.require( 'document/insertoperation' );

			return new InsertOperation( this.position, this.nodeList, this.baseVersion + 1 );
		}
	}

	return RemoveOperation;
} );