/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/insertoperation
 */

import Operation from './operation';
import Position from '../position';
import NodeList from '../nodelist';
import MoveOperation from './moveoperation';
import { _insert, _normalizeNodes } from './utils';
import Text from '../text';
import Element from '../element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Operation to insert one or more nodes at given position in the model.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class InsertOperation extends Operation {
	/**
	 * Creates an insert operation.
	 *
	 * @param {module:engine/model/position~Position} position Position of insertion.
	 * @param {module:engine/model/node~NodeSet} nodes The list of nodes to be inserted.
	 * @param {Number|null} baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( position, nodes, baseVersion ) {
		super( baseVersion );

		/**
		 * Position of insertion.
		 *
		 * @readonly
		 * @member {module:engine/model/position~Position} module:engine/model/operation/insertoperation~InsertOperation#position
		 */
		this.position = position.clone();
		this.position.stickiness = 'toNone';

		/**
		 * List of nodes to insert.
		 *
		 * @readonly
		 * @member {module:engine/model/nodelist~NodeList} module:engine/model/operation/insertoperation~InsertOperation#nodeList
		 */
		this.nodes = new NodeList( _normalizeNodes( nodes ) );

		/**
		 * Flag deciding how the operation should be transformed. If set to `true`, nodes might get additional attributes
		 * during operational transformation. This happens when the operation insertion position is inside of a range
		 * where attributes have changed.
		 *
		 * @member {Boolean} module:engine/model/operation/insertoperation~InsertOperation#shouldReceiveAttributes
		 */
		this.shouldReceiveAttributes = false;
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'insert';
	}

	/**
	 * Total offset size of inserted nodes.
	 *
	 * @returns {Number}
	 */
	get howMany() {
		return this.nodes.maxOffset;
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/insertoperation~InsertOperation} Clone of this operation.
	 */
	clone() {
		const nodes = new NodeList( [ ...this.nodes ].map( node => node._clone( true ) ) );
		const insert = new InsertOperation( this.position, nodes, this.baseVersion );

		insert.shouldReceiveAttributes = this.shouldReceiveAttributes;

		return insert;
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/moveoperation~MoveOperation}
	 */
	getReversed() {
		const graveyard = this.position.root.document.graveyard;
		const gyPosition = new Position( graveyard, [ 0 ] );

		return new MoveOperation( this.position, this.nodes.maxOffset, gyPosition, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	_validate() {
		const targetElement = this.position.parent;

		if ( !targetElement || targetElement.maxOffset < this.position.offset ) {
			/**
			 * Insertion position is invalid.
			 *
			 * @error insert-operation-position-invalid
			 */
			throw new CKEditorError(
				'insert-operation-position-invalid: Insertion position is invalid.',
				this
			);
		}
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		// What happens here is that we want original nodes be passed to writer because we want original nodes
		// to be inserted to the model. But in InsertOperation, we want to keep those nodes as they were added
		// to the operation, not modified. For example, text nodes can get merged or cropped while Elements can
		// get children. It is important that InsertOperation has the copy of original nodes in intact state.
		const originalNodes = this.nodes;
		this.nodes = new NodeList( [ ...originalNodes ].map( node => node._clone( true ) ) );

		_insert( this.position, originalNodes );
	}

	/**
	 * @inheritDoc
	 */
	toJSON() {
		const json = super.toJSON();

		json.position = this.position.toJSON();
		json.nodes = this.nodes.toJSON();

		return json;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'InsertOperation';
	}

	/**
	 * Creates `InsertOperation` object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/insertoperation~InsertOperation}
	 */
	static fromJSON( json, document ) {
		const children = [];

		for ( const child of json.nodes ) {
			if ( child.name ) {
				// If child has name property, it is an Element.
				children.push( Element.fromJSON( child ) );
			} else {
				// Otherwise, it is a Text node.
				children.push( Text.fromJSON( child ) );
			}
		}

		const insert = new InsertOperation( Position.fromJSON( json.position, document ), children, json.baseVersion );
		insert.shouldReceiveAttributes = json.shouldReceiveAttributes;

		return insert;
	}

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	const nodeString = this.nodes.length > 1 ? `[ ${ this.nodes.length } ]` : this.nodes.getNode( 0 );

	// @if CK_DEBUG_ENGINE //	return `InsertOperation( ${ this.baseVersion } ): ${ nodeString } -> ${ this.position }`;
	// @if CK_DEBUG_ENGINE // }
}
