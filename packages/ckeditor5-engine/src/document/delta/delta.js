/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], () => {
	/**
	 * Base class for all deltas.
	 *
	 * Delta is a single, from the user action point of view, change in the editable document, like insert, split or
	 * rename element. Delta is composed of operations, which are unit changes need to be done to execute user action.
	 *
	 * Multiple deltas are grouped as a single {@link document.Transaction}.
	 *
	 * @class document.delta.Delta
	 */
	class Delta {
		/**
		 * Creates a delta instance.
		 *
		 * @constructor
		 */
		constructor() {
			/**
			 * {@link document.Transaction} which delta is a part of. This property is null by default and set by the
			 * {@link Document.Transaction#addDelta} method.
			 *
			 * @readonly
			 * @type {document.Transaction}
			 */
			this.transaction = null;

			/**
			 * Array of operations which compose delta.
			 *
			 * @readonly
			 * @type {document.operation.Operation[]}
			 */
			this.operations = [];
		}

		/**
		 * Add operation to the delta.
		 *
		 * @param {document.operation.Operation} operation Operation instance.
		 */
		addOperation( operation ) {
			operation.delta = this;
			this.operations.push( operation );

			return operation;
		}

		/**
		 * Delta provides iterator interface which will iterate over operations in the delta.
		 */
		[ Symbol.iterator ]() {
			return this.operations[ Symbol.iterator ]();
		}
	}

	return Delta;
} );