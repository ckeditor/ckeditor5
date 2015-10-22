/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation', 'document/nodelist' ], function( Operation, NodeList ) {
	/**
	 *
	 *
	 * @class document.Operation
	 */
	class MoveOperation extends Operation {
		/**
		 *
		 */
		constructor( sourcePosition, targetPosition, nodeList, baseVersion ) {
			super( baseVersion );

			this.sourcePosition = sourcePosition;
			this.targetPosition = targetPosition;
			this.nodeList = new NodeList( nodeList );
		}

		_execute() {
			var sourceElement = this.sourcePosition.parent;
			var targetElement = this.targetPosition.parent;
			var sourceOffset = this.sourcePosition.offset;
			var targetOffset = this.targetPosition.offset;
			var nodeList = this.nodeList;

			sourceElement.children.remove( sourceOffset, nodeList.length );

			// If we move children in the same element and we remove elements on the position before the target we
			// need to update a target offset.
			if ( sourceElement === targetElement && sourceOffset < targetOffset ) {
				targetOffset -= nodeList.length;
			}

			targetElement.insertChildren( targetOffset, this.nodeList );
		}

		reverseOperation() {
			return new MoveOperation( this.targetPosition, this.sourcePosition, this.nodeList, this.baseVersion + 1 );
		}
	}

	return MoveOperation;
} );