/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/history
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * `History` keeps the track of all the deltas applied to the {@link module:engine/model/document~Document document}.
 */
export default class History {
	/**
	 * Creates an empty History instance.
	 */
	constructor() {
		/**
		 * Deltas added to the history.
		 *
		 * @protected
		 * @member {Array.<module:engine/model/delta/delta~Delta>} module:engine/model/history~History#_deltas
		 */
		this._deltas = [];

		/**
		 * Helper structure that maps added delta's base version to the index in {@link module:engine/model/history~History#_deltas}
		 * at which the delta was added.
		 *
		 * @protected
		 * @member {Map} module:engine/model/history~History#_historyPoints
		 */
		this._historyPoints = new Map();

		/**
		 * Holds an information which {@link module:engine/model/delta/delta~Delta delta} undoes which
		 * {@link module:engine/model/delta/delta~Delta delta}.
		 *
		 * Keys of the map are "undoing deltas", that is deltas that undone some other deltas. For each key, the
		 * value is a delta that has been undone by the "undoing delta".
		 *
		 * @private
		 * @member {Map} module:engine/model/history~History#_undoPairs
		 */
		this._undoPairs = new Map();

		/**
		 * Holds all undone deltas.
		 *
		 * @private
		 * @member {Set.<module:engine/model/delta/delta~Delta>} module:engine/model/history~History#_undoneDeltas
		 */
		this._undoneDeltas = new Set();
	}

	/**
	 * Adds delta to the history.
	 *
	 * @param {module:engine/model/delta/delta~Delta} delta Delta to add.
	 */
	addDelta( delta ) {
		if ( delta.operations.length > 0 && !this._historyPoints.has( delta.baseVersion ) ) {
			const index = this._deltas.length;

			this._deltas[ index ] = delta;
			this._historyPoints.set( delta.baseVersion, index );
		}
	}

	/**
	 * Returns deltas added to the history.
	 *
	 * @param {Number} [from=0] Base version from which deltas should be returned (inclusive). Defaults to `0`, which means
	 * that deltas from the first one will be returned.
	 * @param {Number} [to=Number.POSITIVE_INFINITY] Base version up to which deltas should be returned (exclusive).
	 * Defaults to `Number.POSITIVE_INFINITY` which means that deltas up to the last one will be returned.
	 * @returns {Iterator.<module:engine/model/delta/delta~Delta>} Deltas added to the history from given base versions range.
	 */
	* getDeltas( from = 0, to = Number.POSITIVE_INFINITY ) {
		// No deltas added, nothing to yield.
		if ( this._deltas.length === 0 ) {
			return;
		}

		// Will throw if base version is incorrect.
		let fromIndex = this._getIndex( from );

		// Base version is too low or too high and is not found in history.
		if ( fromIndex == -1 ) {
			return;
		}

		// We have correct `fromIndex` so let's iterate starting from it.
		while ( fromIndex < this._deltas.length ) {
			const delta = this._deltas[ fromIndex++ ];

			if ( delta.baseVersion >= to ) {
				break;
			}

			yield delta;
		}
	}

	/**
	 * Returns delta from history that bases on given `baseVersion`.
	 *
	 * @param {Number} baseVersion Base version of the delta to get.
	 * @returns {module:engine/model/delta/delta~Delta|null} Delta with given base version or `null` if there is no such delta in history.
	 */
	getDelta( baseVersion ) {
		const index = this._historyPoints.get( baseVersion );

		return index === undefined ? null : this._deltas[ index ];
	}

	/**
	 * Marks in history that one delta is a delta that is undoing the other delta. By marking deltas this way,
	 * history is keeping more context information about deltas which helps in operational transformation.
	 *
	 * @param {module:engine/model/delta/delta~Delta} undoneDelta Delta which is undone by `undoingDelta`.
	 * @param {module:engine/model/delta/delta~Delta} undoingDelta Delta which undoes `undoneDelta`.
	 */
	setDeltaAsUndone( undoneDelta, undoingDelta ) {
		this._undoPairs.set( undoingDelta, undoneDelta );
		this._undoneDeltas.add( undoneDelta );
	}

	/**
	 * Checks whether given `delta` is undoing by any other delta.
	 *
	 * @param {module:engine/model/delta/delta~Delta} delta Delta to check.
	 * @returns {Boolean} `true` if given `delta` is undoing any other delta, `false` otherwise.
	 */
	isUndoingDelta( delta ) {
		return this._undoPairs.has( delta );
	}

	/**
	 * Checks whether given `delta` has been undone by any other delta.
	 *
	 * @param {module:engine/model/delta/delta~Delta} delta Delta to check.
	 * @returns {Boolean} `true` if given `delta` has been undone any other delta, `false` otherwise.
	 */
	isUndoneDelta( delta ) {
		return this._undoneDeltas.has( delta );
	}

	/**
	 * For given `undoingDelta`, returns the delta which has been undone by it.
	 *
	 * @param {module:engine/model/delta/delta~Delta} undoingDelta
	 * @returns {module:engine/model/delta/delta~Delta|undefined} Delta that has been undone by given `undoingDelta` or `undefined`
	 * if given `undoingDelta` is not undoing any other delta.
	 */
	getUndoneDelta( undoingDelta ) {
		return this._undoPairs.get( undoingDelta );
	}

	/**
	 * Gets an index in {@link module:engine/model/history~History#_deltas} where delta with given `baseVersion` is added.
	 *
	 * @private
	 * @param {Number} baseVersion Base version of delta.
	 */
	_getIndex( baseVersion ) {
		const index = this._historyPoints.get( baseVersion );

		// Base version not found - it is either too high or too low, or is in the middle of delta.
		if ( index === undefined ) {
			const lastDelta = this._deltas[ this._deltas.length - 1 ];
			const nextBaseVersion = lastDelta.baseVersion + lastDelta.operations.length;

			if ( baseVersion < 0 || baseVersion >= nextBaseVersion ) {
				// Base version is too high or too low - it's acceptable situation.
				return -1;
			}

			/**
			 * Given base version points to the middle of a delta.
			 *
			 * @error history-wrong-version
			 */
			throw new CKEditorError( 'model-history-wrong-version: Given base version points to the middle of a delta.' );
		}

		return index;
	}
}
