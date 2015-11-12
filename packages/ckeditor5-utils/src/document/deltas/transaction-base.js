/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'utils', 'document/deltas/delta' ], ( utils, Delta ) => {
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

		[ Symbol.iterator ]() {
			return this.deltas[ Symbol.iterator ]();
		}

		static register( name, creator ) {
			if ( Transaction.prototype[ name ] ) {
				throw 'error';
			}

			Transaction.prototype[ name ] = function() {
				var deltas = creator.apply( this, [ this.doc, this ].concat( Array.from( arguments ) ) );

				if ( deltas instanceof Delta ) {
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