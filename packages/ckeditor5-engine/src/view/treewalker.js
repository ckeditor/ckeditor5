/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/treewalker
 */

import Element from './element';
import Text from './text';
import TextProxy from './textproxy';
import Position from './position';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Position iterator class. It allows to iterate forward and backward over the document.
 */
export default class TreeWalker {
	/**
	 * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
	 *
	 * @constructor
	 * @param {Object} options Object with configuration.
	 * @param {module:engine/view/range~Range} [options.boundaries=null] Range to define boundaries of the iterator.
	 * @param {module:engine/view/position~Position} [options.startPosition] Starting position.
	 * @param {'forward'|'backward'} [options.direction='forward'] Walking direction.
	 * @param {Boolean} [options.singleCharacters=false] Flag indicating whether all characters from
	 * {@link module:engine/view/text~Text} should be returned as one {@link module:engine/view/text~Text} (`false`) ore one by one as
	 * {@link module:engine/view/textproxy~TextProxy} (`true`).
	 * @param {Boolean} [options.shallow=false] Flag indicating whether iterator should enter elements or not. If the
	 * iterator is shallow child nodes of any iterated node will not be returned along with `elementEnd` tag.
	 * @param {Boolean} [options.ignoreElementEnd=false] Flag indicating whether iterator should ignore `elementEnd`
	 * tags. If the option is true walker will not return a parent node of start position. If this option is `true`
	 * each {@link module:engine/view/element~Element} will be returned once, while if the option is `false` they might be returned
	 * twice: for `'elementStart'` and `'elementEnd'`.
	 */
	constructor( options = {} ) {
		if ( !options.boundaries && !options.startPosition ) {
			/**
			 * Neither boundaries nor starting position have been defined.
			 *
			 * @error tree-walker-no-start-position
			 */
			throw new CKEditorError( 'view-tree-walker-no-start-position: Neither boundaries nor starting position have been defined.' );
		}

		if ( options.direction && options.direction != 'forward' && options.direction != 'backward' ) {
			throw new CKEditorError(
				'view-tree-walker-unknown-direction: Only `backward` and `forward` direction allowed.',
				{ direction: options.direction }
			);
		}

		/**
		 * Iterator boundaries.
		 *
		 * When the iterator is walking `'forward'` on the end of boundary or is walking `'backward'`
		 * on the start of boundary, then `{ done: true }` is returned.
		 *
		 * If boundaries are not defined they are set before first and after last child of the root node.
		 *
		 * @readonly
		 * @member {module:engine/view/range~Range} module:engine/view/treewalker~TreeWalker#boundaries
		 */
		this.boundaries = options.boundaries || null;

		/**
		 * Iterator position. If start position is not defined then position depends on {@link #direction}. If direction is
		 * `'forward'` position starts form the beginning, when direction is `'backward'` position starts from the end.
		 *
		 * @readonly
		 * @member {module:engine/view/position~Position} module:engine/view/treewalker~TreeWalker#position
		 */
		if ( options.startPosition ) {
			this.position = Position.createFromPosition( options.startPosition );
		} else {
			this.position = Position.createFromPosition( options.boundaries[ options.direction == 'backward' ? 'end' : 'start' ] );
		}

		/**
		 * Walking direction. Defaults `'forward'`.
		 *
		 * @readonly
		 * @member {'backward'|'forward'} module:engine/view/treewalker~TreeWalker#direction
		 */
		this.direction = options.direction || 'forward';

		/**
		 * Flag indicating whether all characters from {@link module:engine/view/text~Text} should be returned as one
		 * {@link module:engine/view/text~Text} or one by one as {@link module:engine/view/textproxy~TextProxy}.
		 *
		 * @readonly
		 * @member {Boolean} module:engine/view/treewalker~TreeWalker#singleCharacters
		 */
		this.singleCharacters = !!options.singleCharacters;

		/**
		 * Flag indicating whether iterator should enter elements or not. If the iterator is shallow child nodes of any
		 * iterated node will not be returned along with `elementEnd` tag.
		 *
		 * @readonly
		 * @member {Boolean} module:engine/view/treewalker~TreeWalker#shallow
		 */
		this.shallow = !!options.shallow;

		/**
		 * Flag indicating whether iterator should ignore `elementEnd` tags. If set to `true`, walker will not
		 * return a parent node of the start position. Each {@link module:engine/view/element~Element} will be returned once.
		 * When set to `false` each element might be returned twice: for `'elementStart'` and `'elementEnd'`.
		 *
		 * @readonly
		 * @member {Boolean} module:engine/view/treewalker~TreeWalker#ignoreElementEnd
		 */
		this.ignoreElementEnd = !!options.ignoreElementEnd;

		/**
		 * Start boundary parent.
		 *
		 * @private
		 * @member {module:engine/view/node~Node} module:engine/view/treewalker~TreeWalker#_boundaryStartParent
		 */
		this._boundaryStartParent = this.boundaries ? this.boundaries.start.parent : null;

		/**
		 * End boundary parent.
		 *
		 * @private
		 * @member {module:engine/view/node~Node} module:engine/view/treewalker~TreeWalker#_boundaryEndParent
		 */
		this._boundaryEndParent = this.boundaries ? this.boundaries.end.parent : null;
	}

