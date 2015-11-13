/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], () => {
	/**
	 * @class document.Transaction
	 */
	class Transaction {
		/**
		 * @constructor
		 */
		constructor( doc ) {
			this.doc = doc;
			this.deltas = [];
		}

		addDelta( delta ) {
			delta.transaction = this;
			this.deltas.push( delta );

			return delta;
		}

		[ Symbol.iterator ]() {
			return this.deltas[ Symbol.iterator ]();
		}

		static register( name, creator ) {
			if ( Transaction.prototype[ name ] ) {
				throw 'error';
			}

			Transaction.prototype[ name ] = function() {
				creator.apply( this, [ this.doc, this ].concat( Array.from( arguments ) ) );

				return this;
			};
		}
	}

	return Transaction;
} );