/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/markeroperation
 */

import Operation from './operation';
import Range from '../range';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * @extends module:engine/model/operation/operation~Operation
 */
export default class MarkerOperation extends Operation {
	/**
	 * @param {String} name Marker name.
	 * @param {module:engine/model/range~Range} oldRange Marker range before the change.
	 * @param {module:engine/model/range~Range} newRange Marker range after the change.
	 * @param {Number} baseVersion {@link module:engine/model/document~Document#version} on which the operation can be applied.
	 */
	constructor( name, oldRange, newRange, baseVersion ) {
		super( baseVersion );

		/**
		 * Marker name.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.name = name;

		if ( ( oldRange && !oldRange.root.document ) || ( newRange && !newRange.root.document ) ) {
			/**
			 * MarkerOperation range must be inside a document.
			 *
			 * @error marker-operation-range-not-in-document
			 */
			throw new CKEditorError( 'marker-operation-range-not-in-document: MarkerOperation range must be inside a document.' );
		} else if ( oldRange && newRange && oldRange.root.document != newRange.root.document ) {
			/**
			 * MarkerOperation ranges must be inside same document.
			 *
			 * @error marker-operation-ranges-in-different-documents
			 */
			throw new CKEditorError(
				'marker-operation-ranges-in-different-documents: MarkerOperation ranges must be inside same document.'
			);
		}

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
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'marker';
	}

	/**
	 * @inheritDoc
	 * @returns {module:engine/model/operation/markeroperation~MarkerOperation}
	 */
	clone() {
		return new MarkerOperation( this.name, this.oldRange, this.newRange, this.baseVersion );
	}

	/**
	 * @inheritDoc
	 * @returns {module:engine/model/operation/markeroperation~MarkerOperation}
	 */
	getReversed() {
		return new MarkerOperation( this.name, this.newRange, this.oldRange, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		// If old range and new range are "same", operation should not do anything.
		if ( this.oldRange === null && this.newRange === null ) {
			return;
		} else if ( this.oldRange !== null && this.newRange !== null && this.oldRange.isEqual( this.newRange ) ) {
			return;
		}

		// At this point either `this.oldRange` or `this.newRange` has to be not-null.
		const document = ( this.oldRange || this.newRange ).root.document;
		let type;

		if ( this.newRange ) {
			type = 'set';
			document.markers.set( this.name, this.newRange );
		} else {
			type = 'remove';
			document.markers.remove( this.name );
		}

		return { name: this.name, type: type };
	}

	/**
	 * @inheritDoc
	 */
	toJSON() {
		const json = super.toJSON();

		delete json._document;

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
			json.baseVersion
		);
	}
}
