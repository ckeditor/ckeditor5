/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'treemodel/operation/operation',
	'treemodel/nodelist',
	'treemodel/range',
	'treemodel/operation/removeoperation'
], ( Operation, NodeList, Range ) => {
	/**
	 * Operation to insert list of nodes on the given position in the tree data model.
	 *
	 * @class treeModel.operation.InsertOperation
	 */
	class InsertOperation extends Operation {
		/**
		 * Creates an insert operation.
		 *
		 * @param {treeModel.Position} position Position of insertion.
		 * @param {treeModel.Node|treeModel.Text|treeModel.NodeList|String|Iterable} nodes The list of nodes to be inserted.
		 * List of nodes can be any type accepted by the {@link treeModel.NodeList} constructor.
		 * @param {Number} baseVersion {@link treeModel.Document#version} on which operation can be applied.
		 * @constructor
		 */
		constructor( position, nodes, baseVersion ) {
			super( baseVersion );

			/**
			 * Position of insertion.
			 *
			 * @readonly
			 * @type {treeModel.Position}
			 */
			this.position = position;

			/**
			 * List of nodes to insert.
			 *
			 * @readonly
			 * @type {treeModel.NodeList}
			 */
			this.nodeList = new NodeList( nodes );
		}

		get type() {
			return 'insert';
		}

		clone() {
			return new InsertOperation( this.position, this.nodeList, this.baseVersion );
		}

		getReversed() {
			// Because of circular dependencies we need to re-require remove operation here.
			const RemoveOperation = CKEDITOR.require( 'treemodel/operation/removeoperation' );

			return new RemoveOperation( this.position, this.nodeList.length, this.baseVersion + 1 );
		}

		_execute() {
			this.position.parent.insertChildren( this.position.offset, this.nodeList );

			return {
				range: Range.createFromPositionAndShift( this.position, this.nodeList.length )
			};
		}
	}

	return InsertOperation;
} );
