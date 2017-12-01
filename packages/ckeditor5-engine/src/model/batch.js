/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/batch
 */

/**
 * `Batch` instance groups model changes ({@link module:engine/model/delta/delta~Delta deltas}). All deltas grouped in a single `Batch`
 * can be reverted together, so you can think about `Batch` as of a single undo step. If you want to extend given undo step you
 * can call another method on the same `Batch` object. If you want to create a separate undo step you can create a new `Batch`.
 *
 * For example to create two separate undo steps you can call:
 *
 *		doc.batch().insert( 'foo', firstPosition );
 *		doc.batch().insert( 'bar', secondPosition );
 *
 * To create a single undo step:
 *
 *		const batch = doc.batch();
 *		batch.insert( 'foo', firstPosition );
 *		batch.insert( 'bar', secondPosition );
 *
 */
export default class Batch {
	/**
	 * Creates `Batch` instance. Not recommended to use directly, use {@link module:engine/model~model#change} or
	 * {@link module:engine/model~model#enqueueChanges} instead.
	 *
	 * @param {'transparent'|'default'} [type='default'] Type of the batch.
	 */
	constructor( type = 'default' ) {
		/**
		 * Array of deltas which compose this batch.
		 *
		 * @readonly
		 * @type {Array.<module:engine/model/delta/delta~Delta>}
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
		 * @type {'transparent'|'default'}
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
	 * @param {module:engine/model/delta/delta~Delta} delta Delta to add.
	 * @return {module:engine/model/delta/delta~Delta} Added delta.
	 */
	addDelta( delta ) {
		delta.batch = this;
		this.deltas.push( delta );

		return delta;
	}

	/**
	 * Gets an iterable collection of operations.
	 *
	 * @returns {Iterable.<module:engine/model/operation/operation~Operation>}
	 */
	* getOperations() {
		for ( const delta of this.deltas ) {
			yield* delta.operations;
		}
	}
}
