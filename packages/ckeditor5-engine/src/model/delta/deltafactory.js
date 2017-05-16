/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/deltafactory
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import OperationFactory from '../operation/operationfactory';

const deserializers = new Map();

/**
 * A factory class for creating operations.
 *
 * Delta is a single, from the user action point of view, change in the editable document, like insert, split or
 * rename element. Delta is composed of operations, which are unit changes needed to be done to execute user action.
 *
 * Multiple deltas are grouped into a single {@link module:engine/model/batch~Batch}.
 */
export default class DeltaFactory {
	/**
	 * Creates InsertDelta from deserialized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json
	 * @param {module:engine/model/document~Document} doc Document on which this delta will be applied.
	 * @returns {module:engine/model/delta/insertdelta~InsertDelta}
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

		const Delta = deserializers.get( json.__className );

		const delta = new Delta();

		for ( const operation of json.operations ) {
			delta.addOperation( OperationFactory.fromJSON( operation, doc ) );
		}

		// Rewrite all other properties.
		for ( const prop in json ) {
			if ( prop != '__className' && delta[ prop ] === undefined ) {
				delta[ prop ] = json[ prop ];
			}
		}

		return delta;
	}

	/**
	 * Registers a class for delta factory.
	 *
	 * @param {Function} Delta A delta class to register.
	 */
	static register( Delta ) {
		deserializers.set( Delta.className, Delta );
	}
}
