/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/operation', 'document/nodelist', 'document/removeoperation' ], function( Operation, NodeList ) {
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
		 * @param {document.Node|document.Text|document.NodeList|String|Array} nodes List of nodes to be inserted.
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
		 * Execute operation.
		 *
		 * @protected
		 */
		_execute() {
			this.position.parent.insertChildren( this.position.offset, this.nodeList );
		}

		/**
		 * Creates an reverse remove operation.
		 *
		 * @returns {document.RemoveOperation} Reverse operation.
		 */
		reverseOperation() {
			var RemoveOperation = CKEDITOR.require( 'document/removeoperation' );

			return new RemoveOperation( this.position, this.nodeList, this.baseVersion + 1 );
		}
	}

	return InsertOperation;
} );