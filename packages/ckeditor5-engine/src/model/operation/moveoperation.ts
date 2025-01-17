/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/operation/moveoperation
 */

import Operation from './operation.js';
import Position from '../position.js';
import Range from '../range.js';
import { _move } from './utils.js';
import type { Selectable } from '../selection.js';

import { CKEditorError, compareArrays } from '@ckeditor/ckeditor5-utils';

import type Document from '../document.js';

// @if CK_DEBUG_ENGINE // const ModelRange = require( '../range' ).default;

/**
 * Operation to move a range of {@link module:engine/model/item~Item model items}
 * to given {@link module:engine/model/position~Position target position}.
 */
export default class MoveOperation extends Operation {
	/**
	 * Position before the first {@link module:engine/model/item~Item model item} to move.
	 */
	public sourcePosition: Position;

	/**
	 * Offset size of moved range.
	 */
	public howMany: number;

	/**
	 * Position at which moved nodes will be inserted.
	 */
	public targetPosition: Position;

	/**
	 * Creates a move operation.
	 *
	 * @param sourcePosition Position before the first {@link module:engine/model/item~Item model item} to move.
	 * @param howMany Offset size of moved range. Moved range will start from `sourcePosition` and end at
	 * `sourcePosition` with offset shifted by `howMany`.
	 * @param targetPosition Position at which moved nodes will be inserted.
	 * @param baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( sourcePosition: Position, howMany: number, targetPosition: Position, baseVersion: number | null ) {
		super( baseVersion );

		this.sourcePosition = sourcePosition.clone();
		// `'toNext'` because `sourcePosition` is a bit like a start of the moved range.
		this.sourcePosition.stickiness = 'toNext';

		this.howMany = howMany;

		this.targetPosition = targetPosition.clone();
		this.targetPosition.stickiness = 'toNone';
	}

	/**
	 * @inheritDoc
	 */
	public get type(): 'move' | 'remove' | 'reinsert' {
		if ( this.targetPosition.root.rootName == '$graveyard' ) {
			return 'remove';
		} else if ( this.sourcePosition.root.rootName == '$graveyard' ) {
			return 'reinsert';
		}

		return 'move';
	}

	/**
	 * @inheritDoc
	 */
	public get affectedSelectable(): Selectable {
		return [
			Range._createFromPositionAndShift( this.sourcePosition, this.howMany ),
			Range._createFromPositionAndShift( this.targetPosition, 0 )
		];
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 */
	public clone(): MoveOperation {
		return new MoveOperation( this.sourcePosition, this.howMany, this.targetPosition, this.baseVersion );
	}

	/**
	 * Returns the start position of the moved range after it got moved. This may be different than
	 * {@link module:engine/model/operation/moveoperation~MoveOperation#targetPosition} in some cases, i.e. when a range is moved
	 * inside the same parent but {@link module:engine/model/operation/moveoperation~MoveOperation#targetPosition targetPosition}
	 * is after {@link module:engine/model/operation/moveoperation~MoveOperation#sourcePosition sourcePosition}.
	 *
	 * ```
	 *  vv              vv
	 * abcdefg ===> adefbcg
	 *      ^          ^
	 *      targetPos  movedRangeStart
	 *      offset 6   offset 4
	 *```
	 */
	public getMovedRangeStart(): Position {
		return this.targetPosition._getTransformedByDeletion( this.sourcePosition, this.howMany )!;
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 */
	public getReversed(): Operation {
		const newTargetPosition = this.sourcePosition._getTransformedByInsertion( this.targetPosition, this.howMany );

		return new MoveOperation( this.getMovedRangeStart(), this.howMany, newTargetPosition, this.baseVersion! + 1 );
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public override _validate(): void {
		const sourceElement = this.sourcePosition.parent;
		const targetElement = this.targetPosition.parent;
		const sourceOffset = this.sourcePosition.offset;
		const targetOffset = this.targetPosition.offset;

		// Validate whether move operation has correct parameters.
		// Validation is pretty complex but move operation is one of the core ways to manipulate the document state.
		// We expect that many errors might be connected with one of scenarios described below.
		if ( sourceOffset + this.howMany > sourceElement.maxOffset ) {
			/**
			 * The nodes which should be moved do not exist.
			 *
			 * @error move-operation-nodes-do-not-exist
			 */
			throw new CKEditorError(
				'move-operation-nodes-do-not-exist', this
			);
		} else if ( sourceElement === targetElement && sourceOffset < targetOffset && targetOffset < sourceOffset + this.howMany ) {
			/**
			 * Trying to move a range of nodes into the middle of that range.
			 *
			 * @error move-operation-range-into-itself
			 */
			throw new CKEditorError(
				'move-operation-range-into-itself', this
			);
		} else if ( this.sourcePosition.root == this.targetPosition.root ) {
			if ( compareArrays( this.sourcePosition.getParentPath(), this.targetPosition.getParentPath() ) == 'prefix' ) {
				const i = this.sourcePosition.path.length - 1;

				if ( this.targetPosition.path[ i ] >= sourceOffset && this.targetPosition.path[ i ] < sourceOffset + this.howMany ) {
					/**
					 * Trying to move a range of nodes into one of nodes from that range.
					 *
					 * @error move-operation-node-into-itself
					 */
					throw new CKEditorError(
						'move-operation-node-into-itself', this
					);
				}
			}
		}
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public _execute(): void {
		_move( Range._createFromPositionAndShift( this.sourcePosition, this.howMany ), this.targetPosition );
	}

	/**
	 * @inheritDoc
	 */
	public override toJSON(): unknown {
		const json: any = super.toJSON();

		json.sourcePosition = this.sourcePosition.toJSON();
		json.targetPosition = this.targetPosition.toJSON();

		return json;
	}

	/**
	 * @inheritDoc
	 */
	public static override get className(): string {
		return 'MoveOperation';
	}

	/**
	 * Creates `MoveOperation` object from deserialized object, i.e. from parsed JSON string.
	 *
	 * @param json Deserialized JSON object.
	 * @param document Document on which this operation will be applied.
	 */
	public static override fromJSON( json: any, document: Document ): MoveOperation {
		const sourcePosition = Position.fromJSON( json.sourcePosition, document );
		const targetPosition = Position.fromJSON( json.targetPosition, document );

		return new this( sourcePosition, json.howMany, targetPosition, json.baseVersion );
	}

	// @if CK_DEBUG_ENGINE // public override toString(): string {
	// @if CK_DEBUG_ENGINE // 	const range = ModelRange._createFromPositionAndShift( this.sourcePosition, this.howMany );

	// @if CK_DEBUG_ENGINE // 	return `MoveOperation( ${ this.baseVersion } ): ${ range } -> ${ this.targetPosition }`;
	// @if CK_DEBUG_ENGINE // }
}
