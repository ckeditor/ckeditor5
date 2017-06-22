/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/delta
 */

import clone from '@ckeditor/ckeditor5-utils/src/lib/lodash/clone';
import DeltaFactory from './deltafactory';

/**
 * Base class for all deltas.
 *
 * Delta is a single, from the user action point of view, change in the editable document, like insert, split or
 * rename element. Delta is composed of operations, which are unit changes needed to be done to execute user action.
 *
 * Multiple deltas are grouped into a single {@link module:engine/model/batch~Batch}.
 */
export default class Delta {
	/**
	 * Creates a delta instance.
	 */
	constructor() {
		/**
		 * {@link module:engine/model/batch~Batch} which delta is a part of. This property is null by default and set by the
		 * {@link module:engine/model/batch~Batch#addDelta} method.
		 *
		 * @readonly
		 * @member {module:engine/model/batch~Batch} module:engine/model/delta/delta~Delta#batch
		 */
		this.batch = null;

		/**
		 * Array of operations which compose delta.
		 *
		 * @readonly
		 * @member {module:engine/model/operation/operation~Operation[]} module:engine/model/delta/delta~Delta#operations
		 */
		this.operations = [];
	}

	/**
	 * Returns delta base version which is equal to the base version of the first operation in delta. If there
	 * are no operations in delta, returns `null`.
	 *
	 * @see module:engine/model/document~Document
	 * @type {Number|null}
	 */
	get baseVersion() {
		if ( this.operations.length > 0 ) {
			return this.operations[ 0 ].baseVersion;
		}

		return null;
	}

	/**
	 * @param {Number} baseVersion
	 */
	set baseVersion( baseVersion ) {
		for ( const operation of this.operations ) {
			operation.baseVersion = baseVersion++;
		}
	}

	/**
	 * A class that will be used when creating reversed delta.
	 *
	 * @private
	 * @type {Function}
	 */
	get _reverseDeltaClass() {
		return Delta;
	}

	/**
	 * Delta type.
	 *
	 * @readonly
	 * @member {String} #type
	 */

	/**
	 * Add operation to the delta.
	 *
	 * @param {module:engine/model/operation/operation~Operation} operation Operation instance.
	 */
	addOperation( operation ) {
		operation.delta = this;
		this.operations.push( operation );

		return operation;
	}

	/**
	 * Creates and returns a delta that has the same parameters as this delta.
	 *
	 * @returns {module:engine/model/delta/delta~Delta} Clone of this delta.
	 */
	clone() {
		const delta = new this.constructor();

		for ( const op of this.operations ) {
			delta.addOperation( op.clone() );
		}

		return delta;
	}

	/**
	 * Creates and returns a reverse delta. Reverse delta when executed right after the original delta will bring back
	 * tree model state to the point before the original delta execution. In other words, it reverses changes done
	 * by the original delta.
	 *
	 * Keep in mind that tree model state may change since executing the original delta, so reverse delta may be "outdated".
	 * In that case you will need to {@link module:engine/model/delta/transform~transform} it by all deltas that were executed after
	 * the original delta.
	 *
	 * @returns {module:engine/model/delta/delta~Delta} Reversed delta.
	 */
	getReversed() {
		const delta = new this._reverseDeltaClass();

		for ( const op of this.operations ) {
			delta.addOperation( op.getReversed() );
		}

		delta.operations.reverse();

		for ( let i = 0; i < delta.operations.length; i++ ) {
			delta.operations[ i ].baseVersion = this.operations[ this.operations.length - 1 ].baseVersion + i + 1;
		}

		return delta;
	}

	/**
	 * Custom toJSON method to make deltas serializable.
	 *
	 * @returns {Object} Clone of this delta with added class name.
	 */
	toJSON() {
		const json = clone( this );

		json.__className = this.constructor.className;

		// Remove parent batch to avoid circular dependencies.
		delete json.batch;

		return json;
	}

	/**
	 * Delta class name. Used by {@link #toJSON} method for serialization and
	 * {@link module:engine/model/delta/deltafactory~DeltaFactory.fromJSON} during deserialization.
	 *
	 * @type {String}
	 * @readonly
	 */
	static get className() {
		return 'engine.model.delta.Delta';
	}
}

DeltaFactory.register( Delta );
