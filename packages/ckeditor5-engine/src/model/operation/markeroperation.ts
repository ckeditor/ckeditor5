/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/markeroperation
 */

import Operation from './operation';
import Range from '../range';

import type Document from '../document';
import type MarkerCollection from '../markercollection';

/**
 * @extends module:engine/model/operation/operation~Operation
 */
export default class MarkerOperation extends Operation {
	public name: string;
	public oldRange: Range | null;
	public newRange: Range | null;
	public affectsData: boolean;

	private readonly _markers: MarkerCollection;

	/**
	 * @param {String} name Marker name.
	 * @param {module:engine/model/range~Range|null} oldRange Marker range before the change.
	 * @param {module:engine/model/range~Range|null} newRange Marker range after the change.
	 * @param {module:engine/model/markercollection~MarkerCollection} markers Marker collection on which change should be executed.
	 * @param {Boolean} affectsData Specifies whether the marker operation affects the data produced by the data pipeline
	 * (is persisted in the editor's data).
	 * @param {Number|null} baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor(
		name: string,
		oldRange: Range | null,
		newRange: Range | null,
		markers: MarkerCollection,
		affectsData: boolean,
		baseVersion: number | null
	) {
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
		 * @member {module:engine/model/range~Range|null}
		 */
		this.oldRange = oldRange ? oldRange.clone() : null;

		/**
		 * Marker range after the change.
		 *
		 * @readonly
		 * @member {module:engine/model/range~Range}
		 */
		this.newRange = newRange ? newRange.clone() : null;

		/**
		 * Specifies whether the marker operation affects the data produced by the data pipeline
		 * (is persisted in the editor's data).
		 *
		 * @readonly
		 * @member {Boolean}
		 */
		this.affectsData = affectsData;

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
	public get type(): 'marker' {
		return 'marker';
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/markeroperation~MarkerOperation} Clone of this operation.
	 */
	public clone(): MarkerOperation {
		return new MarkerOperation( this.name, this.oldRange, this.newRange, this._markers, this.affectsData, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/markeroperation~MarkerOperation}
	 */
	public getReversed(): Operation {
		return new MarkerOperation( this.name, this.newRange, this.oldRange, this._markers, this.affectsData, this.baseVersion! + 1 );
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public _execute(): void {
		if ( this.newRange ) {
			this._markers._set( this.name, this.newRange, true, this.affectsData );
		} else {
			this._markers._remove( this.name );
		}
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public override toJSON(): unknown {
		const json: any = super.toJSON();

		if ( this.oldRange ) {
			json.oldRange = this.oldRange.toJSON();
		}

		if ( this.newRange ) {
			json.newRange = this.newRange.toJSON();
		}

		delete json._markers;

		return json;
	}

	/**
	 * @inheritDoc
	 */
	public static override get className(): string {
		return 'MarkerOperation';
	}

	/**
	 * Creates `MarkerOperation` object from deserialized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/markeroperation~MarkerOperation}
	 */
	public static override fromJSON( json: any, document: Document ): MarkerOperation {
		return new MarkerOperation(
			json.name,
			json.oldRange ? Range.fromJSON( json.oldRange, document ) : null,
			json.newRange ? Range.fromJSON( json.newRange, document ) : null,
			document.model.markers,
			json.affectsData,
			json.baseVersion
		);
	}

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return `MarkerOperation( ${ this.baseVersion } ): ` +
	// @if CK_DEBUG_ENGINE //		`"${ this.name }": ${ this.oldRange } -> ${ this.newRange }`;
	// @if CK_DEBUG_ENGINE // }
}
