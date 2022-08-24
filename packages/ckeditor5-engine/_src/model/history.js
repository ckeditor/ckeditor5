/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

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
		 * @private
		 * @readonly
		 * @type {Array.<module:engine/model/operation/operation~Operation>}
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
		 * @type {Set.<module:engine/model/operation/operation~Operation>}
		 */
		this._undoneOperations = new Set();

		/**
		 * A map that allows retrieving the operations fast based on the given base version.
		 *
		 * @private
		 * @type Map.<Number,Number>
		 */
		this._baseVersionToOperationIndex = new Map();

		/**
		 * The history version.
		 *
		 * @private
		 * @type {Number}
		 */
		this._version = 0;

		/**
		 * The gap pairs kept in the <from,to> format.
		 *
		 * Anytime the `history.version` is set to a version larger than `history.version + 1`,
		 * a new <lastHistoryVersion, newHistoryVersion> entry is added to the map.
		 *
		 * @private
		 * @type Map.<number,number>
		 */
		this._gaps = new Map();
	}

	/**
	 * The version of the last operation in the history.
	 *
	 * The history version is incremented automatically when a new operation is added to the history.
	 * Setting the version manually should be done only in rare circumstances when a gap is planned
	 * between history versions. When doing so, a gap will be created and the history will accept adding
	 * an operation with base version equal to the new history version.
	 *
	 * @type {Number}
	 */
	get version() {
		return this._version;
	}

	set version( version ) {
		// Store a gap if there are some operations already in the history and the
		// new version does not increment the latest one.
		if ( this._operations.length && version > this._version + 1 ) {
			this._gaps.set( this._version, version );
		}

		this._version = version;
	}

	/**
	 * The last history operation.
	 *
	 * @readonly
	 * @type {module:engine/model/operation/operation~Operation|undefined}
	 */
	get lastOperation() {
		return this._operations[ this._operations.length - 1 ];
	}

	/**
	 * Adds an operation to the history and increments the history version.
	 *
	 * The operation's base version should be equal to the history version. Otherwise an error is thrown.
	 *
	 * @param {module:engine/model/operation/operation~Operation} operation Operation to add.
	 */
	addOperation( operation ) {
		if ( operation.baseVersion !== this.version ) {
			/**
			 * Only operations with matching versions can be added to the history.
			 *
			 * @error model-document-history-addoperation-incorrect-version
			 * @param {Object} errorData The operation and the current document history version.
			 */
			throw new CKEditorError( 'model-document-history-addoperation-incorrect-version', this, {
				operation,
				historyVersion: this.version
			} );
		}

		this._operations.push( operation );
		this._version++;

		this._baseVersionToOperationIndex.set( operation.baseVersion, this._operations.length - 1 );
	}

	/**
	 * Returns operations from the given range of operation base versions that were added to the history.
	 *
	 * Note that there may be gaps in operations base versions.
	 *
	 * @param {Number} [fromBaseVersion] Base version from which operations should be returned (inclusive).
	 * @param {Number} [toBaseVersion] Base version up to which operations should be returned (exclusive).
     * @returns {Array.<module:engine/model/operation/operation~Operation>} History operations for the given range, in chronological order.
	 */
	getOperations( fromBaseVersion, toBaseVersion = this.version ) {
		// When there is no operation in the history, return an empty array.
		// After that we can be sure that `firstOperation`, `lastOperation` are not nullish.
		if ( !this._operations.length ) {
			return [];
		}

		const firstOperation = this._operations[ 0 ];

		if ( fromBaseVersion === undefined ) {
			fromBaseVersion = firstOperation.baseVersion;
		}

		// Change exclusive `toBaseVersion` to inclusive, so it will refer to the actual index.
		// Thanks to that mapping from base versions to operation indexes are possible.
		let inclusiveTo = toBaseVersion - 1;

		// Check if "from" or "to" point to a gap between versions.
		// If yes, then change the incorrect position to the proper side of the gap.
		// Thanks to it, it will be possible to get index of the operation.
		for ( const [ gapFrom, gapTo ] of this._gaps ) {
			if ( fromBaseVersion > gapFrom && fromBaseVersion < gapTo ) {
				fromBaseVersion = gapTo;
			}

			if ( inclusiveTo > gapFrom && inclusiveTo < gapTo ) {
				inclusiveTo = gapFrom - 1;
			}
		}

		// If the whole range is outside of the operation versions, then return an empty array.
		if ( inclusiveTo < firstOperation.baseVersion || fromBaseVersion > this.lastOperation.baseVersion ) {
			return [];
		}

		let fromIndex = this._baseVersionToOperationIndex.get( fromBaseVersion );

		// If the range starts before the first operation, then use the first operation as the range's start.
		if ( fromIndex === undefined ) {
			fromIndex = 0;
		}

		let toIndex = this._baseVersionToOperationIndex.get( inclusiveTo );

		// If the range ends after the last operation, then use the last operation as the range's end.
		if ( toIndex === undefined ) {
			toIndex = this._operations.length - 1;
		}

		// Return the part of the history operations based on the calculated start index and end index.
		return this._operations.slice(
			fromIndex,

			// The `toIndex` should be included in the returned operations, so add `1`.
			toIndex + 1
		);
	}

	/**
	 * Returns operation from the history that bases on given `baseVersion`.
	 *
	 * @param {Number} baseVersion Base version of the operation to get.
	 * @returns {module:engine/model/operation/operation~Operation|undefined} Operation with given base version or `undefined` if
	 * there is no such operation in history.
	 */
	getOperation( baseVersion ) {
		const operationIndex = this._baseVersionToOperationIndex.get( baseVersion );

		if ( operationIndex === undefined ) {
			return;
		}

		return this._operations[ operationIndex ];
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

	/**
	 * Resets the history of operations.
	 */
	reset() {
		this._version = 0;
		this._undoPairs = new Map();
		this._operations = [];
		this._undoneOperations = new Set();
		this._gaps = new Map();
		this._baseVersionToOperationIndex = new Map();
	}
}
