/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'ckeditorerror' ], ( CKEditorError ) => {
	/**
	 * The transaction class groups document changes (deltas). All deltas grouped in a single transactions can be
	 * reverted together, so you can think about the transaction as a single undo step. If you want to extend one
	 * undo step you can call another method on the same transaction object. If you want to create a separate undo step
	 * you can create a new transaction.
	 *
	 * For example to create two separate undo steps you can call:
	 *
	 *		doc.createTransaction().insert( firstPosition, 'foo' );
	 *		doc.createTransaction().insert( secondPosition, 'bar' );
	 *
	 * To create a single undo step:
	 *
	 *		const transaction = doc.createTransaction()
	 *		transaction.insert( firstPosition, 'foo' );
	 *		transaction.insert( secontPosition, 'bar' );
	 *
	 * Note that all document modification methods (insert, remove, split, etc.) are chainable so you can shorten code to:
	 *
	 *		doc.createTransaction().insert( firstPosition, 'foo' ).insert( secontPosition, 'bar' );
	 *
	 * @class document.Transaction
	 */
	class Transaction {
		/**
		 * Creates transaction instance. Not recommended to use directly, use {@link document.Document#createTransaction}
		 * instead.
		 *
		 * @constructor
		 * @param {document.Document} doc Document which this transaction changes.
		 */
		constructor( doc ) {
			/**
			 * Document which this transaction changes.
			 *
			 * @readonly
			 * @type {document.Document}
			 */
			this.doc = doc;

			/**
			 * Array of deltas which compose transaction.
			 *
			 * @readonly
			 * @type {document.delta.Delta[]}
			 */
			this.deltas = [];
		}

		/**
		 * Adds delta to the transaction instance. All modification methods (insert, remove, split, etc.) use this method
		 * to add created deltas.
		 *
		 * @param {document.delta.Delta} delta Delta to add.
		 * @return {document.delta.Delta} Added delta.
		 */
		addDelta( delta ) {
			delta.transaction = this;
			this.deltas.push( delta );

			return delta;
		}

		/**
		 * Static method to register transaction methods. To make code scalable transaction do not have modification
		 * methods built in. They can be registered using this method.
		 *
		 * This method checks if there is no naming collision and throw `transaction-register-taken` if the method name
		 * is already taken.
		 *
		 * It also passes {@link document.Document} and {@link document.Transaction} do the creator class.
		 *
		 * Registered function returns `this` so they can be chainable by default.
		 *
		 * Beside that no magic happens here, the method is added to the `Transaction` class prototype.
		 *
		 * For example:
		 *
		 *		Transaction.register( 'insert', ( doc, transaction, position, nodes ) => {
		 *			// You can use a class inherit from Delta if that class should handle OT in the special way.
		 *			const delta = new Delta();
		 *
		 * 			// Create operations which should be components of this delta.
		 *			const operation = new InsertOperation( position, nodes, doc.version );
		 *
		 *			// Remember to apply every operation, no magic, you need to do it manually.
		 *			doc.applyOperation( operation );
		 *
		 *			// Add operation to the delta.
		 *			delta.addOperation( operation );
		 *
		 *			// Add delta to the transaction instance.
		 *			transaction.addDelta( delta );
		 *
		 * 			// You do not need to return transaction, register method will take care to make the method chainable.
		 *		} );
		 *
		 * @param {String} name Method name.
		 * @param {Fuction} creator Method body.
		 */
		static register( name, creator ) {
			if ( Transaction.prototype[ name ] ) {
				/**
				 * This transaction method is already taken.
				 *
				 * @error transaction-register-taken
				 * @param {String} name
				 */
				throw new CKEditorError(
					'transaction-register-taken: This transaction method is already taken.',
					{ name: name } );
			}

			Transaction.prototype[ name ] = function() {
				creator.apply( this, [ this.doc, this ].concat( Array.from( arguments ) ) );

				return this;
			};
		}
	}

	return Transaction;
} );