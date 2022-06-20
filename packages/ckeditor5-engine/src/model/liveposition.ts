/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/liveposition
 */

import Position, { type PositionStickiness } from './position';

import type { Marker } from './markercollection';
import type DocumentFragment from './documentfragment';
import type DocumentSelection from './documentselection';
import type Element from './element';
import type Item from './item';
import type LiveRange from './liverange';
import type Node from './node';
import type Operation from './operation/operation';
import type Range from './range';
import type RootElement from './rootelement';
import type Selection from './selection';
import type Text from './text';
import type TextProxy from './textproxy';

import EmitterMixin, { type Emitter } from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * `LivePosition` is a type of {@link module:engine/model/position~Position Position}
 * that updates itself as {@link module:engine/model/document~Document document}
 * is changed through operations. It may be used as a bookmark.
 *
 * **Note:** Contrary to {@link module:engine/model/position~Position}, `LivePosition` works only in roots that are
 * {@link module:engine/model/rootelement~RootElement}.
 * If {@link module:engine/model/documentfragment~DocumentFragment} is passed, error will be thrown.
 *
 * **Note:** Be very careful when dealing with `LivePosition`. Each `LivePosition` instance bind events that might
 * have to be unbound.
 * Use {@link module:engine/model/liveposition~LivePosition#detach} whenever you don't need `LivePosition` anymore.
 *
 * @extends module:engine/model/position~Position
 */
class LivePosition extends Position {
	declare public readonly root: RootElement;

	/**
	 * Creates a live position.
	 *
	 * @see module:engine/model/position~Position
	 * @param {module:engine/model/rootelement~RootElement} root
	 * @param {Array.<Number>} path
	 * @param {module:engine/model/position~PositionStickiness} [stickiness]
	 */
	constructor( root: RootElement, path: number[], stickiness: PositionStickiness = 'toNone' ) {
		super( root, path, stickiness );

		if ( !this.root.is( 'rootElement' ) ) {
			/**
			 * LivePosition's root has to be an instance of RootElement.
			 *
			 * @error model-liveposition-root-not-rootelement
			 */
			throw new CKEditorError( 'model-liveposition-root-not-rootelement', root );
		}

		bindWithDocument.call( this );
	}

	/**
	 * Unbinds all events previously bound by `LivePosition`. Use it whenever you don't need `LivePosition` instance
	 * anymore (i.e. when leaving scope in which it was declared or before re-assigning variable that was
	 * referring to it).
	 */
	public detach(): void {
		this.stopListening();
	}

	public override is( type: 'node' | 'model:node' ): this is Node | Element | Text | RootElement;
	public override is( type: 'element' | 'model:element' ): this is Element | RootElement;
	public override is( type: 'rootElement' | 'model:rootElement' ): this is RootElement;
	public override is( type: '$text' | 'model:$text' ): this is Text;
	public override is( type: 'position' | 'model:position' ): this is Position | LivePosition;
	public override is( type: 'livePosition' | 'model:livePosition' ): this is LivePosition;
	public override is( type: 'range' | 'model:range' ): this is Range | LiveRange;
	public override is( type: 'liveRange' | 'model:liveRange' ): this is LiveRange;
	public override is( type: 'documentFragment' | 'model:documentFragment' ): this is DocumentFragment;
	public override is( type: 'selection' | 'model:selection' ): this is Selection | DocumentSelection;
	public override is( type: 'documentSelection' | 'model:documentSelection' ): this is DocumentSelection;
	public override is( type: 'marker' | 'model:marker' ): this is Marker;
	public override is( type: '$textProxy' | 'model:$textProxy' ): this is TextProxy;
	public override is<N extends string>( type: 'element' | 'model:element', name: N ): this is ( Element | RootElement ) & { name: N };
	public override is<N extends string>( type: 'rootElement' | 'model:rootElement', name: N ): this is RootElement & { name: N };

	/**
	 * Checks whether this object is of the given.
	 *
	 *		livePosition.is( 'position' ); // -> true
	 *		livePosition.is( 'model:position' ); // -> true
	 *		livePosition.is( 'liveposition' ); // -> true
	 *		livePosition.is( 'model:livePosition' ); // -> true
	 *
	 *		livePosition.is( 'view:position' ); // -> false
	 *		livePosition.is( 'documentSelection' ); // -> false
	 *
	 * {@link module:engine/model/node~Node#is Check the entire list of model objects} which implement the `is()` method.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	public override is( type: string ): boolean {
		return type === 'livePosition' || type === 'model:livePosition' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type == 'position' || type === 'model:position';
	}

	/**
	 * Creates a {@link module:engine/model/position~Position position instance}, which is equal to this live position.
	 *
	 * @returns {module:engine/model/position~Position}
	 */
	public toPosition(): Position {
		return new Position( this.root, this.path.slice(), this.stickiness );
	}

	/**
	 * Creates a `LivePosition` instance that is equal to position.
	 *
	 * @param {module:engine/model/position~Position} position
	 * @param {module:engine/model/position~PositionStickiness} [stickiness]
	 * @returns {module:engine/model/liveposition~LivePosition}
	 */
	public static fromPosition( position: Position, stickiness: PositionStickiness ): LivePosition {
		return new this( position.root as RootElement, position.path.slice(), stickiness ? stickiness : position.stickiness );
	}

	/**
	 * @static
	 * @internal
	 * @protected
	 * @method module:engine/model/liveposition~LivePosition._createAfter
	 * @see module:engine/model/position~Position._createAfter
	 * @param {module:engine/model/node~Node} node
	 * @param {module:engine/model/position~PositionStickiness} [stickiness='toNone']
	 * @returns {module:engine/model/liveposition~LivePosition}
	 */

	declare public static readonly _createAfter: ( item: Item | DocumentFragment, stickiness?: PositionStickiness ) => LivePosition;

	/**
	 * @static
	 * @internal
	 * @protected
	 * @method module:engine/model/liveposition~LivePosition._createBefore
	 * @see module:engine/model/position~Position._createBefore
	 * @param {module:engine/model/node~Node} node
	 * @param {module:engine/model/position~PositionStickiness} [stickiness='toNone']
	 * @returns {module:engine/model/liveposition~LivePosition}
	 */

	declare public static readonly _createBefore: ( item: Item | DocumentFragment, stickiness?: PositionStickiness ) => LivePosition;

	/**
	 * @static
	 * @internal
	 * @protected
	 * @method module:engine/model/liveposition~LivePosition._createAt
	 * @see module:engine/model/position~Position._createAt
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset]
	 * @param {module:engine/model/position~PositionStickiness} [stickiness='toNone']
	 * @returns {module:engine/model/liveposition~LivePosition}
	 */

	declare public static readonly _createAt: (
		itemOrPosition: Item | Position | DocumentFragment,
		offset?: number | 'before' | 'after' | 'end',
		stickiness?: PositionStickiness
	) => LivePosition;

	/**
	 * Fired when `LivePosition` instance is changed due to changes on {@link module:engine/model/document~Document}.
	 *
	 * @event module:engine/model/liveposition~LivePosition#change
	 * @param {module:engine/model/position~Position} oldPosition Position equal to this live position before it got changed.
	 */
}

// Binds this `LivePosition` to the {@link module:engine/model/document~Document document} that owns
// this position's {@link module:engine/model/position~Position#root root}.
//
// @private
function bindWithDocument( this: LivePosition ) {
	this.listenTo(
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

// Updates this position accordingly to the updates applied to the model. Bases on change events.
//
// @private
// @param {module:engine/model/operation/operation~Operation} operation Executed operation.
function transform( this: LivePosition, operation: Operation ) {
	const result = this.getTransformedByOperation( operation );

	if ( !this.isEqual( result ) ) {
		const oldPosition = this.toPosition();

		this.path = result.path;
		( this as any ).root = result.root;

		this.fire( 'change', oldPosition );
	}
}

mix( LivePosition, EmitterMixin );

interface LivePosition extends Emitter {}
export default LivePosition;
