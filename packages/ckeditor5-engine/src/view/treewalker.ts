/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/treewalker
 */

import Element from './element';
import Text from './text';
import TextProxy from './textproxy';
import Position from './position';
import type Item from './item';
import type DocumentFragment from './documentfragment';
import type Range from './range';
import type Node from './node';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

/**
 * Position iterator class. It allows to iterate forward and backward over the document.
 */
export default class TreeWalker implements IterableIterator<TreeWalkerValue> {
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
	 * Flag indicating whether all characters from {@link module:engine/view/text~Text} should be returned as one
	 * {@link module:engine/view/text~Text} or one by one as {@link module:engine/view/textproxy~TextProxy}.
	 */
	public readonly singleCharacters: boolean;

	/**
	 * Flag indicating whether iterator should enter elements or not. If the iterator is shallow child nodes of any
	 * iterated node will not be returned along with `elementEnd` tag.
	 */
	public readonly shallow: boolean;

	/**
	 * Flag indicating whether iterator should ignore `elementEnd` tags. If set to `true`, walker will not
	 * return a parent node of the start position. Each {@link module:engine/view/element~Element} will be returned once.
	 * When set to `false` each element might be returned twice: for `'elementStart'` and `'elementEnd'`.
	 */
	public readonly ignoreElementEnd: boolean;

	/**
	 * Iterator position. If start position is not defined then position depends on {@link #direction}. If direction is
	 * `'forward'` position starts form the beginning, when direction is `'backward'` position starts from the end.
	 */
	private _position: Position;

	/**
	 * Start boundary parent.
	 */
	private readonly _boundaryStartParent: Node | DocumentFragment | null;

	/**
	 * End boundary parent.
	 */
	private readonly _boundaryEndParent: Node | DocumentFragment | null;

	/**
	 * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
	 *
	 * @param options Object with configuration.
	 */
	constructor( options: TreeWalkerOptions = {} ) {
		if ( !options.boundaries && !options.startPosition ) {
			/**
			 * Neither boundaries nor starting position have been defined.
			 *
			 * @error view-tree-walker-no-start-position
			 */
			throw new CKEditorError(
				'view-tree-walker-no-start-position',
				null
			);
		}

		if ( options.direction && options.direction != 'forward' && options.direction != 'backward' ) {
			/**
			 * Only `backward` and `forward` direction allowed.
			 *
			 * @error view-tree-walker-unknown-direction
			 */
			throw new CKEditorError( 'view-tree-walker-unknown-direction', options.startPosition, { direction: options.direction } );
		}

		this.boundaries = options.boundaries || null;

		if ( options.startPosition ) {
			this._position = Position._createAt( options.startPosition );
		} else {
			this._position = Position._createAt( options.boundaries![ options.direction == 'backward' ? 'end' : 'start' ] );
		}

		this.direction = options.direction || 'forward';
		this.singleCharacters = !!options.singleCharacters;
		this.shallow = !!options.shallow;
		this.ignoreElementEnd = !!options.ignoreElementEnd;

		this._boundaryStartParent = this.boundaries ? this.boundaries.start.parent : null;
		this._boundaryEndParent = this.boundaries ? this.boundaries.end.parent : null;
	}

	/**
	 * Iterable interface.
	 */
	public [ Symbol.iterator ](): IterableIterator<TreeWalkerValue> {
		return this;
	}

