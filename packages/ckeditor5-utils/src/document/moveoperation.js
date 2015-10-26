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
	 * Operation to move list of following nodes from the one position in the document to another.
	 *
	 * @class document.Operation
	 */
	class MoveOperation extends Operation {
		/**
		 * Creates a move operation.
		 *
		 * Note that this constructor is used not only to create an operation on the current state of the document,
		 * but also to create reverse operation or the result of the operational transformation. The operation also
		 * needs to keep data needed to transform it (creates an insert operation from the move & remove combination).
		 * This is why this constructor contains list of nodes instead of length.
		 *
		 * @param {document.Position} sourcePosition Source move position.
		 * @param {document.Position} targetPosition Target move position.
		 * @param {document.Node|document.Text|document.NodeList|String|Array} nodes List of nodes to be moved.
		 * List of nodes can be any type accepted by the {@link document.NodeList} constructor.
		 * @param {Number} baseVersion {@link document.Document#version} on which operation can be applied.
		 * @constructor
		 */
		constructor( sourcePosition, targetPosition, nodes, baseVersion ) {
			super( baseVersion );

			/**
			 * Source move position.
			 *
			 * @type {document.Position}
			 */
			this.sourcePosition = sourcePosition;

			/**
			 * Target move position.
			 *
			 * @type {document.Position}
			 */
			this.targetPosition = targetPosition;

			/**
			 * List of nodes to move.
			 *
			 * @type {document.NodeList}
			 */
			this.nodeList = new NodeList( nodes );
		}

		/**
		 * Execute operation.
		 *
		 * @protected
		 */
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

			sourceElement.removeChildren( sourceOffset, nodeList.length );

			// If we move children in the same element and we remove elements on the position before the target we
			// need to update a target offset.
			if ( sourceElement === targetElement && sourceOffset < targetOffset ) {
				targetOffset -= nodeList.length;
			}

			targetElement.insertChildren( targetOffset, this.nodeList );
		}

		/**
		 * Creates an reverse move operation.
		 *
		 * @returns {document.MoveOperation} Reverse operation.
		 */
		reverseOperation() {
			return new MoveOperation( this.targetPosition, this.sourcePosition, this.nodeList, this.baseVersion + 1 );
		}
	}

	return MoveOperation;
} );