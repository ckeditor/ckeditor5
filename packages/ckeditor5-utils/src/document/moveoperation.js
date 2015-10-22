/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation',
	'document/nodelist',
	'ckeditorerror',
	'utils'
], function( Operation, NodeList, CKEditorError, utils ) {
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

			if ( CKEDITOR.isDebug ) {
				var i = 0;

				for ( var node of this.nodeList ) {
					if ( !utils.isEqual( sourceElement.children.get( sourceOffset + i ), node ) ) {
						/**
						 * The node which should be removed does not exists.
						 *
						 * @error operation-move-node-does-not-exists:
						 * @param {document.MoveOperation} moveOperation
						 * @param {document.Node} node
						 */
						throw new CKEditorError(
							'operation-move-node-does-not-exists: The node which should be moved does not exists.',
							{ moveOperation: this, node: this.node } );
					}
					i++;
				}
			}

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