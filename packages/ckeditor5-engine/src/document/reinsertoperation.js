/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/moveoperation',
	'document/removeoperation'
], function( MoveOperation ) {
	/**
	 * Operation to reinsert previously removed nodes back to the non-graveyard root.
	 * This is basically MoveOperation but it returns RemoveOperation when reversed.
	 * We achieve two goals: by having separate classes it's easier to distinguish whether move
	 * operation is actually a remove/reinsert operation and fire proper events. Also it
	 * will be easier to expand if we need to change operation's behavior if it is remove/reinsert.
	 *
	 * @class document.ReinsertOperation
	 */
	class ReinsertOperation extends MoveOperation {
		/**
		 * See {@link document.Operation#getReversed}.
		 */
		getReversed() {
			// Because of circular dependencies we need to re-require reinsert operation here.
			var RemoveOperation = CKEDITOR.require( 'document/removeoperation' );

			return new RemoveOperation( this.targetPosition, this.howMany, this.baseVersion + 1 );
		}
	}

	return ReinsertOperation;
} );
