/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'utils' ], ( utils ) => {
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

		static register( name, creator ) {
			if ( Transaction.prototype[ name ] ) {
				throw 'error';
			}

			Transaction.prototype[ name ] = function() {
				var deltas = creator( [ this.doc, this ].concat( arguments ) );

				if ( !utils.isIterable( deltas ) ) {
					deltas = [ deltas ];
				}

				for ( var delta of deltas ) {
					delta._execute();

					this.deltas.push( delta );
				}

				return this;
			};
		}
	}

	return Transaction;
} );