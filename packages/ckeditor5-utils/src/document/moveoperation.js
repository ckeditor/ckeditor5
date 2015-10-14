/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation' ], function( Operation ) {
	/**
	 *
	 *
	 * @class document.Operation
	 */
	class MoveOperation extends Operation {
		/**
		 *
		 */
		constructor( sourcePosition, targetPosition, nodes, baseVersion ) {
			super( baseVersion );

			this.sourcePosition = sourcePosition;
			this.targetPosition = targetPosition;
			this.nodes = nodes;
		}

		_execute() {
			var children = this.position.parent.children;
			var nodes = this.uncompres( this.nodes );

			children.splice( this.position.offset, nodes.length );

			children.splice.apply( children, [ this.position.offset, 0 ].concat( nodes ) );
		}

		reverseOperation() {
			return new MoveOperation( this.targetPosition, this.nodes, this.sourcePosition, this.baseVersion + 1 );
		}
	}

	return MoveOperation;
} );