	/**
	 * Iterator position. If start position is not defined then position depends on {@link #direction}. If direction is
	 * `'forward'` position starts form the beginning, when direction is `'backward'` position starts from the end.
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
	 * walker.skip( value => value.type == 'text' ); // <p>{}foo</p> -> <p>foo[]</p>
	 * walker.skip( value => true ); // Move the position to the end: <p>{}foo</p> -> <p>foo</p>[]
	 * walker.skip( value => false ); // Do not move the position.
	 * ```
	 *
	 * @param skip Callback function. Gets {@link module:engine/view/treewalker~TreeWalkerValue} and should
	 * return `true` if the value should be skipped or `false` if not.
	 */
	public skip( skip: ( value: TreeWalkerValue ) => boolean ): void {
		let nextResult: IteratorResult<TreeWalkerValue>;
		let prevPosition: Position;

		do {
			prevPosition = this.position;
			nextResult = this.next();
		} while ( !nextResult.done && skip( nextResult.value ) );

		if ( !nextResult.done ) {
			this._position = prevPosition;
		}
	}

	/**
	 * Gets the next tree walker's value.
	 *
	 * @returns Object implementing iterator interface, returning
	 * information about taken step.
	 */
	public next(): IteratorResult<TreeWalkerValue, undefined> {
		if ( this.direction == 'forward' ) {
			return this._next();
		} else {
			return this._previous();
		}
	}

	/**
	 * Makes a step forward in view. Moves the {@link #position} to the next position and returns the encountered value.
	 */
	private _next(): IteratorResult<TreeWalkerValue, undefined> {
		let position = this.position.clone();
		const previousPosition = this.position;
		const parent = position.parent;

		// We are at the end of the root.
		if ( parent.parent === null && position.offset === ( parent as any ).childCount ) {
			return { done: true, value: undefined };
		}

		// We reached the walker boundary.
		if ( parent === this._boundaryEndParent && position.offset == this.boundaries!.end.offset ) {
			return { done: true, value: undefined };
		}

		// Get node just after current position.
		let node;

		// Text is a specific parent because it contains string instead of child nodes.
		if ( parent instanceof Text ) {
			if ( position.isAtEnd ) {
				// Prevent returning "elementEnd" for Text node. Skip that value and return the next walker step.
				this._position = Position._createAfter( parent );

				return this._next();
			}

			node = parent.data[ position.offset ];
		} else {
			node = ( parent as Element | DocumentFragment ).getChild( position.offset );
		}

		if ( node instanceof Element ) {
			if ( !this.shallow ) {
				position = new Position( node, 0 );
			} else {
				position.offset++;
			}

			this._position = position;

			return this._formatReturnValue( 'elementStart', node, previousPosition, position, 1 );
		} else if ( node instanceof Text ) {
			if ( this.singleCharacters ) {
				position = new Position( node, 0 );
				this._position = position;

				return this._next();
			} else {
				let charactersCount = node.data.length;
				let item;

				// If text stick out of walker range, we need to cut it and wrap in TextProxy.
				if ( node == this._boundaryEndParent ) {
					charactersCount = this.boundaries!.end.offset;
					item = new TextProxy( node, 0, charactersCount );
					position = Position._createAfter( item );
				} else {
					item = new TextProxy( node, 0, node.data.length );
					// If not just keep moving forward.
					position.offset++;
				}

				this._position = position;

				return this._formatReturnValue( 'text', item, previousPosition, position, charactersCount );
			}
		} else if ( typeof node == 'string' ) {
			let textLength;

			if ( this.singleCharacters ) {
				textLength = 1;
			} else {
				// Check if text stick out of walker range.
				const endOffset = parent === this._boundaryEndParent ? this.boundaries!.end.offset : ( parent as Text ).data.length;

				textLength = endOffset - position.offset;
			}

			const textProxy = new TextProxy( parent as Text, position.offset, textLength );

			position.offset += textLength;
			this._position = position;

			return this._formatReturnValue( 'text', textProxy, previousPosition, position, textLength );
		} else {
			// `node` is not set, we reached the end of current `parent`.
			position = Position._createAfter( parent as any );
			this._position = position;

			if ( this.ignoreElementEnd ) {
				return this._next();
			} else {
				return this._formatReturnValue( 'elementEnd', parent as any, previousPosition, position );
			}
		}
	}

