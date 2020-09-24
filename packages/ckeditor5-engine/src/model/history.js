/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/history
 */

/**
 * `History` keeps the track of all the operations applied to the {@link module:engine/model/document~Document document}.
 */
export default class History {
	/**
	 * Creates an empty History instance.
	 */
	constructor() {
		/**
		 * Operations added to the history.
		 *
		 * @protected
		 * @member {Array.<module:engine/model/operation/operation~Operation>} module:engine/model/history~History#_operations
		 */
		this._operations = [];

		/**
		 * Holds an information which {@link module:engine/model/operation/operation~Operation operation} undoes which
		 * {@link module:engine/model/operation/operation~Operation operation}.
		 *
		 * Keys of the map are "undoing operations", that is operations that undone some other operations. For each key, the
		 * value is an operation that has been undone by the "undoing operation".
		 *
		 * @private
		 * @member {Map} module:engine/model/history~History#_undoPairs
		 */
		this._undoPairs = new Map();

		/**
		 * Holds all undone operations.
		 *
		 * @private
		 * @member {Set.<module:engine/model/operation/operation~Operation>} module:engine/model/history~History#_undoneOperations
		 */
		this._undoneOperations = new Set();
	}

	/**
	 * Adds an operation to the history.
	 *
	 * @param {module:engine/model/operation/operation~Operation} operation Operation to add.
	 */
	addOperation( operation ) {
		if ( this._operations.includes( operation ) ) {
			return;
		}

		this._operations.push( operation );
	}

	/**
	 * Returns operations added to the history.
	 *
	 * @param {Number} [from=Number.NEGATIVE_INFINITY] Base version from which operations should be returned (inclusive).
	 * Defaults to `Number.NEGATIVE_INFINITY`, which means that operations from the first one will be returned.
	 * @param {Number} [to=Number.POSITIVE_INFINITY] Base version up to which operations should be returned (exclusive).
	 * Defaults to `Number.POSITIVE_INFINITY` which means that operations up to the last one will be returned.
	 * @returns {Array.<module:engine/model/operation/operation~Operation>} Operations added to the history.
	 */
	getOperations( from = Number.NEGATIVE_INFINITY, to = Number.POSITIVE_INFINITY ) {
		const operations = [];

		for ( const operation of this._operations ) {
			if ( operation.baseVersion >= from && operation.baseVersion < to ) {
				operations.push( operation );
			}
		}

		return operations;
	}

	/**
	 * Returns operation from the history that bases on given `baseVersion`.
	 *
	 * @param {Number} baseVersion Base version of the operation to get.
	 * @returns {module:engine/model/operation/operation~Operation|undefined} Operation with given base version or `undefined` if
	 * there is no such operation in history.
	 */
	getOperation( baseVersion ) {
		for ( const operation of this._operations ) {
			if ( operation.baseVersion == baseVersion ) {
				return operation;
			}
		}
	}

	/**
	 * Marks in history that one operation is an operation that is undoing the other operation. By marking operation this way,
	 * history is keeping more context information about operations, which helps in operational transformation.
	 *
	 * @param {module:engine/model/operation/operation~Operation} undoneOperation Operation which is undone by `undoingOperation`.
	 * @param {module:engine/model/operation/operation~Operation} undoingOperation Operation which undoes `undoneOperation`.
	 */
	setOperationAsUndone( undoneOperation, undoingOperation ) {
		this._undoPairs.set( undoingOperation, undoneOperation );
		this._undoneOperations.add( undoneOperation );
	}

	/**
	 * Checks whether given `operation` is undoing any other operation.
	 *
	 * @param {module:engine/model/operation/operation~Operation} operation Operation to check.
	 * @returns {Boolean} `true` if given `operation` is undoing any other operation, `false` otherwise.
	 */
	isUndoingOperation( operation ) {
		return this._undoPairs.has( operation );
	}

	/**
	 * Checks whether given `operation` has been undone by any other operation.
	 *
	 * @param {module:engine/model/operation/operation~Operation} operation Operation to check.
	 * @returns {Boolean} `true` if given `operation` has been undone any other operation, `false` otherwise.
	 */
	isUndoneOperation( operation ) {
		return this._undoneOperations.has( operation );
	}

	/**
	 * For given `undoingOperation`, returns the operation which has been undone by it.
	 *
	 * @param {module:engine/model/operation/operation~Operation} undoingOperation
	 * @returns {module:engine/model/operation/operation~Operation|undefined} Operation that has been undone by given
	 * `undoingOperation` or `undefined` if given `undoingOperation` is not undoing any other operation.
	 */
	getUndoneOperation( undoingOperation ) {
		return this._undoPairs.get( undoingOperation );
	}
}