	/**
	 * Iterator interface.
	 */
	[ Symbol.iterator ]() {
		return this;
	}

	/**
	 * Moves {@link #position} in the {@link #direction} skipping values as long as the callback function returns `true`.
	 *
	 * For example:
	 *
	 * 		walker.skip( value => value.type == 'text' ); // <p>{}foo</p> -> <p>foo[]</p>
	 * 		walker.skip( value => true ); // Move the position to the end: <p>{}foo</p> -> <p>foo</p>[]
	 * 		walker.skip( value => false ); // Do not move the position.
	 *
	 * @param {Function} skip Callback function. Gets {@link module:engine/view/treewalker~TreeWalkerValue} and should
	 * return `true` if the value should be skipped or `false` if not.
	 */
	skip( skip ) {
		let done, value, prevPosition;

		do {
			prevPosition = this.position;

			( { done, value } = this.next() );
		} while ( !done && skip( value ) );

		if ( !done ) {
			this.position = prevPosition;
		}
	}

	/**
	 * Iterator interface method.
	 * Detects walking direction and makes step forward or backward.
	 *
	 * @returns {Object} Object implementing iterator interface, returning information about taken step.
	 */
	next() {
		if ( this.direction == 'forward' ) {
			return this._next();
		} else {
			return this._previous();
		}
	}

	/**
	 * Makes a step forward in view. Moves the {@link #position} to the next position and returns the encountered value.
	 *
	 * @private
	 * @returns {Object}
	 * @returns {Boolean} return.done `true` if iterator is done, `false` otherwise.
	 * @returns {module:engine/view/treewalker~TreeWalkerValue} return.value Information about taken step.
	 */
	_next() {
		let position = Position.createFromPosition( this.position );
		const previousPosition = this.position;
		const parent = position.parent;

		// We are at the end of the root.
		if ( parent.parent === null && position.offset === parent.childCount ) {
			return { done: true };
		}

		// We reached the walker boundary.
		if ( parent === this._boundaryEndParent && position.offset == this.boundaries.end.offset ) {
			return { done: true };
		}

		// Get node just after current position.
		let node;

		// Text is a specific parent because it contains string instead of child nodes.
		if ( parent instanceof Text ) {
			if ( position.isAtEnd ) {
				// Prevent returning "elementEnd" for Text node. Skip that value and return the next walker step.
				this.position = Position.createAfter( parent );

				return this._next();
			}

			node = parent.data[ position.offset ];
		} else {
			node = parent.getChild( position.offset );
		}

		if ( node instanceof Element ) {
			if ( !this.shallow ) {
				position = new Position( node, 0 );
			} else {
				position.offset++;
			}

			this.position = position;

			return this._formatReturnValue( 'elementStart', node, previousPosition, position, 1 );
		} else if ( node instanceof Text ) {
			if ( this.singleCharacters ) {
				position = new Position( node, 0 );
				this.position = position;

				return this._next();
			} else {
				let charactersCount = node.data.length;
				let item = node;

				// If text stick out of walker range, we need to cut it and wrap by TextProxy.
				if ( node == this._boundaryEndParent ) {
					charactersCount = this.boundaries.end.offset;
					item = new TextProxy( node, 0, charactersCount );
					position = Position.createAfter( item );
				} else {
					// If not just keep moving forward.
					position.offset++;
				}

				this.position = position;

				return this._formatReturnValue( 'text', item, previousPosition, position, charactersCount );
			}
		} else if ( typeof node == 'string' ) {
			let textLength;

			if ( this.singleCharacters ) {
				textLength = 1;
			} else {
				// Check if text stick out of walker range.
				const endOffset = parent === this._boundaryEndParent ? this.boundaries.end.offset : parent.data.length;

				textLength = endOffset - position.offset;
			}

			const textProxy = new TextProxy( parent, position.offset, textLength );

			position.offset += textLength;
			this.position = position;

			return this._formatReturnValue( 'text', textProxy, previousPosition, position, textLength );
		} else {
			// `node` is not set, we reached the end of current `parent`.
			position = Position.createAfter( parent );
			this.position = position;

			if ( this.ignoreElementEnd ) {
				return this._next();
			} else {
				return this._formatReturnValue( 'elementEnd', parent, previousPosition, position );
			}
		}
	}

