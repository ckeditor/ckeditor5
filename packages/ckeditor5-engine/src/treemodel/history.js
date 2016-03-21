/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// Load all basic deltas and transformations, they register themselves, but they need to be imported somewhere.
import deltas from './delta/basic-deltas.js';
import transformations from './delta/basic-transformations.js';
/*jshint unused: false*/

import transform from './delta/transform.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * History keeps the track of all the deltas applied to the {@link core.treeModel.Document document} and provides
 * utility tools to operate on the history. Most of times history is needed to transform a delta that has wrong
 * {@link core.treeModel.delta.Delta#baseVersion} to a state where it can be applied to the document.
 *
 * @memberOf core.treeModel
 */
export default class History {
	/**
	 * Creates an empty History instance.
	 */
	constructor() {
		/**
		 * Deltas added to the history.
		 *
		 * @private
		 * @member {Array.<core.treeModel.delta.Delta>} core.treeModel.History#_deltas
		 */
		this._deltas = [];

		/**
		 * Helper structure that maps added delta's base version to the index in {@link core.treeModel.History#_deltas}
		 * at which the delta was added.
		 *
		 * @private
		 * @member {Map} core.treeModel.History#_historyPoints
		 */
		this._historyPoints = new Map();
	}

	/**
	 * Gets the number of base version which an up-to-date operation should have.
	 *
	 * @private
	 * @type {Number}
	 */
	get _nextHistoryPoint() {
		const lastDelta = this._deltas[ this._deltas.length - 1 ];

		return lastDelta.baseVersion + lastDelta.operations.length;
	}

	/**
	 * Adds an operation to the history.
	 *
	 * @param {core.treeModel.operation.Operation} operation Operation to add.
	 */
	addOperation( operation ) {
		const delta = operation.delta;

		// History cares about deltas not singular operations.
		// Operations from a delta are added one by one, from first to last.
		// Operations from one delta cannot be mixed with operations from other deltas.
		// This all leads us to the conclusion that we could just save deltas history.
		// What is more, we need to check only the last position in history to check if delta is already in the history.
		if ( delta && this._deltas[ this._deltas.length - 1 ] !== delta ) {
			const index = this._deltas.length;

			this._deltas[ index ] = delta;
			this._historyPoints.set( delta.baseVersion, index );
		}
	}

	/**
	 * Transforms out-dated delta by all deltas that were added to the history since the given delta's base version. In other
	 * words, it makes the delta up-to-date with the history. The transformed delta(s) is (are) ready to be applied
	 * to the {@link core.treeModel.Document document}.
	 *
	 * @param {core.treeModel.delta.Delta} delta Delta to update.
	 * @returns {Array.<core.treeModel.delta.Delta>} Result of transformation which is an array containing one or more deltas.
	 */
	getTransformedDelta( delta ) {
		if ( delta.baseVersion === this._nextHistoryPoint ) {
			return [ delta ];
		}

		let index = this._historyPoints.get( delta.baseVersion );

		if ( index === undefined ) {
			throw new CKEditorError( 'history-wrong-version: Cannot retrieve point in history that is a base for given delta.' );
		}

		let transformed = [ delta ];

		while ( index < this._deltas.length ) {
			const historyDelta = this._deltas[ index ];
			let allResults = [];

			for ( let deltaToTransform of transformed ) {
				const transformedDelta = History._transform( deltaToTransform, historyDelta );
				allResults = allResults.concat( transformedDelta );
			}

			transformed = allResults;
			index++;
		}

		return transformed;
	}

	/**
	 * Transforms given delta by another given delta.
	 *
	 * @private
	 * @param {core.treeModel.delta.Delta} toTransform Delta to be transformed.
	 * @param {core.treeModel.delta.Delta} transformBy Delta to transform by.
	 */
	static _transform( toTransform, transformBy ) {
		return transform( toTransform, transformBy, false );
	}
}
