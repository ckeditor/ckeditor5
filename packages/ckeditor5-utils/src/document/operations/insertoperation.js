/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operations/operation',
	'document/nodelist',
	'document/operations/removeoperation'
], function( Operation, NodeList ) {
	/**
	 * Operation to insert list of nodes on the given position.
	 *
	 * @class document.InsertOperation
	 */
	class InsertOperation extends Operation {
		/**
		 * Creates an insert operation.
		 *
		 * @param {document.Position} position Position of insertion.
		 * @param {document.Node|document.Text|document.NodeList|String|Iterable} nodes List of nodes to be inserted.
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

		/**
		 * See {@link document.Operation#_execute}.
		 */
		_execute() {
			this.position.parent.insertChildren( this.position.offset, this.nodeList );
		}

		/**
		 * See {@link document.Operation#getReversed}.
		 */
		getReversed() {
			// Because of circular dependencies we need to re-require remove operation here.
			var RemoveOperation = CKEDITOR.require( 'document/operations/removeoperation' );

			return new RemoveOperation( this.position, this.nodeList.length, this.baseVersion + 1 );
		}
	}

	return InsertOperation;
} );