	/**
	 * Makes a step backward in view. Moves the {@link #position} to the previous position and returns the encountered value.
	 */
	private _previous(): IteratorResult<TreeWalkerValue, undefined> {
		let position = this.position.clone();
		const previousPosition = this.position;
		const parent = position.parent;

		// We are at the beginning of the root.
		if ( parent.parent === null && position.offset === 0 ) {
			return { done: true, value: undefined };
		}

		// We reached the walker boundary.
		if ( parent == this._boundaryStartParent && position.offset == this.boundaries!.start.offset ) {
			return { done: true, value: undefined };
		}

		// Get node just before current position.
		let node;

		// Text {@link module:engine/view/text~Text} element is a specific parent because contains string instead of child nodes.
		if ( parent instanceof Text ) {
			if ( position.isAtStart ) {
				// Prevent returning "elementStart" for Text node. Skip that value and return the next walker step.
				this._position = Position._createBefore( parent );

				return this._previous();
			}

			node = parent.data[ position.offset - 1 ];
		} else {
			node = ( parent as Element | DocumentFragment ).getChild( position.offset - 1 );
		}

		if ( node instanceof Element ) {
			if ( !this.shallow ) {
				position = new Position( node, node.childCount );
				this._position = position;

				if ( this.ignoreElementEnd ) {
					return this._previous();
				} else {
					return this._formatReturnValue( 'elementEnd', node, previousPosition, position );
				}
			} else {
				position.offset--;
				this._position = position;

				return this._formatReturnValue( 'elementStart', node, previousPosition, position, 1 );
			}
		} else if ( node instanceof Text ) {
			if ( this.singleCharacters ) {
				position = new Position( node, node.data.length );
				this._position = position;

				return this._previous();
			} else {
				let charactersCount = node.data.length;
				let item;

				// If text stick out of walker range, we need to cut it and wrap in TextProxy.
				if ( node == this._boundaryStartParent ) {
					const offset = this.boundaries!.start.offset;

					item = new TextProxy( node, offset, node.data.length - offset );
					charactersCount = item.data.length;
					position = Position._createBefore( item );
				} else {
					item = new TextProxy( node, 0, node.data.length );
					// If not just keep moving backward.
					position.offset--;
				}

				this._position = position;

				return this._formatReturnValue( 'text', item, previousPosition, position, charactersCount );
			}
		} else if ( typeof node == 'string' ) {
			let textLength;

			if ( !this.singleCharacters ) {
				// Check if text stick out of walker range.
				const startOffset = parent === this._boundaryStartParent ? this.boundaries!.start.offset : 0;

				textLength = position.offset - startOffset;
			} else {
				textLength = 1;
			}

			position.offset -= textLength;

			const textProxy = new TextProxy( parent as Text, position.offset, textLength );

			this._position = position;

			return this._formatReturnValue( 'text', textProxy, previousPosition, position, textLength );
		} else {
			// `node` is not set, we reached the beginning of current `parent`.
			position = Position._createBefore( parent as any );
			this._position = position;

			return this._formatReturnValue( 'elementStart', parent as Element, previousPosition, position, 1 );
		}
	}

