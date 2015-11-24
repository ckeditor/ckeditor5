/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation/operation',
	'document/nodelist',
	'document/operation/removeoperation',
	'document/operation/moveoperation'
], ( Operation, NodeList ) => {
	/**
	 * Operation to insert list of nodes on the given position in the tree data model.
	 *
	 * @class document.operation.InsertOperation
	 */
	class InsertOperation extends Operation {
		/**
		 * Creates an insert operation.
		 *
		 * @param {document.Position} position Position of insertion.
		 * @param {document.Node|document.Text|document.NodeList|String|Iterable} nodes The list of nodes to be inserted.
		 * List of nodes can be any type accepted by the {@link document.NodeList} constructor.
		 * @param {Number} baseVersion {@link document.Document#version} on which operation can be applied.
		 * @constructor
		 */
		constructor( position, nodes, baseVersion ) {
			super( baseVersion );

			/**
			 * Position of insertion.
			 *
			 * @readonly
			 * @type {document.Position}
			 */
			this.position = position;

			/**
			 * List of nodes to insert.
			 *
			 * @readonly
			 * @type {document.NodeList}
			 */
			this.nodeList = new NodeList( nodes );
		}

		_execute() {
			this.position.parent.insertChildren( this.position.offset, this.nodeList );
		}

		getReversed() {
			// Because of circular dependencies we need to re-require remove operation here.
			const RemoveOperation = CKEDITOR.require( 'document/operation/removeoperation' );

			return new RemoveOperation( this.position, this.nodeList.length, this.baseVersion + 1 );
		}

		getTransformedBy( operation, isStrong ) {
			// Circular dependency re-require.
			const MoveOperation = CKEDITOR.require( 'document/operation/moveoperation' );

			if ( operation instanceof InsertOperation ) {
				return getTransformedByInsertOperation.call( this, operation, !!isStrong );
			} else if ( operation instanceof MoveOperation ) {
				return getTransformedByMoveOperation.call( this, operation, !!isStrong );
			}

			return [ this.clone( this.baseVersion + 1 ) ];
		}

		clone( baseVersion ) {
			if ( !baseVersion ) {
				baseVersion = this.baseVersion;
			}

			return new InsertOperation( this.position, this.nodeList, baseVersion );
		}
	}

	/**
	 * Returns an array containing the result of transforming this operation by given {document.operation.InsertOperation}.
	 *
	 * @method getTransformedByInsertOperation
	 * @param {document.operation.InsertOperation} insert Operation to transform by.
	 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
	 * when resolving conflicts.
	 * @returns {Array.<document.operation.ChangeOperation>} Result of the transformation.
	 * @private
	 */
	function getTransformedByInsertOperation( insert, isStrong ) {
		/*jshint validthis:true */

		// Transformed operations are always new instances, not references to the original operations.
		const transformed = this.clone( this.baseVersion + 1 );

		// Transform this operation's position by given operation's position.
		transformed.position = transformed.position.getTransformedByInsertion( insert.position, insert.nodeList.length, !isStrong );

		return [ transformed ];
	}

	/**
	 * Returns an array containing the result of transforming this operation by given {document.operation.MoveOperation}.
	 *
	 * @method getTransformedByMoveOperation
	 * @param {document.operation.MoveOperation} move Operation to transform by.
	 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
	 * when resolving conflicts.
	 * @returns {Array.<document.operation.InsertOperation>} Result of the transformation.
	 * @private
	 */
	function getTransformedByMoveOperation( move, isStrong ) {
		/*jshint validthis:true */

		// Transformed operations are always new instances, not references to the original operations.
		const transformed = this.clone( this.baseVersion + 1 );

		// MoveOperation removes nodes from their original position. We acknowledge this by proper transformation.
		const newPosition = this.position.getTransformedByDeletion( move.sourcePosition, move.howMany );

		if ( newPosition == null ) {
			// This operation's position was inside a node moved by MoveOperation. We substitute that position by
			// the combination of move target position and insert position. This reflects changes done by MoveOperation.

			transformed.position = transformed.position.getCombined( move.sourcePosition, move.targetPosition );
		} else {
			// Here we have the insert position after some nodes has been removed by MoveOperation.
			// Next step is to reflect pasting nodes by MoveOperation, which might further affect the position.

			transformed.position = newPosition.getTransformedByInsertion( move.targetPosition, move.howMany, !isStrong );
		}

		return [ transformed ];
	}

	return InsertOperation;
} );