	/**
	 * Makes a step backward in view. Moves the {@link #position} to the previous position and returns the encountered value.
	 *
	 * @private
	 * @returns {Object}
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {module:engine/view/treewalker~TreeWalkerValue} return.value Information about taken step.
	 */
	_previous() {
		let position = Position.createFromPosition( this.position );
		const previousPosition = this.position;
		const parent = position.parent;

		// We are at the beginning of the root.
		if ( parent.parent === null && position.offset === 0 ) {
			return { done: true };
		}

		// We reached the walker boundary.
		if ( parent == this._boundaryStartParent && position.offset == this.boundaries.start.offset ) {
			return { done: true };
		}

		// Get node just before current position.
		let node;

		// Text {@link module:engine/view/text~Text} element is a specific parent because contains string instead of child nodes.
		if ( parent instanceof Text ) {
			if ( position.isAtStart ) {
				// Prevent returning "elementStart" for Text node. Skip that value and return the next walker step.
				this.position = Position.createBefore( parent );

				return this._previous();
			}

			node = parent.data[ position.offset - 1 ];
		} else {
			node = parent.getChild( position.offset - 1 );
		}

		if ( node instanceof Element ) {
			if ( !this.shallow ) {
				position = new Position( node, node.childCount );
				this.position = position;

				if ( this.ignoreElementEnd ) {
					return this._previous();
				} else {
					return this._formatReturnValue( 'elementEnd', node, previousPosition, position );
				}
			} else {
				position.offset--;
				this.position = position;

				return this._formatReturnValue( 'elementStart', node, previousPosition, position, 1 );
			}
		} else if ( node instanceof Text ) {
			if ( this.singleCharacters ) {
				position = new Position( node, node.data.length );
				this.position = position;

				return this._previous();
			} else {
				let charactersCount = node.data.length;
				let item = node;

				// If text stick out of walker range, we need to cut it and wrap by TextProxy.
				if ( node == this._boundaryStartParent ) {
					const offset = this.boundaries.start.offset;

					item = new TextProxy( node, offset, node.data.length - offset );
					charactersCount = item.data.length;
					position = Position.createBefore( item );
				} else {
					// If not just keep moving backward.
					position.offset--;
				}

				this.position = position;

				return this._formatReturnValue( 'text', item, previousPosition, position, charactersCount );
			}
		} else if ( typeof node == 'string' ) {
			let textLength;

			if ( !this.singleCharacters ) {
				// Check if text stick out of walker range.
				const startOffset = parent === this._boundaryStartParent ? this.boundaries.start.offset : 0;

				textLength = position.offset - startOffset;
			} else {
				textLength = 1;
			}

			position.offset -= textLength;

			const textProxy = new TextProxy( parent, position.offset, textLength );

			this.position = position;

			return this._formatReturnValue( 'text', textProxy, previousPosition, position, textLength );
		} else {
			// `node` is not set, we reached the beginning of current `parent`.
			position = Position.createBefore( parent );
			this.position = position;

			return this._formatReturnValue( 'elementStart', parent, previousPosition, position, 1 );
		}
	}

