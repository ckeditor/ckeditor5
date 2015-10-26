/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation', 'document/nodelist', 'document/removeoperation' ], function( Operation, NodeList ) {
	/**
	 *
	 *
	 * @class document.Operation
	 */
	class InsertOperation extends Operation {
		/**
		 * @constructor
		 */
		constructor( position, nodeList, baseVersion ) {
			super( baseVersion );

			this.position = position;
			this.nodeList = new NodeList( nodeList );
		}

		_execute() {
			this.position.parent.insertChildren( this.position.offset, this.nodeList );
		}

		reverseOperation() {
			var RemoveOperation = CKEDITOR.require( 'document/removeoperation' );

			return new RemoveOperation( this.position, this.nodeList, this.baseVersion + 1 );
		}
	}

	return InsertOperation;
} );