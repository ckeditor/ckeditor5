/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/attributedelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import NoOperation from '../operation/nooperation';
import Range from '../range';

/**
 * To provide specific OT behavior and better collisions solving, methods to change attributes
 * ({@link module:engine/model/writer~Writer#setAttribute} and {@link module:engine/model/writer~Writer#removeAttribute})
 * use `AttributeDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class AttributeDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'attribute';
	}

	/**
	 * The attribute key that is changed by the delta or `null` if the delta has no operations.
	 *
	 * @readonly
	 * @type {String|null}
	 */
	get key() {
		return this.operations[ 0 ] ? this.operations[ 0 ].key : null;
	}

	/**
	 * The attribute value that is set by the delta or `null` if the delta has no operations.
	 *
	 * @readonly
	 * @type {*|null}
	 */
	get value() {
		return this.operations[ 0 ] ? this.operations[ 0 ].newValue : null;
	}

	/**
	 * The range on which delta operates or `null` if the delta has no operations.
	 *
	 * @readonly
	 * @type {module:engine/model/range~Range|null}
	 */
	get range() {
		// Check if it is cached.
		if ( this._range ) {
			return this._range;
		}

		let start = null;
		let end = null;

		for ( const operation of this.operations ) {
			if ( operation instanceof NoOperation ) {
				continue;
			}

			if ( start === null || start.isAfter( operation.range.start ) ) {
				start = operation.range.start;
			}

			if ( end === null || end.isBefore( operation.range.end ) ) {
				end = operation.range.end;
			}
		}

		if ( start && end ) {
			this._range = new Range( start, end );

			return this._range;
		}

		return null;
	}

	get _reverseDeltaClass() {
		return AttributeDelta;
	}

	/**
	 * @inheritDoc
	 */
	toJSON() {
		const json = super.toJSON();

		delete json._range;

		return json;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.AttributeDelta';
	}
}

DeltaFactory.register( AttributeDelta );