	/**
	 * Format returned data and adjust `previousPosition` and `nextPosition` if reach the bound of the {@link module:engine/view/text~Text}.
	 *
	 * @private
	 * @param {module:engine/view/treewalker~TreeWalkerValueType} type Type of step.
	 * @param {module:engine/view/item~Item} item Item between old and new position.
	 * @param {module:engine/view/position~Position} previousPosition Previous position of iterator.
	 * @param {module:engine/view/position~Position} nextPosition Next position of iterator.
	 * @param {Number} [length] Length of the item.
	 * @returns {module:engine/view/treewalker~TreeWalkerValue}
	 */
	_formatReturnValue( type, item, previousPosition, nextPosition, length ) {
		// Text is a specific parent, because contains string instead of children.
		// Walker doesn't enter to the Text except situations when walker is iterating over every single character,
		// or the bound starts/ends inside the Text. So when the position is at the beginning or at the end of the Text
		// we move it just before or just after Text.
		if ( item instanceof TextProxy ) {
			// Position is at the end of Text.
			if ( item.offsetInText + item.data.length == item.textNode.data.length ) {
				if ( this.direction == 'forward' && !( this.boundaries && this.boundaries.end.isEqual( this.position ) ) ) {
					nextPosition = Position.createAfter( item.textNode );
					// When we change nextPosition of returned value we need also update walker current position.
					this.position = nextPosition;
				} else {
					previousPosition = Position.createAfter( item.textNode );
				}
			}

			// Position is at the begining ot the text.
			if ( item.offsetInText === 0 ) {
				if ( this.direction == 'backward' && !( this.boundaries && this.boundaries.start.isEqual( this.position ) ) ) {
					nextPosition = Position.createBefore( item.textNode );
					// When we change nextPosition of returned value we need also update walker current position.
					this.position = nextPosition;
				} else {
					previousPosition = Position.createBefore( item.textNode );
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
 *
 * @typedef {String} module:engine/view/treewalker~TreeWalkerValueType
 */

/**
 * Object returned by {@link module:engine/view/treewalker~TreeWalker} when traversing tree view.
 *
 * @typedef {Object} module:engine/view/treewalker~TreeWalkerValue
 * @property {module:engine/view/treewalker~TreeWalkerValueType} type
 * @property {module:engine/view/item~Item} item Item between old and new positions of {@link module:engine/view/treewalker~TreeWalker}.
 * @property {module:engine/view/position~Position} previousPosition Previous position of the iterator.
 * * Forward iteration: For `'elementEnd'` it is the last position inside the element. For all other types it is the
 * position before the item. Note that it is more efficient to use this position then calculate the position before
 * the node using {@link module:engine/view/position~Position.createBefore}.
 * * Backward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
 * the position after item.
 * * If the position is at the beginning or at the end of the {@link module:engine/view/text~Text} it is always moved from the
 * inside of the Text to its parent just before or just after Text.
 * @property {module:engine/view/position~Position} nextPosition Next position of the iterator.
 * * Forward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
 * the position after the item.
 * * Backward iteration: For `'elementEnd'` it is last position inside element. For all other types it is the position
 * before the item.
 * * If the position is at the beginning or at the end of the {@link module:engine/view/text~Text} it is always moved from the
 * inside of the Text to its parent just before or just after Text.
 * @property {Number} [length] Length of the item. For `'elementStart'` it is 1. For `'text'` it is
 * the length of the text. For `'elementEnd'` it is undefined.
 */

/**
 * Tree walking directions.
 *
 * @typedef {'forward'|'backward'} module:engine/view/treewalker~TreeWalkerDirection
 */
