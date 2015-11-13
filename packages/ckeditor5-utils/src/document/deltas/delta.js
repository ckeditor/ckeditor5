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
		constructor( transaction, operations ) {
			this.transaction = transaction;
			this.operations = Array.from( operations );
		}

		_execute() {
			for ( var operation of this.operations ) {
				this.transaction.doc.applyOperation( operation );
			}
		}
	}

	return Delta;
} );