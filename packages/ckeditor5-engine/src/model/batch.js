/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/batch
 */

/**
 * A batch instance groups model changes ({@link module:engine/model/delta/delta~Delta deltas}). All deltas grouped in a single batch
 * can be reverted together, so you can think about a batch as of a single undo step. If you want to extend a given undo step, you
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
	 * Creates a batch instance.
	 *
	 * @see module:engine/model/model~Model#enqueueChange
	 * @see module:engine/model/model~Model#change
	 * @param {'transparent'|'default'} [type='default'] The type of the batch.
	 */
	constructor( type = 'default' ) {
		/**
		 * An array of deltas that compose this batch.
		 *
		 * @readonly
		 * @type {Array.<module:engine/model/delta/delta~Delta>}
		 */
		this.deltas = [];

		/**
		 * The type of the batch.
		 *
		 * It can be one of the following values:
		 * * `'default'` &ndash; All "normal" batches. This is the most commonly used type.
		 * * `'transparent'` &ndash; A batch that should be ignored by other features, i.e. an initial batch or collaborative editing
		 * changes.
		 *
		 * @readonly
		 * @type {'transparent'|'default'}
		 */
		this.type = type;
	}

	/**
	 * Returns the base version of this batch, which is equal to the base version of the first delta (which has the base version set)
	 * in the batch. If there are no deltas in the batch or neither delta has the base version set, it returns `null`.
	 *
	 * @readonly
	 * @type {Number|null}
	 */
	get baseVersion() {
		for ( const delta of this.deltas ) {
			if ( delta.baseVersion !== null ) {
				return delta.baseVersion;
			}
		}

		return null;
	}

	/**
	 * Adds a delta to the batch instance. All modification methods (insert, remove, split, etc.) use this method
	 * to add created deltas.
	 *
	 * @param {module:engine/model/delta/delta~Delta} delta A delta to add.
	 * @return {module:engine/model/delta/delta~Delta} An added delta.
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
