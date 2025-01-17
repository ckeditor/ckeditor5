/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/treewalker
 */

import type Element from './element.js';
import {
	default as Position,
	getTextNodeAtPosition,
	getNodeAfterPosition,
	getNodeBeforePosition
} from './position.js';
import TextProxy from './textproxy.js';

import type DocumentFragment from './documentfragment.js';
import type Item from './item.js';
import type Range from './range.js';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

/**
 * Position iterator class. It allows to iterate forward and backward over the document.
 */
export default class TreeWalker implements Iterable<TreeWalkerValue> {
	/**
	 * Walking direction. Defaults `'forward'`.
	 */
	public readonly direction: TreeWalkerDirection;

	/**
	 * Iterator boundaries.
	 *
	 * When the iterator is walking `'forward'` on the end of boundary or is walking `'backward'`
	 * on the start of boundary, then `{ done: true }` is returned.
	 *
	 * If boundaries are not defined they are set before first and after last child of the root node.
	 */
	public readonly boundaries: Range | null;

	/**
	 * Flag indicating whether all consecutive characters with the same attributes should be
	 * returned as one {@link module:engine/model/textproxy~TextProxy} (`true`) or one by one (`false`).
	 */
	public readonly singleCharacters: boolean;

	/**
	 * Flag indicating whether iterator should enter elements or not. If the iterator is shallow child nodes of any
	 * iterated node will not be returned along with `elementEnd` tag.
	 */
	public readonly shallow: boolean;

	/**
	 * Flag indicating whether iterator should ignore `elementEnd` tags. If the option is true walker will not
	 * return a parent node of the start position. If this option is `true` each {@link module:engine/model/element~Element} will
	 * be returned once, while if the option is `false` they might be returned twice:
	 * for `'elementStart'` and `'elementEnd'`.
	 */
	public readonly ignoreElementEnd: boolean;

	/**
	 * Iterator position. This is always static position, even if the initial position was a
	 * {@link module:engine/model/liveposition~LivePosition live position}. If start position is not defined then position depends
	 * on {@link #direction}. If direction is `'forward'` position starts form the beginning, when direction
	 * is `'backward'` position starts from the end.
	 */
	private _position: Position;

	/**
	 * Start boundary cached for optimization purposes.
	 */
	private _boundaryStartParent: Element | DocumentFragment | null;

	/**
	 * End boundary cached for optimization purposes.
	 */
	private _boundaryEndParent: Element | DocumentFragment | null;

	/**
	 * Parent of the most recently visited node. Cached for optimization purposes.
	 */
	private _visitedParent: Element | DocumentFragment;

	/**
	 * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
	 *
	 * @param options Object with configuration.
	 */
	constructor( options: TreeWalkerOptions ) {
		if ( !options || ( !options.boundaries && !options.startPosition ) ) {
			/**
			 * Neither boundaries nor starting position of a `TreeWalker` have been defined.
			 *
			 * @error model-tree-walker-no-start-position
			 */
			throw new CKEditorError(
				'model-tree-walker-no-start-position',
				null
			);
		}

		const direction = options.direction || 'forward';

		if ( direction != 'forward' && direction != 'backward' ) {
			/**
			 * Only `backward` and `forward` direction allowed.
			 *
			 * @error model-tree-walker-unknown-direction
			 */
			throw new CKEditorError( 'model-tree-walker-unknown-direction', options, { direction } );
		}

		this.direction = direction;
		this.boundaries = options.boundaries || null;

		if ( options.startPosition ) {
			this._position = options.startPosition.clone();
		} else {
			this._position = Position._createAt( this.boundaries![ this.direction == 'backward' ? 'end' : 'start' ] );
		}

		// Reset position stickiness in case it was set to other value, as the stickiness is kept after cloning.
		this.position.stickiness = 'toNone';

		this.singleCharacters = !!options.singleCharacters;
		this.shallow = !!options.shallow;
		this.ignoreElementEnd = !!options.ignoreElementEnd;

		this._boundaryStartParent = this.boundaries ? this.boundaries.start.parent : null;
		this._boundaryEndParent = this.boundaries ? this.boundaries.end.parent : null;
		this._visitedParent = this.position.parent;
	}

	/**
	 * Iterable interface.
	 *
	 * @returns {Iterable.<module:engine/model/treewalker~TreeWalkerValue>}
	 */
	public [ Symbol.iterator ](): IterableIterator<TreeWalkerValue> {
		return this;
	}

	/**
	 * Iterator position. This is always static position, even if the initial position was a
	 * {@link module:engine/model/liveposition~LivePosition live position}. If start position is not defined then position depends
	 * on {@link #direction}. If direction is `'forward'` position starts form the beginning, when direction
	 * is `'backward'` position starts from the end.
	 */
	public get position(): Position {
		return this._position;
	}

