/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * `History` keeps the track of all the deltas applied to the {@link engine.model.Document document}. `History` can be
 * seen as "add-only" structure. You can read and add deltas, but can't modify them. Use this version of history to
 * retrieve applied deltas as they were, in the original form.
 *
 * @see engine.model.CompressedHistory
 * @memberOf engine.model
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
		 * @member {Array.<engine.model.delta.Delta>} engine.model.History#_deltas
		 */
		this._deltas = [];

		/**
		 * Helper structure that maps added delta's base version to the index in {@link engine.model.History#_deltas}
		 * at which the delta was added.
		 *
		 * @protected
		 * @member {Map} engine.model.History#_historyPoints
		 */
		this._historyPoints = new Map();
	}

	/**
	 * Adds delta to the history.
	 *
	 * @param {engine.model.delta.Delta} delta Delta to add.
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
	 * @param {Number} [from=0] Base version from which deltas should be returned (inclusive). Defaults to `0` which means
	 * that deltas from the first one will be returned.
	 * @param {Number} [to=Number.POSITIVE_INFINITY] Base version up to which deltas should be returned (exclusive).
	 * Defaults to `Number.POSITIVE_INFINITY` which means that deltas up to the last one will be returned.
	 * @returns {Iterator.<engine.model.delta.Delta>} Deltas added to the history.
	 */
	*getDeltas( from = 0, to = Number.POSITIVE_INFINITY ) {
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
	 * Returns a delta from the history that has given {@link engine.model.delta.Delta#baseVersion}.
	 *
	 * @param {Number} baseVersion Base version of the delta to retrieve.
	 * @returns {engine.model.delta.Delta|null} Delta with given base version or null if no such delta is in history.
	 */
	getDelta( baseVersion ) {
		let index = this._historyPoints.get( baseVersion );

		return this._deltas[ index ] || null;
	}

	/**
	 * Gets an index in {@link engine.model.History#_deltas} where delta with given `baseVersion` is added.
	 *
	 * @private
	 * @param {Number} baseVersion Base version of delta.
	 */
	_getIndex( baseVersion ) {
		let index = this._historyPoints.get( baseVersion );

		// Base version not found - it is either too high or too low, or is in the middle of delta.
		if ( index === undefined ) {
			const lastDelta = this._deltas[ this._deltas.length - 1 ];
			const nextBaseVersion = lastDelta.baseVersion + lastDelta.operations.length;

			if ( baseVersion < 0 || baseVersion >= nextBaseVersion ) {
				// Base version is too high or too low - it's acceptable situation.
				// Return -1 because `baseVersion` was correct.
				return -1;
			}

			/**
			 * Given base version points to the middle of a delta.
			 *
			 * @error history-wrong-version
			 */
			throw new CKEditorError( 'history-wrong-version: Given base version points to the middle of a delta.' );
		}

		return index;
	}
}
