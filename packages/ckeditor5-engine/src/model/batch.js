/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * The Batch class groups document changes (deltas). All deltas grouped in a single Batch can be
 * reverted together, so you can think about the Batch as a single undo step. If you want to extend one
 * undo step you can call another method on the same Batch object. If you want to create a separate undo step
 * you can create a new Batch.
 *
 * For example to create two separate undo steps you can call:
 *
 *		doc.batch().insert( firstPosition, 'foo' );
 *		doc.batch().insert( secondPosition, 'bar' );
 *
 * To create a single undo step:
 *
 *		const batch = doc.batch();
 *		batch.insert( firstPosition, 'foo' );
 *		batch.insert( secondPosition, 'bar' );
 *
 * Note that all document modification methods (insert, remove, split, etc.) are chainable so you can shorten code to:
 *
 *		doc.batch().insert( firstPosition, 'foo' ).insert( secondPosition, 'bar' );
 *
 * @memberOf engine.model
 */
export default class Batch {
	/**
	 * Creates Batch instance. Not recommended to use directly, use {@link engine.model.Document#batch} instead.
	 *
	 * @param {engine.model.Document} document Document which this Batch changes.
	 * @param {'transparent'|'default'} [type='default'] Type of the batch.
	 */
	constructor( document, type = 'default' ) {
		/**
		 * Document which this batch changes.
		 *
		 * @readonly
		 * @member {engine.model.Document} engine.model.Batch#document
		 */
		this.document = document;

		/**
		 * Array of deltas which compose this batch.
		 *
		 * @readonly
		 * @member {Array.<engine.model.delta.Delta>} engine.model.Batch#deltas
		 */
		this.deltas = [];

		/**
		 * Type of the batch.
		 *
		 * Can be one of the following values:
		 * * `'default'` - all "normal" batches, most commonly used type.
		 * * `'transparent'` - batch that should be ignored by other features, i.e. initial batch or collaborative editing changes.
		 *
		 * @readonly
		 * @member {'transparent'|'default'} engine.model.Batch#type
		 */
		this.type = type;
	}

	/**
	 * Returns this batch base version, which is equal to the base version of first delta in the batch.
	 * If there are no deltas in the batch, it returns `null`.
	 *
	 * @readonly
	 * @type {Number|null}
	 */
	get baseVersion() {
		return this.deltas.length > 0 ? this.deltas[ 0 ].baseVersion : null;
	}

	/**
	 * Adds delta to the batch instance. All modification methods (insert, remove, split, etc.) use this method
	 * to add created deltas.
	 *
	 * @param {engine.model.delta.Delta} delta Delta to add.
	 * @return {engine.model.delta.Delta} Added delta.
	 */
	addDelta( delta ) {
		delta.batch = this;
		this.deltas.push( delta );

		return delta;
	}

	/**
	 * Gets an iterable collection of operations.
	 *
	 * @returns {Iterable.<engine.model.operation.Operation>}
	 */
	*getOperations() {
		for ( let delta of this.deltas ) {
			yield* delta.operations;
		}
	}
}

/**
 * Function to register batch methods. To make code scalable Batch do not have modification
 * methods built in. They can be registered using this method.
 *
 * This method checks if there is no naming collision and throws `batch-register-taken` if the method name
 * is already taken.
 *
 * Besides that no magic happens here, the method is added to the `Batch` class prototype.
 *
 * For example:
 *
 *		Batch.register( 'insert', function( position, nodes ) {
 *			// You can use a class inherit from Delta if that class should handle OT in the special way.
 *			const delta = new Delta();
 *
 *			// Add delta to the Batch instance. It is important to add delta to batch before applying any operation.
 *			this.addDelta( delta );
 *
 *			// Create operations which should be components of this delta.
 *			const operation = new InsertOperation( position, nodes, this.document.version );
 *
 *			// Add operation to the delta. It is important to add operation before applying it.
 *			delta.addOperation( operation );
 *
 *			// Remember to apply every operation, no magic, you need to do it manually.
 *			this.document.applyOperation( operation );
 *
 *			// Make this method chainable.
 *			return this;
 *		} );
 *
 * @method engine.model.Batch.register
 * @param {String} name Method name.
 * @param {Function} creator Method body.
 */
export function register( name, creator ) {
	if ( Batch.prototype[ name ] ) {
		/**
		 * This batch method name is already taken.
		 *
		 * @error batch-register-taken
		 * @param {String} name
		 */
		throw new CKEditorError(
			'batch-register-taken: This batch method name is already taken.',
			{ name: name } );
	}

	Batch.prototype[ name ] = creator;
}
