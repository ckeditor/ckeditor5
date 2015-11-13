/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], function() {
	/**
	 * @class document.delta.Delta
	 */
	class Delta {
		/**
		 * @constructor
		 */
		constructor() {
			this.transaction = null;
			this.operations = [];
		}

		addOperation( operation ) {
			operation.delta = this;
			this.operations.push( operation );

			return operation;
		}

		[ Symbol.iterator ]() {
			return this.operations[ Symbol.iterator ]();
		}
	}

	return Delta;
} );