/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/wrapoperation
 */

import Operation from './operation';
import UnwrapOperation from './unwrapoperation';
import Position from '../position';
import Range from '../range';
import Element from '../element';
import { _insert, _move } from './utils';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Operation to wrap a range of {@link module:engine/model/node~Node nodes} with an {@link module:engine/model/element~Element element}.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class WrapOperation extends Operation {
	/**
	 * Creates a wrap operation.
	 *
	 * @param {module:engine/model/position~Position} position Position before
	 * the first {@link module:engine/model/item~Item model item} to wrap.
	 * @param {Number} howMany Offset size of wrapped range. Wrapped range will start at `position.offset` and end at
	 * `position.offset + howMany`.
	 * @param {module:engine/model/element~Element|module:engine/model/position~Position} elementOrPosition Wrapper
	 * element or position in graveyard before the element which should be used as a wrapper.
	 * @param {Number|null} baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( position, howMany, elementOrPosition, baseVersion ) {
		super( baseVersion );

		/**
		 * Position before the first {@link module:engine/model/node~Node node} to wrap.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/wrapoperation~WrapOperation#position
		 */
		this.position = Position.createFromPosition( position );
		// `'toNext'` because `position` is a bit like a start of the wrapped range.
		this.position.stickiness = 'toNext';

		/**
		 * Total offset size of the wrapped range.
		 *
		 * Wrapped range will start at `position.offset` and end at `position.offset + howMany`.
		 *
		 * @member {Number} module:engine/model/operation/wrapoperation~WrapOperation#howMany
		 */
		this.howMany = howMany;

		/**
		 * Wrapper element that will be used to wrap nodes.
		 *
		 * Is `null` if `elementOrPosition` was a {@link module:engine/model/position~Position}.
		 *
		 * @member {module:engine/model/element~Element} module:engine/model/operation/wrapoperation~WrapOperation#element
		 */
		this.element = elementOrPosition instanceof Element ? elementOrPosition : null;

		/**
		 * Position in the graveyard root before the element that will be used as a wrapper element.
		 *
		 * Is `null` if `elementOrPosition` was a {@link module:engine/model/element~Element}.
		 *
		 * @member {module:engine/model/element~Element} module:engine/model/operation/wrapoperation~WrapOperation#graveyardPosition
		 */
		this.graveyardPosition = elementOrPosition instanceof Element ? null : Position.createFromPosition( elementOrPosition );

		if ( this.graveyardPosition ) {
			this.graveyardPosition.stickiness = 'toNext';
		}
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'wrap';
	}

	/**
	 * Position to which the wrapped elements will be moved. This is a position at the beginning of the wrapping element.
	 *
	 * @readonly
	 * @type {module:engine/model/position~Position}
	 */
	get targetPosition() {
		const path = this.position.path.slice();
		path.push( 0 );

		return new Position( this.position.root, path );
	}

	/**
	 * A range containing all nodes that will be wrapped.
	 *
	 * @readonly
	 * @type {module:engine/model/range~Range}
	 */
	get wrappedRange() {
		return Range.createFromPositionAndShift( this.position, this.howMany );
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/wrapoperation~WrapOperation} Clone of this operation.
	 */
	clone() {
		const elementOrPosition = this.element ? this.element._clone() : this.graveyardPosition;

		return new this.constructor( this.position, this.howMany, elementOrPosition, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/unwrapoperation~UnwrapOperation}
	 */
	getReversed() {
		const graveyard = this.position.root.document.graveyard;
		const graveyardPosition = new Position( graveyard, [ 0 ] );

		return new UnwrapOperation( this.targetPosition, this.howMany, graveyardPosition, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	_validate() {
		const element = this.position.parent;

		// Validate whether wrap operation has correct parameters.
		if ( !element || this.position.offset > element.maxOffset ) {
			/**
			 * Wrap position is invalid.
			 *
			 * @error wrap-operation-position-invalid
			 */
			throw new CKEditorError( 'wrap-operation-position-invalid: Wrap position is invalid.' );
		} else if ( this.position.offset + this.howMany > element.maxOffset ) {
			/**
			 * Invalid number of nodes to wrap.
			 *
			 * @error wrap-operation-how-many-invalid
			 */
			throw new CKEditorError( 'wrap-operation-how-many-invalid: Invalid number of nodes to wrap.' );
		} else if ( this.graveyardPosition && !this.graveyardPosition.nodeAfter ) {
			/**
			 * Graveyard position invalid.
			 *
			 * @error wrap-operation-graveyard-position-invalid
			 */
			throw new CKEditorError( 'wrap-operation-graveyard-position-invalid: Graveyard position invalid.' );
		}
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		const wrappedRange = this.wrappedRange;

		const insertPosition = Position.createFromPosition( wrappedRange.end );

		const targetPath = insertPosition.path.slice();
		targetPath.push( 0 );
		const targetPosition = new Position( this.position.root, targetPath );

		if ( this.element ) {
			const originalElement = this.element;
			this.element = this.element._clone();

			_insert( insertPosition, originalElement );
		} else {
			_move( Range.createFromPositionAndShift( this.graveyardPosition, 1 ), insertPosition );
		}

		_move( wrappedRange, targetPosition );
	}

	/**
	 * @inheritDoc
	 */
	toJSON() {
		const json = super.toJSON();

		json.position = this.position.toJSON();

		if ( this.element ) {
			json.element = this.element.toJSON();
			delete json.graveyardPosition;
		} else {
			json.graveyardPosition = this.graveyardPosition.toJSON();
			delete json.element;
		}

		return json;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'WrapOperation';
	}

	/**
	 * Creates `WrapOperation` object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/wrapoperation~WrapOperation}
	 */
	static fromJSON( json, document ) {
		const position = Position.fromJSON( json.position, document );
		const elementOrPosition = json.element ? Element.fromJSON( json.element ) : Position.fromJSON( json.graveyardPosition, document );

		return new this( position, json.howMany, elementOrPosition, json.baseVersion );
	}
}
