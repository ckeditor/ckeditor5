/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/operation/insertoperation
 */

import Operation from './operation.js';
import Position from '../position.js';
import NodeList from '../nodelist.js';
import MoveOperation from './moveoperation.js';
import { _insert, _normalizeNodes, type NodeSet } from './utils.js';
import Text from '../text.js';
import Element from '../element.js';
import type { Selectable } from '../selection.js';

import type Document from '../document.js';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

/**
 * Operation to insert one or more nodes at given position in the model.
 */
export default class InsertOperation extends Operation {
	/**
	 * Position of insertion.
	 *
	 * @readonly
	 */
	public position: Position;

	/**
	 * List of nodes to insert.
	 *
	 * @readonly
	 */
	public nodes: NodeList;

	/**
	 * Flag deciding how the operation should be transformed. If set to `true`, nodes might get additional attributes
	 * during operational transformation. This happens when the operation insertion position is inside of a range
	 * where attributes have changed.
	 */
	public shouldReceiveAttributes: boolean;

	/**
	 * Creates an insert operation.
	 *
	 * @param position Position of insertion.
	 * @param nodes The list of nodes to be inserted.
	 * @param baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( position: Position, nodes: NodeSet, baseVersion: number | null ) {
		super( baseVersion );

		this.position = position.clone();
		this.position.stickiness = 'toNone';
		this.nodes = new NodeList( _normalizeNodes( nodes ) );
		this.shouldReceiveAttributes = false;
	}

	/**
	 * @inheritDoc
	 */
	public get type(): 'insert' {
		return 'insert';
	}

	/**
	 * Total offset size of inserted nodes.
	 */
	public get howMany(): number {
		return this.nodes.maxOffset;
	}

	/**
	 * @inheritDoc
	 */
	public get affectedSelectable(): Selectable {
		return this.position.clone();
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 */
	public clone(): InsertOperation {
		const nodes = new NodeList( [ ...this.nodes ].map( node => node._clone( true ) ) );
		const insert = new InsertOperation( this.position, nodes, this.baseVersion );

		insert.shouldReceiveAttributes = this.shouldReceiveAttributes;

		return insert;
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 */
	public getReversed(): Operation {
		const graveyard = this.position.root.document!.graveyard;
		const gyPosition = new Position( graveyard, [ 0 ] );

		return new MoveOperation( this.position, this.nodes.maxOffset, gyPosition, this.baseVersion! + 1 );
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public override _validate(): void {
		const targetElement = this.position.parent;

		if ( !targetElement || targetElement.maxOffset < this.position.offset ) {
			/**
			 * Insertion position is invalid.
			 *
			 * @error insert-operation-position-invalid
			 */
			throw new CKEditorError(
				'insert-operation-position-invalid',
				this
			);
		}
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public _execute(): void {
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
	public override toJSON(): unknown {
		const json: any = super.toJSON();

		json.position = this.position.toJSON();
		json.nodes = this.nodes.toJSON();

		return json;
	}

	/**
	 * @inheritDoc
	 */
	public static override get className(): string {
		return 'InsertOperation';
	}

	/**
	 * Creates `InsertOperation` object from deserialized object, i.e. from parsed JSON string.
	 *
	 * @param json Deserialized JSON object.
	 * @param document Document on which this operation will be applied.
	 */
	public static override fromJSON( json: any, document: Document ): InsertOperation {
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

	// @if CK_DEBUG_ENGINE // public override toString(): string {
	// @if CK_DEBUG_ENGINE // 	const nodeString = this.nodes.length > 1 ? `[ ${ this.nodes.length } ]` : this.nodes.getNode( 0 );

	// @if CK_DEBUG_ENGINE // 	return `InsertOperation( ${ this.baseVersion } ): ${ nodeString } -> ${ this.position }`;
	// @if CK_DEBUG_ENGINE // }
}
