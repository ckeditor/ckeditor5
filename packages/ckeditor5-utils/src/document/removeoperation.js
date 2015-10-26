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
	 *
	 *
	 * @class document.Operation
	 */
	class RemoveOperation extends Operation {
		/**
		 *
		 */
		constructor( position, nodes, baseVersion ) {
			super( baseVersion );

			this.position = position;
			this.nodeList = new NodeList( nodes );
		}

		_execute() {
			var parent = this.position.parent;
			var offset = this.position.offset;

			if ( CKEDITOR.isDebug ) {
				var i = 0;

				for ( var node of this.nodeList ) {
					if ( !utils.isEqual( parent.children.get( offset + i ), node ) ) {
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

		reverseOperation() {
			var InsertOperation = CKEDITOR.require( 'document/insertoperation' );

			return new InsertOperation( this.position, this.nodeList, this.baseVersion + 1 );
		}
	}

	return RemoveOperation;
} );