	/**
	 * Format returned data and adjust `previousPosition` and `nextPosition` if reach the bound of the {@link module:engine/view/text~Text}.
	 *
	 * @param type Type of step.
	 * @param item Item between old and new position.
	 * @param previousPosition Previous position of iterator.
	 * @param nextPosition Next position of iterator.
	 * @param length Length of the item.
	 */
	private _formatReturnValue(
		type: TreeWalkerValueType,
		item: Item,
		previousPosition: Position,
		nextPosition: Position,
		length?: number
	): IteratorYieldResult<TreeWalkerValue> {
		// Text is a specific parent, because contains string instead of children.
		// Walker doesn't enter to the Text except situations when walker is iterating over every single character,
		// or the bound starts/ends inside the Text. So when the position is at the beginning or at the end of the Text
		// we move it just before or just after Text.
		if ( item instanceof TextProxy ) {
			// Position is at the end of Text.
			if ( item.offsetInText + item.data.length == item.textNode.data.length ) {
				if ( this.direction == 'forward' && !( this.boundaries && this.boundaries.end.isEqual( this.position ) ) ) {
					nextPosition = Position._createAfter( item.textNode );
					// When we change nextPosition of returned value we need also update walker current position.
					this._position = nextPosition;
				} else {
					previousPosition = Position._createAfter( item.textNode );
				}
			}

			// Position is at the begining ot the text.
			if ( item.offsetInText === 0 ) {
				if ( this.direction == 'backward' && !( this.boundaries && this.boundaries.start.isEqual( this.position ) ) ) {
					nextPosition = Position._createBefore( item.textNode );
					// When we change nextPosition of returned value we need also update walker current position.
					this._position = nextPosition;
				} else {
					previousPosition = Position._createBefore( item.textNode );
				}
			}
		}

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
}

/**
 * Type of the step made by {@link module:engine/view/treewalker~TreeWalker}.
 * Possible values: `'elementStart'` if walker is at the beginning of a node, `'elementEnd'` if walker is at the end
 * of node, or `'text'` if walker traversed over single and multiple characters.
 * For {@link module:engine/view/text~Text} `elementStart` and `elementEnd` is not returned.
 */
export type TreeWalkerValueType = 'elementStart' | 'elementEnd' | 'text';

/**
 * Object returned by {@link module:engine/view/treewalker~TreeWalker} when traversing tree view.
 */
export interface TreeWalkerValue {

	/**
	 * Type of the step made by {@link module:engine/view/treewalker~TreeWalker}.
	 */
	type: TreeWalkerValueType;

	/**
	 * Item between the old and the new positions of the tree walker.
	 */
	item: Item;

	/**
	 * Previous position of the iterator.
	 * * Forward iteration: For `'elementEnd'` it is the last position inside the element. For all other types it is the
	 * position before the item.
	 * * Backward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
	 * the position after item.
	 * * If the position is at the beginning or at the end of the {@link module:engine/view/text~Text} it is always moved from the
	 * inside of the text to its parent just before or just after that text.
	 */
	previousPosition: Position;

	/**
	 * Next position of the iterator.
	 * * Forward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
	 * the position after the item.
	 * * Backward iteration: For `'elementEnd'` it is last position inside element. For all other types it is the position
	 * before the item.
	 * * If the position is at the beginning or at the end of the {@link module:engine/view/text~Text} it is always moved from the
	 * inside of the text to its parent just before or just after that text.
	 */
	nextPosition: Position;

	/**
	 * Length of the item. For `'elementStart'` it is `1`. For `'text'` it is
	 * the length of that text. For `'elementEnd'` it is `undefined`.
	 */
	length?: number;
}

/**
 * Tree walking direction.
 */
export type TreeWalkerDirection = 'forward' | 'backward';

/**
 * The configuration of {@link ~TreeWalker}.
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
	 * Flag indicating whether all characters from
	 * {@link module:engine/view/text~Text} should be returned as one {@link module:engine/view/text~Text} (`false`) or one by one as
	 * {@link module:engine/view/textproxy~TextProxy} (`true`).
	 */
	singleCharacters?: boolean;

	/**
	 * Flag indicating whether iterator should enter elements or not. If the
	 * iterator is shallow child nodes of any iterated node will not be returned along with `elementEnd` tag.
	 */
	shallow?: boolean;

	/**
	 * Flag indicating whether iterator should ignore `elementEnd`
	 * tags. If the option is true walker will not return a parent node of start position. If this option is `true`
	 * each {@link module:engine/view/element~Element} will be returned once, while if the option is `false` they might be returned
	 * twice: for `'elementStart'` and `'elementEnd'`.
	 */
	ignoreElementEnd?: boolean;
}
