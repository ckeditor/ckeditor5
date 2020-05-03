/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/batch
 */

/**
 * A batch instance groups model changes ({@link module:engine/model/operation/operation~Operation operations}). All operations
 * grouped in a single batch can be reverted together, so you can also think about a batch as of a single undo step. If you want
 * to extend a given undo step, you can add more changes to the batch using {@link module:engine/model/model~Model#enqueueChange}:
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
		 * An array of operations that compose this batch.
		 *
		 * @readonly
		 * @type {Array.<module:engine/model/operation/operation~Operation>}
		 */
		this.operations = [];

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
	 * Returns the base version of this batch, which is equal to the base version of the first operation in the batch.
	 * If there are no operations in the batch or neither operation has the base version set, it returns `null`.
	 *
	 * @readonly
	 * @type {Number|null}
	 */
	get baseVersion() {
		for ( const op of this.operations ) {
			if ( op.baseVersion !== null ) {
				return op.baseVersion;
			}
		}

		return null;
	}

	/**
	 * Adds an operation to the batch instance.
	 *
	 * @param {module:engine/model/operation/operation~Operation} operation An operation to add.
	 * @returns {module:engine/model/operation/operation~Operation} The added operation.
	 */
	addOperation( operation ) {
		operation.batch = this;
		this.operations.push( operation );

		return operation;
	}
}