	/**
	 * Moves {@link #position} in the {@link #direction} skipping values as long as the callback function returns `true`.
	 *
	 * For example:
	 *
	 * ```ts
	 * walker.skip( value => value.type == 'text' ); // <paragraph>[]foo</paragraph> -> <paragraph>foo[]</paragraph>
	 * walker.skip( () => true ); // Move the position to the end: <paragraph>[]foo</paragraph> -> <paragraph>foo</paragraph>[]
	 * walker.skip( () => false ); // Do not move the position.
	 * ```
	 *
	 * @param skip Callback function. Gets {@link module:engine/model/treewalker~TreeWalkerValue} and should
	 * return `true` if the value should be skipped or `false` if not.
	 */
	public skip( skip: ( value: TreeWalkerValue ) => boolean ): void {
		let done, value, prevPosition, prevVisitedParent;

		do {
			prevPosition = this.position;
			prevVisitedParent = this._visitedParent;

			( { done, value } = this.next() );
		} while ( !done && skip( value ) );

		if ( !done ) {
			this._position = prevPosition;
			this._visitedParent = prevVisitedParent;
		}
	}

	/**
	 * Moves tree walker {@link #position} to provided `position`. Tree walker will
	 * continue traversing from that position.
	 *
	 * Note: in contrary to {@link ~TreeWalker#skip}, this method does not iterate over the nodes along the way.
	 * It simply sets the current tree walker position to a new one.
	 * From the performance standpoint, it is better to use {@link ~TreeWalker#jumpTo} rather than {@link ~TreeWalker#skip}.
	 *
	 * If the provided position is before the start boundary, the position will be
	 * set to the start boundary. If the provided position is after the end boundary,
	 * the position will be set to the end boundary.
	 * This is done to prevent the treewalker from traversing outside the boundaries.
	 *
	 * @param position Position to jump to.
	 */
	public jumpTo( position: Position ): void {
		if ( this._boundaryStartParent && position.isBefore( this.boundaries!.start ) ) {
			position = this.boundaries!.start;
		} else if ( this._boundaryEndParent && position.isAfter( this.boundaries!.end ) ) {
			position = this.boundaries!.end;
		}

		this._position = position.clone();
		this._visitedParent = position.parent;
	}

	/**
	 * Gets the next tree walker's value.
	 */
	public next(): IteratorResult<TreeWalkerValue> {
		if ( this.direction == 'forward' ) {
			return this._next();
		} else {
			return this._previous();
		}
	}

	/**
	 * Makes a step forward in model. Moves the {@link #position} to the next position and returns the encountered value.
	 */
	private _next(): IteratorResult<TreeWalkerValue> {
		const previousPosition = this.position;
		const position = this.position.clone();
		const parent = this._visitedParent;

		// We are at the end of the root.
		if ( parent.parent === null && position.offset === parent.maxOffset ) {
			return { done: true, value: undefined };
		}

		// We reached the walker boundary.
		if ( parent === this._boundaryEndParent && position.offset == this.boundaries!.end.offset ) {
			return { done: true, value: undefined };
		}

		// Get node just after the current position.
		// Use a highly optimized version instead of checking the text node first and then getting the node after. See #6582.
		const textNodeAtPosition = getTextNodeAtPosition( position, parent );
		const node = textNodeAtPosition || getNodeAfterPosition( position, parent, textNodeAtPosition );

		if ( node && node.is( 'model:element' ) ) {
			if ( !this.shallow ) {
				// Manual operations on path internals for optimization purposes. Here and in the rest of the method.
				( position.path as Array<number> ).push( 0 );
				this._visitedParent = node;
			} else {
				// We are past the walker boundaries.
				if ( this.boundaries && this.boundaries.end.isBefore( position ) ) {
					return { done: true, value: undefined };
				}

				position.offset++;
			}

			this._position = position;

			return formatReturnValue( 'elementStart', node, previousPosition, position, 1 );
		}

		if ( node && node.is( 'model:$text' ) ) {
			let charactersCount;

			if ( this.singleCharacters ) {
				charactersCount = 1;
			} else {
				let offset = node.endOffset!;

				if ( this._boundaryEndParent == parent && this.boundaries!.end.offset < offset ) {
					offset = this.boundaries!.end.offset;
				}

				charactersCount = offset - position.offset;
			}

			const offsetInTextNode = position.offset - node.startOffset!;
			const item = new TextProxy( node, offsetInTextNode, charactersCount );

			position.offset += charactersCount;
			this._position = position;

			return formatReturnValue( 'text', item, previousPosition, position, charactersCount );
		}

		// `node` is not set, we reached the end of current `parent`.
		( position.path as Array<number> ).pop();
		position.offset++;
		this._position = position;
		this._visitedParent = parent.parent!;

		if ( this.ignoreElementEnd ) {
			return this._next();
		}

		return formatReturnValue( 'elementEnd', parent as Element, previousPosition, position );
	}

