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
			var sourceElement = this.sourcePosition.parent;
			var targetElement = this.targetPosition.parent;
			var sourceOffset = this.sourcePosition.offset;
			var targetOffset = this.targetPosition.offset;
			var nodes = Operation.uncompress( this.nodes );

			sourceElement.children.splice( sourceOffset, nodes.length );

			// If we move children in the same element and we remove elements on the position before the target we
			// need to update a target offset.
			if ( sourceElement === targetElement && sourceOffset < targetOffset ) {
				targetOffset -= nodes.length;
			}

			targetElement.children.splice.apply( targetElement.children, [ targetOffset, 0 ].concat( nodes ) );
		}

		reverseOperation() {
			return new MoveOperation( this.targetPosition, this.sourcePosition, this.nodes, this.baseVersion + 1 );
		}
	}

	return MoveOperation;
} );