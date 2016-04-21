/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import count from '../utils/count.js';

/**
 * Change buffer allows to group atomic changes (like characters that have been typed) into
 * {@link engine.treeModel.batch.Batch batches}.
 *
 * Batches represent single undo steps, hence changes added to one single batch are undone together.
 *
 * The buffer has a configurable limit of atomic changes that it can accomodate. After the limit was
 * exceeded (see {@link typing.ChangeBuffer#input}), a new batch is created in {@link typing.ChangeBuffer#batch}.
 *
 * To use the change buffer you need to let it know about number of changes that has been added to the batch:
 *
 *		const buffer = new ChangeBuffer( document, LIMIT );
 *
 *		// Later on in your feature:
 *		buffer.batch.insert( pos, insertedCharacters );
 *		buffer.input( insertedCharacters.length );
 *
 * @memberOf typing
 */
export default class ChangeBuffer {
	/**
	 * Creates a new instance of the ChangeBuffer.
	 *
	 * @param {engine.treeModel.Document} document
	 * @param {Number} limit Maximum number of atomic changes which can be contained in one batch.
	 */
	constructor( doc, limit ) {
		/**
		 * Instance of the document.
		 *
		 * @readonly
		 * @property {engine.treeModel.Document} typing.ChangeBuffer#document
		 */
		this.document = doc;

		/**
		 * Number of atomic changes in the buffer. Once it exceeds the {@link typing.ChangeBuffer#limit},
		 * {@link typing.ChangeBuffer#batch batch} is set to a new batch.
		 *
		 * @readonly
		 * @property {Number} typing.ChangeBuffer#size
		 */
		this.size = 0;

		/**
		 * Maximum number of atomic changes which can be contained in one batch.
		 *
		 * @readonly
		 * @property {Number} typing.ChangeBuffer#limit
		 */
		this.limit = limit;

		this._changeCallback = ( evt, type, changes, batch ) => this._onBatch( batch );
		doc.on( 'change', this._changeCallback );

		/**
		 * The current batch instance.
		 *
		 * @private
		 * @property typing.ChangeBuffer#_batch
		 */

		/**
		 * The callback to document change event which later needs to be removed.
		 *
		 * @private
		 * @property typing.ChangeBuffer#_changeCallback
		 */
	}

	/**
	 * Current batch to which a feature should add its deltas. Once the {@link typing.ChangeBuffer#size}
	 * reach or exceedes the {@link typing.ChangeBuffer#limit}, then the batch is set to a new instance and size is reset.
	 *
	 * @type {engine.treeModel.batch.Batch}
	 */
	get batch() {
		if ( !this._batch ) {
			this._batch = this.document.batch();
		}

		return this._batch;
	}

	/**
	 * Input number of changes into the buffer. Once the {@link typing.ChangeBuffer#size}
	 * reach or exceedes the {@link typing.ChangeBuffer#limit}, then the batch is set to a new instance and size is reset.
	 *
	 * @param {Number} changeCount Number of atomic changes to input.
	 */
	input( changeCount ) {
		this.size += changeCount;

		if ( this.size >= this.limit ) {
			this._batch = null;
		}
	}

	/**
	 * Destroys the buffer.
	 */
	destroy() {
		this.document.off( 'change', this._changeCallback );
	}

	/**
	 * To be called in order to notify the buffer about batches which appeared in the document.
	 * The method will check whether it is a new batch and in that case the buffer will be flushed.
	 *
	 * The reason why the buffer needs to be flushed whenever a new batch appears is that changes added afterwards
	 * should be added to a new batch. For instance, when a user types, then inserts an image and then types again,
	 * the characters typed after inserting the image should be added to a different batch than the characters typed before.
	 *
	 * @private
	 * @param {engine.treeModel.batch.Batch} batch The batch which appears in the document.
	 */
	_onBatch( batch ) {
		// 1 operation means a newly created batch.
		if ( batch !== this._batch && count( batch.getOperations() ) <= 1 ) {
			this._batch = null;
		}
	}
}
