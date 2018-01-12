/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/batch
 */

/**
 * `Batch` instance groups model changes ({@link module:engine/model/delta/delta~Delta deltas}). All deltas grouped in a single `Batch`
 * can be reverted together, so you can think about `Batch` as of a single undo step. If you want to extend given undo step you
 * can add more changes to the batch using {@link module:engine/model/model~Model#enqueueChange}:
 *
 *		model.enqueueChange( batch, writer => {
 *			writer.insertText( 'foo', paragraph, 'end' );
 *		} );
 *
 * @see module:engine/model/model~Model#enqueueChange
 * @see module:engine/model/model~Model#change
 */
export default class Batch {
	/**
	 * Creates `Batch` instance.
	 *
	 * @see module:engine/model/model~Model#enqueueChange
	 * @see module:engine/model/model~Model#change
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
