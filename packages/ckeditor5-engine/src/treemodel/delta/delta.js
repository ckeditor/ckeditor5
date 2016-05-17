/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import clone from '../../../utils/lib/lodash/clone.js';

import CKEditorError from '../../../utils/ckeditorerror.js';

import AttributeOperation from '../operation/attributeoperation.js';
import InsertOperation from '../operation/insertoperation.js';
import MoveOperation from '../operation/moveoperation.js';
import NoOperation from '../operation/nooperation.js';
import Operation from '../operation/operation.js';
import ReinsertOperation from '../operation/reinsertoperation.js';
import RemoveOperation from '../operation/removeoperation.js';
import RootAttributeOperation from '../operation/rootattributeoperation.js';

/**
 * Base class for all deltas.
 *
 * Delta is a single, from the user action point of view, change in the editable document, like insert, split or
 * rename element. Delta is composed of operations, which are unit changes needed to be done to execute user action.
 *
 * Multiple deltas are grouped into a single {@link engine.treeModel.Batch}.
 *
 * @memberOf engine.treeModel.delta
 */
export default class Delta {
	/**
	 * Creates a delta instance.
	 */
	constructor() {
		/**
		 * {@link engine.treeModel.Batch} which delta is a part of. This property is null by default and set by the
		 * {@link engine.treeModel.Batch#addDelta} method.
		 *
		 * @readonly
		 * @member {engine.treeModel.Batch} engine.treeModel.delta.Delta#batch
		 */
		this.batch = null;

		/**
		 * Array of operations which compose delta.
		 *
		 * @readonly
		 * @member {engine.treeModel.operation.Operation[]} engine.treeModel.delta.Delta#operations
		 */
		this.operations = [];
	}

	/**
	 * Returns delta base version which is equal to the base version of the first operation in delta. If there
	 * are no operations in delta, returns `null`.
	 *
	 * @see engine.treeModel.Document
	 * @type {Number|null}
	 */
	get baseVersion() {
		if ( this.operations.length > 0 ) {
			return this.operations[ 0 ].baseVersion;
		}

		return null;
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
	 * Add operation to the delta.
	 *
	 * @param {engine.treeModel.operation.Operation} operation Operation instance.
	 */
	addOperation( operation ) {
		operation.delta = this;
		this.operations.push( operation );

		return operation;
	}

	/**
	 * Creates and returns a delta that has the same parameters as this delta.
	 *
	 * @returns {engine.treeModel.delta.Delta} Clone of this delta.
	 */
	clone() {
		let delta = new this.constructor();

		for ( let op of this.operations ) {
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
	 * In that case you will need to {@link engine.treeModel.delta.transform} it by all deltas that were executed after
	 * the original delta.
	 *
	 * @returns {engine.treeModel.delta.Delta} Reversed delta.
	 */
	getReversed() {
		let delta = new this._reverseDeltaClass();

		for ( let op of this.operations ) {
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
		let json = clone( this );

		json.__className = this.constructor.className;

		json.batch = null;

		return json;
	}

	/**
	 * Delta class name. Used by {@link engine.treeModel.delta.Delta#toJSON} method for serialization and
	 * {@link engine.treeModel.delta.Delta.fromJSON} during deserialization.
	 *
	 * @type {String}
	 */
	static get className() {
		return 'engine.treeModel.delta.Delta';
	}

	/**
	 * Delta priority. Used in {@link engine.treeModel.delta.transform delta transformations}. Delta with the higher
	 * priority will be treated as more important when resolving transformation conflicts. If deltas have same
	 * priority, other factors will be used to determine which delta is more important.
	 *
	 * @private
	 * @type {Number}
	 */
	static get _priority() {
		return 0;
	}

	/**
	 * Creates InsertDelta from deserialized object, ie. from parsed JSON string
	 *
	 * @param {Object} json
	 * @param {engine.treeModel.Document} doc Document on which this delta will be applied.
	 * @returns {engine.treeModel.delta.InsertDelta}
	 */
	static fromJSON( json, doc ) {
		if ( !deserializers.has( json.__className ) ) {
			/**
			 * This delta has no defined deserializer.
			 *
			 * @error delta-fromjson-no-deserializer
			 * @param {String} name
			 */
			throw new CKEditorError(
				'delta-fromjson-no-deserializer: This delta has no defined deserializer',
				{ name: json.__className }
			);
		}

		let Constructor = deserializers.get( json.__className );

		let delta = new Constructor();

		if ( json.operations.length ) {
			json.operations.forEach( ( operation ) => delta.addOperation( operations[ operation.__className ].fromJSON( operation, doc ) ) );
		}

		return delta;
	}
}

const operations = {};
operations[ AttributeOperation.className ] = AttributeOperation;
operations[ InsertOperation.className ] = InsertOperation;
operations[ MoveOperation.className ] = MoveOperation;
operations[ NoOperation.className ] = NoOperation;
operations[ Operation.className ] = Operation;
operations[ ReinsertOperation.className ] = ReinsertOperation;
operations[ RemoveOperation.className ] = RemoveOperation;
operations[ RootAttributeOperation.className ] = RootAttributeOperation;

const deserializers = new Map();

export function registerDeserializer( className, constructor ) {
	if ( deserializers.has( className ) ) {
		/**
		 * This delta name is already defined.
		 *
		 * @error delta-register-deserializer-defined
		 * @param {String} name
		 */
		throw new CKEditorError(
			'delta-register-deserializer-defined: This delta name is already defined.',
			{ name: className } );
	}

	deserializers.set( className, constructor );
}
