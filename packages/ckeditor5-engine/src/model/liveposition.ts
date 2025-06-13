/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/liveposition
 */

import { ModelPosition, type ModelPositionOffset, type ModelPositionStickiness } from './position.js';

import type { ModelApplyOperationEvent } from './model.js';
import { type ModelDocumentFragment } from './documentfragment.js';
import { type ModelItem } from './item.js';
import { type Operation } from './operation/operation.js';
import { type ModelRootElement } from './rootelement.js';

import { CKEditorError, EmitterMixin } from '@ckeditor/ckeditor5-utils';

/**
 * `ModelLivePosition` is a type of {@link module:engine/model/position~ModelPosition Position}
 * that updates itself as {@link module:engine/model/document~ModelDocument document}
 * is changed through operations. It may be used as a bookmark.
 *
 * **Note:** Contrary to {@link module:engine/model/position~ModelPosition}, `ModelLivePosition` works only in roots that are
 * {@link module:engine/model/rootelement~ModelRootElement}.
 * If {@link module:engine/model/documentfragment~ModelDocumentFragment} is passed, error will be thrown.
 *
 * **Note:** Be very careful when dealing with `ModelLivePosition`. Each `ModelLivePosition` instance bind events that might
 * have to be unbound.
 * Use {@link module:engine/model/liveposition~ModelLivePosition#detach} whenever you don't need `ModelLivePosition` anymore.
 */
export class ModelLivePosition extends /* #__PURE__ */ EmitterMixin( ModelPosition ) {
	/**
	 * Root of the position path.
	 */
	declare public readonly root: ModelRootElement;

	/**
	 * Creates a live position.
	 *
	 * @see module:engine/model/position~ModelPosition
	 */
	constructor( root: ModelRootElement, path: Array<number>, stickiness: ModelPositionStickiness = 'toNone' ) {
		super( root, path, stickiness );

		if ( !this.root.is( 'rootElement' ) ) {
			/**
			 * LivePosition's root has to be an instance of ModelRootElement.
			 *
			 * @error model-liveposition-root-not-rootelement
			 */
			throw new CKEditorError( 'model-liveposition-root-not-rootelement', root );
		}

		bindWithDocument.call( this );
	}

	/**
	 * Unbinds all events previously bound by `ModelLivePosition`. Use it whenever you don't need `ModelLivePosition` instance
	 * anymore (i.e. when leaving scope in which it was declared or before re-assigning variable that was
	 * referring to it).
	 */
	public detach(): void {
		this.stopListening();
	}

	/**
	 * Creates a {@link module:engine/model/position~ModelPosition position instance}, which is equal to this live position.
	 */
	public toPosition(): ModelPosition {
		return new ModelPosition( this.root, this.path.slice(), this.stickiness );
	}

	/**
	 * Creates a `ModelLivePosition` instance that is equal to position.
	 */
	public static fromPosition( position: ModelPosition, stickiness?: ModelPositionStickiness ): ModelLivePosition {
		return new this( position.root as ModelRootElement, position.path.slice(), stickiness ? stickiness : position.stickiness );
	}

	/**
	 * @internal
	 * @see module:engine/model/position~ModelPosition._createAfter
	 */
	declare public static readonly _createAfter: (
		item: ModelItem | ModelDocumentFragment,
		stickiness?: ModelPositionStickiness
	) => ModelLivePosition;

	/**
	 * @internal
	 * @see module:engine/model/position~ModelPosition._createBefore
	 */
	declare public static readonly _createBefore: (
		item: ModelItem | ModelDocumentFragment,
		stickiness?: ModelPositionStickiness
	) => ModelLivePosition;

	/**
	 * @internal
	 * @see module:engine/model/position~ModelPosition._createAt
	 */
	declare public static readonly _createAt: (
		itemOrPosition: ModelItem | ModelPosition | ModelDocumentFragment,
		offset?: ModelPositionOffset,
		stickiness?: ModelPositionStickiness
	) => ModelLivePosition;
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ModelLivePosition.prototype.is = function( type: string ): boolean {
	return type === 'livePosition' || type === 'model:livePosition' ||
		// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
		type == 'position' || type === 'model:position';
};

/**
 * Binds this `ModelLivePosition` to the {@link module:engine/model/document~ModelDocument document} that owns
 * this position's {@link module:engine/model/position~ModelPosition#root root}.
 */
function bindWithDocument( this: ModelLivePosition ) {
	this.listenTo<ModelApplyOperationEvent>(
		this.root.document!.model,
		'applyOperation',
		( event, args ) => {
			const operation = args[ 0 ];

			if ( !operation.isDocumentOperation ) {
				return;
			}

			transform.call( this, operation );
		},
		{ priority: 'low' }
	);
}

/**
 * Updates this position accordingly to the updates applied to the model. Bases on change events.
 */
function transform( this: ModelLivePosition, operation: Operation ) {
	const result = this.getTransformedByOperation( operation );

	if ( !this.isEqual( result ) ) {
		const oldPosition = this.toPosition();

		( this as any ).path = result.path;
		( this as any ).root = result.root;

		this.fire<ModelLivePositionChangeEvent>( 'change', oldPosition );
	}
}

/**
 * Fired when `ModelLivePosition` instance is changed due to changes on {@link module:engine/model/document~ModelDocument}.
 *
 * @eventName ~ModelLivePosition#change
 * @param oldPosition Position equal to this live position before it got changed.
 */
export type ModelLivePositionChangeEvent = {
	name: 'change';
	args: [ oldPosition: ModelPosition ];
};
