/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/markeroperation
 */

import Operation from './operation';
import Range from '../range';

/**
 * @extends module:engine/model/operation/operation~Operation
 */
export default class MarkerOperation extends Operation {
	/**
	 * @param {String} name Marker name.
	 * @param {module:engine/model/range~Range} oldRange Marker range before the change.
	 * @param {module:engine/model/range~Range} newRange Marker range after the change.
	 * @param {module:engine/model/markercollection~MarkerCollection} markers Marker collection on which change should be executed.
	 * @param {Number} baseVersion {@link module:engine/model/document~Document#version} on which the operation can be applied.
	 */
	constructor( name, oldRange, newRange, markers, baseVersion ) {
		super( baseVersion );

		/**
		 * Marker name.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.name = name;

		/**
		 * Marker range before the change.
		 *
		 * @readonly
		 * @member {module:engine/model/range~Range}
		 */
		this.oldRange = oldRange ? Range.createFromRange( oldRange ) : null;

		/**
		 * Marker range after the change.
		 *
		 * @readonly
		 * @member {module:engine/model/range~Range}
		 */
		this.newRange = newRange ? Range.createFromRange( newRange ) : null;

		/**
		 * Marker collection on which change should be executed.
		 *
		 * @private
		 * @member {module:engine/model/markercollection~MarkerCollection}
		 */
		this._markers = markers;
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'marker';
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/markeroperation~MarkerOperation} Clone of this operation.
	 */
	clone() {
		return new MarkerOperation( this.name, this.oldRange, this.newRange, this._markers, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/markeroperation~MarkerOperation}
	 */
	getReversed() {
		return new MarkerOperation( this.name, this.newRange, this.oldRange, this._markers, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		const type = this.newRange ? 'set' : 'remove';

		this._markers[ type ]( this.name, this.newRange );

		return { name: this.name, type };
	}

	/**
	 * @inheritDoc
	 */
	toJSON() {
		const json = super.toJSON();

		delete json._markers;

		return json;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.MarkerOperation';
	}

	/**
	 * Creates `MarkerOperation` object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/markeroperation~MarkerOperation}
	 */
	static fromJSON( json, document ) {
		return new MarkerOperation(
			json.name,
			json.oldRange ? Range.fromJSON( json.oldRange, document ) : null,
			json.newRange ? Range.fromJSON( json.newRange, document ) : null,
			document.markers,
			json.baseVersion
		);
	}
}