	/**
	 * Makes a step backward in model. Moves the {@link #position} to the previous position and returns the encountered value.
	 */
	private _previous(): IteratorResult<TreeWalkerValue> {
		const previousPosition = this.position;
		const position = this.position.clone();
		const parent = this._visitedParent;

		// We are at the beginning of the root.
		if ( parent.parent === null && position.offset === 0 ) {
			return { done: true, value: undefined };
		}

		// We reached the walker boundary.
		if ( parent == this._boundaryStartParent && position.offset == this.boundaries!.start.offset ) {
			return { done: true, value: undefined };
		}

		// Get node just before the current position.
		// Use a highly optimized version instead of checking the text node first and then getting the node before. See #6582.
		const positionParent = position.parent;
		const textNodeAtPosition = getTextNodeAtPosition( position, positionParent );
		const node = textNodeAtPosition || getNodeBeforePosition( position, positionParent, textNodeAtPosition );

		if ( node && node.is( 'model:element' ) ) {
			position.offset--;

			if ( this.shallow ) {
				this._position = position;

				return formatReturnValue( 'elementStart', node, previousPosition, position, 1 );
			}

			( position.path as Array<number> ).push( node.maxOffset );
			this._position = position;
			this._visitedParent = node;

			if ( this.ignoreElementEnd ) {
				return this._previous();
			}

			return formatReturnValue( 'elementEnd', node, previousPosition, position );
		}

		if ( node && node.is( 'model:$text' ) ) {
			let charactersCount;

			if ( this.singleCharacters ) {
				charactersCount = 1;
			} else {
				let offset = node.startOffset!;

				if ( this._boundaryStartParent == parent && this.boundaries!.start.offset > offset ) {
					offset = this.boundaries!.start.offset;
				}

				charactersCount = position.offset - offset;
			}

			const offsetInTextNode = position.offset - node.startOffset!;
			const item = new TextProxy( node, offsetInTextNode - charactersCount, charactersCount );

			position.offset -= charactersCount;
			this._position = position;

			return formatReturnValue( 'text', item, previousPosition, position, charactersCount );
		}

		// `node` is not set, we reached the beginning of current `parent`.
		( position.path as Array<number> ).pop();
		this._position = position;
		this._visitedParent = parent.parent!;

		return formatReturnValue( 'elementStart', parent as Element, previousPosition, position, 1 );
	}
}

function formatReturnValue(
	type: TreeWalkerValueType,
	item: Item,
	previousPosition: Position,
	nextPosition: Position,
	length?: number
): IteratorYieldResult<TreeWalkerValue> {
	return {
		done: false,
		value: {
			type,
			item,
			previousPosition,
			nextPosition,
			length
		}
	};
}

/**
 * Type of the step made by {@link module:engine/model/treewalker~TreeWalker}.
 * Possible values: `'elementStart'` if walker is at the beginning of a node, `'elementEnd'` if walker is at the end of node,
 * or `'text'` if walker traversed over text.
 */
export type TreeWalkerValueType = 'elementStart' | 'elementEnd' | 'text';

/**
 * Object returned by {@link module:engine/model/treewalker~TreeWalker} when traversing tree model.
 */
export interface TreeWalkerValue {
	type: TreeWalkerValueType;

	/**
	 * Item between old and new positions of {@link module:engine/model/treewalker~TreeWalker}.
	 */
	item: Item;

	/**
	 * Previous position of the iterator.
	 * * Forward iteration: For `'elementEnd'` it is the last position inside the element. For all other types it is the
	 * position before the item.
	 * * Backward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
	 * the position after item.
	 */
	previousPosition: Position;

	/**
	 * Next position of the iterator.
	 * * Forward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
	 * the position after the item.
	 * * Backward iteration: For `'elementEnd'` it is last position inside element. For all other types it is the position
	 * before the item.
	 */
	nextPosition: Position;

	/**
	 * Length of the item. For `'elementStart'` it is 1. For `'text'` it is the length of the text. For `'elementEnd'` it is `undefined`.
	 */
	length?: number;
}

/**
 * Tree walking direction.
 */
export type TreeWalkerDirection = 'forward' | 'backward';

/**
 * The configuration of TreeWalker.
 *
 * All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
 */
export interface TreeWalkerOptions {

	/**
	 * Walking direction.
	 *
	 * @default 'forward'
	 */
	direction?: TreeWalkerDirection;

	/**
	 * Range to define boundaries of the iterator.
	 */
	boundaries?: Range | null;

	/**
	 * Starting position.
	 */
	startPosition?: Position;

	/**
	 * Flag indicating whether all consecutive characters with the same attributes
	 * should be returned one by one as multiple {@link module:engine/model/textproxy~TextProxy} (`true`) objects or as one
	 * {@link module:engine/model/textproxy~TextProxy} (`false`).
	 */
	singleCharacters?: boolean;

	/**
	 * Flag indicating whether iterator should enter elements or not. If the
	 * iterator is shallow child nodes of any iterated node will not be returned along with `elementEnd` tag.
	 */
	shallow?: boolean;

	/**
	 * Flag indicating whether iterator should ignore `elementEnd` tags.
	 * If the option is true walker will not return a parent node of start position. If this option is `true`
	 * each {@link module:engine/model/element~Element} will be returned once, while if the option is `false` they might be returned
	 * twice: for `'elementStart'` and `'elementEnd'`.
	 */
	ignoreElementEnd?: boolean;
}
