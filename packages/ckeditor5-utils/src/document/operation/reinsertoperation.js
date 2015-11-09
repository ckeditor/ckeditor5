/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation/moveoperation',
	'document/operation/removeoperation'
], function( MoveOperation ) {
	/**
	 * Operation to reinsert previously removed nodes back to the non-graveyard root.
	 * This is basically {@link document.operation.MoveOperation} but it returns
	 * {@link document.operation.RemoveOperation} when reversed.
	 *
	 * With this class, we achieve two goals: by having separate classes it's easier to distinguish whether move
	 * operation is actually a remove/reinsert operation and fire proper events. Also it
	 * will be easier to expand if we need to change operation's behavior if it is remove/reinsert.
	 *
	 * @class document.operation.ReinsertOperation
	 */
	class ReinsertOperation extends MoveOperation {
		getReversed() {
			// Because of circular dependencies we need to re-require reinsert operation here.
			var RemoveOperation = CKEDITOR.require( 'document/operation/removeoperation' );

			return new RemoveOperation( this.targetPosition, this.howMany, this.baseVersion + 1 );
		}
	}

	return ReinsertOperation;
} );
