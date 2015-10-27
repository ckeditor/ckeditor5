/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation',
	'document/nodelist',
	'ckeditorerror',
	'utils',
	'document/insertoperation'
], function( Operation, NodeList, CKEditorError, utils ) {
	/**
	 * Operation to remove list of nodes.
	 *
	 * @class document.RemoveOperation
	 */
	class RemoveOperation extends Operation {
		/**
		 * Creates a remove operation.
		 *
		 * Note that this constructor is used not only to create an operation on the current state of the document,
		 * but also to create reverse operation or the result of the operational transformation. The operation also
		 * needs to keep data needed to transform it (creates an insert operation as a reverse of the remove).
		 * This is why this constructor contains list of nodes instead of length.
		 *
		 * @param {document.Position} position Position before the first node to remove.
		 * @param {document.Node|document.Text|document.NodeList|String|Iterable} nodes List of nodes to be remove.
		 * List of nodes can be any type accepted by the {@link document.NodeList} constructor.
		 * @param {Number} baseVersion {@link document.Document#version} on which operation can be applied.
		 * @constructor
		 */
		constructor( position, nodes, baseVersion ) {
			super( baseVersion );

			/**
			 * Position of insertion.
			 *
			 * @type {document.Position}
			 */
			this.position = position;

			/**
			 * List of nodes to insert.
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
			var parent = this.position.parent;
			var offset = this.position.offset;

			if ( CKEDITOR.isDebug ) {
				var i = 0;

				for ( var node of this.nodeList ) {
					if ( !utils.isEqual( parent.getChild( offset + i ), node ) ) {
						/**
						 * The node which should be removed does not exists.
						 *
						 * @error operation-remove-node-does-not-exists:
						 * @param {document.RemoveOperation} removeOperation
						 * @param {document.Node} node
						 */
						throw new CKEditorError(
							'operation-remove-node-does-not-exists: The node which should be removed does not exists.',
							{ removeOperation: this, node: this.node } );
					}
					i++;
				}
			}

			parent.removeChildren( offset, this.nodeList.length );
		}

		/**
		 * Creates an reverse insert operation.
		 *
		 * @returns {document.InsertOperation} Reverse operation.
		 */
		reverseOperation() {
			var InsertOperation = CKEDITOR.require( 'document/insertoperation' );

			return new InsertOperation( this.position, this.nodeList, this.baseVersion + 1 );
		}
	}

	return RemoveOperation;
} );