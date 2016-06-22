/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import History from './history.js';

/**
 * `CompressedHistory` keeps deltas applied to the {@link engine.model.Document document} in their transformed state. Deltas
 * stored in `CompressedHistory` might get updated, split into more deltas or removed as other deltas are applied to the document.
 * Modifying the original deltas history results in a compressed version of history and makes some scripts faster and easier to implement.
 *
 * **Note:** deltas kept in `CompressedHistory` should be used only to transform deltas. Do not use `CompressedHistory` to get original
 * delta (especially basing on its {@link engine.model.delta.Delta#baseVersion baseVersion}). Do not trust base versions of deltas
 * returned by `CompressedHistory`. After transforming your delta by deltas from `CompressedHistory`, fix it's base version accordingly.
 *
 * @see engine.model.History
 * @memberOf engine.model
 */
export default class CompressedHistory extends History {
	constructor() {
		super();

		/**
		 * Stores base versions of deltas which has been marked as inactive.
		 * @private
		 * @member {Array.<Number>} engine.model.CompressedHistory#_inactiveBaseVersions
		 */
		this._inactiveBaseVersions = [];
	}

	/**
	 * Returns one or more deltas from compressed history that bases on given `baseVersion`. Most often it will be just
	 * one delta, but if that delta got updated by multiple deltas, all of those updated deltas will be returned.
	 *
	 * @see engine.model.CompressedHistory#updateDelta
	 * @param {Number} baseVersion Base version of the delta to retrieve.
	 * @returns {Array.<engine.model.delta.Delta>|null} Delta with given base version or null if no such delta is in history.
	 */
	getDelta( baseVersion ) {
		let index = this._historyPoints.get( baseVersion );

		if ( index === undefined ) {
			return null;
		}

		const deltas = [];

		for ( index; index < this._deltas.length; index++ ) {
			const delta = this._deltas[ index ];

			if ( delta.baseVersion != baseVersion ) {
				break;
			}

			deltas.push( delta );
		}

		return deltas.length === 0 ? null : deltas;
	}

	/**
	 * Marks delta as reversed/reversing delta and makes it "inactive". This happens i.e., when a delta is undone by
	 * another delta. Both undone delta and undoing delta should be marked as inactive nad have no impact on transforming
	 * other deltas.
	 *
	 * **Note:** using this method does not change the state of {@link engine.model.Document model}. It just affects
	 * the state of `CompressedHistory`.
	 *
	 * **Note:** when some deltas are marked as "inactive", deltas between them should probably get updated. See
	 * {@link engine.model.CompressedHistory#updateDelta}.
	 *
	 * **Note:** if delta with `baseVersion` got updated by multiple deltas, all updated deltas will be marked as
	 * "inactive".
	 *
	 * Due to how nodes removing works, we can't just removed those deltas from history. Here is explanation:
	 * since a delta got undone, both it and it's undoing counterpart should not have any impact on transformations of other
	 * deltas. State of tree structure should look like "nothing happened". Unfortunately, this is not true for inserting nodes,
	 * because they are not removed from the tree structure. Instead, removing nodes actually moves them to
	 * {@link engine.model.Document#graveyard graveyard root}. When {@link engine.model.delta.InsertDelta InsertDelta} is
	 * reversed (by {@link engine.model.delta.RemoveDelta RemoveDelta} the state of the tree is not like before insert delta
	 * happened - there is an additional node in graveyard root. This means that it is incorrect to just remove inactive deltas from
	 * history. Instead, for graveyard-related operations fake fix operations are created. Non-graveyard-related operations are removed.
	 *
	 * @param {Number} baseVersion Base version of a delta to be marked as reversed/reversing delta.
	 */
	removeDelta( baseVersion ) {
		this.updateDelta( baseVersion, [] );
		this._inactiveBaseVersions.push( baseVersion );
	}

	/**
	 * Substitutes delta from compressed history by one or more given deltas.
	 *
	 * **Note:** if delta with `baseVersion` was already updated by multiple deltas, all updated deltas will be removed
	 * and new deltas will be inserted at their position.
	 *
	 * **Note:** delta marked as reversed won't get updated.
	 *
	 * @param {Number} baseVersion Base version of a delta to update.
	 * @param {Iterable.<engine.model.delta.Delta>} updatedDeltas Deltas to be inserted in place of updated delta.
	 */
	updateDelta( baseVersion, updatedDeltas ) {
		if ( this._inactiveBaseVersions.indexOf( baseVersion ) != -1 ) {
			return;
		}

		const deltas = this.getDelta( baseVersion );

		// If there are no deltas, stop executing function as there is nothing to mark.
		if ( deltas === null ) {
			return;
		}

		// Make sure that every updated delta has correct `baseVersion`.
		// This is crucial for algorithms in `CompressedHistory` and algorithms using `CompressedHistory`.
		for ( let delta of updatedDeltas ) {
			delta.baseVersion = baseVersion;
		}

		// Put updated deltas in place of old deltas.
		this._deltas.splice( this._getIndex( baseVersion ), deltas.length, ...updatedDeltas );

		// Update history points.
		this._updateHistoryPointsAfter( baseVersion, updatedDeltas.length - deltas.length );
	}

	/**
	 * Returns base versions of deltas which has been marked as reversed, in given base versions range.
	 *
	 * @param {Number} from Start of base versions range to check.
	 * @param {Number} to End of base versions range to check.
	 * @returns {Iterator.<Number>} Base versions of deltas marked as reversed.
	 */
	*getInactiveBaseVersions( from = 0, to = Number.POSITIVE_INFINITY ) {
		for ( let baseVersion of this._inactiveBaseVersions ) {
			if ( baseVersion >= from && baseVersion < to ) {
				yield baseVersion;
			}
		}
	}

	/**
	 * Updates {@link engine.model.History#_historyPoints} structure.
	 *
	 * @param {Number} baseVersion Base version of delta after which history points should be updated.
	 * @param {Number} changeBy By how much change history points. Can be a negative value.
	 * @private
	 */
	_updateHistoryPointsAfter( baseVersion, changeBy ) {
		for ( let key of this._historyPoints.keys() ) {
			if ( key > baseVersion ) {
				this._historyPoints.set( key, this._historyPoints.get( key ) + changeBy );
			}
		}
	}
}
