/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Element from './element.js';
import Text from './text.js';
import TextProxy from './textproxy.js';
import Position from './position.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * Position iterator class. It allows to iterate forward and backward over the document.
 *
 * @memberOf engine.view
 */
export default class TreeWalker {
	/**
	 * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
	 *
	 * @constructor
	 * @param {Object} options Object with configuration.
	 * @param {engine.view.Range} [options.boundaries=null] Range to define boundaries of the iterator.
	 * @param {engine.view.Position} [options.startPosition] Starting position.
	 * @param {'FORWARD'|'BACKWARD'} [options.direction='FORWARD'] Walking direction.
	 * @param {Boolean} [options.singleCharacters=false] Flag indicating whether all characters from
	 * {@link engine.view.Text} should be returned as one {@link engine.view.Text} (`false`) ore one by one as
	 * {@link engine.view.TextProxy} (`true`).
	 * @param {Boolean} [options.shallow=false] Flag indicating whether iterator should enter elements or not. If the
	 * iterator is shallow child nodes of any iterated node will not be returned along with `ELEMENT_END` tag.
	 * @param {Boolean} [options.ignoreElementEnd=false] Flag indicating whether iterator should ignore `ELEMENT_END`
	 * tags. If the option is true walker will not return a parent node of start position. If this option is `true`
	 * each {@link engine.view.Element} will be returned once, while if the option is `false` they might be returned
	 * twice: for `'ELEMENT_START'` and `'ELEMENT_END'`.
	 */
	constructor( options = {} ) {
		if ( !options.boundaries && !options.startPosition ) {
			/**
			 * Neither boundaries nor starting position have been defined.
			 *
			 * @error tree-walker-no-start-position
			 */
			throw new CKEditorError( 'tree-walker-no-start-position: Neither boundaries nor starting position have been defined.' );
		}

		if ( options.direction && options.direction != 'FORWARD' && options.direction != 'BACKWARD' ) {
			throw new CKEditorError(
				'tree-walker-unknown-direction: Only `BACKWARD` and `FORWARD` direction allowed.',
				{ direction: options.direction }
			);
		}

		/**
		 * Iterator boundaries.
		 *
		 * When the iterator is walking `FORWARD` on the end of boundary or is walking `BACKWARD`
		 * on the start of boundary, then `{ done: true }` is returned.
		 *
		 * If boundaries are not defined they are set before first and after last child of the root node.
		 *
		 * @readonly
		 * @member {engine.view.Range} engine.view.TreeWalker#boundaries
		 */
		this.boundaries = options.boundaries || null;

		/**
		 * Iterator position. If start position is not defined then position depends on {@link #direction}. If direction is
		 * `FORWARD` position starts form the beginning, when direction is `BACKWARD` position starts from the end.
		 *
		 * @readonly
		 * @member {engine.view.Position} engine.view.TreeWalker#position
		 */
		if ( options.startPosition ) {
			this.position = Position.createFromPosition( options.startPosition );
		} else {
			this.position = Position.createFromPosition( options.boundaries[ options.direction == 'BACKWARD' ? 'end' : 'start' ] );
		}

		/**
		 * Walking direction. Defaults `FORWARD`.
		 *
		 * @readonly
		 * @member {'BACKWARD'|'FORWARD'} engine.view.TreeWalker#direction
		 */
		this.direction = options.direction || 'FORWARD';

		/**
		 * Flag indicating whether all characters from {@link engine.view.Text} should be returned as one
		 * {@link engine.view.Text} or one by one as {@link.engine.TextProxy}.
		 *
		 * @readonly
		 * @member {Boolean} engine.view.TreeWalker#singleCharacters
		 */
		this.singleCharacters = !!options.singleCharacters;

		/**
		 * Flag indicating whether iterator should enter elements or not. If the iterator is shallow child nodes of any
		 * iterated node will not be returned along with `ELEMENT_END` tag.
		 *
		 * @readonly
		 * @member {Boolean} engine.view.TreeWalker#shallow
		 */
		this.shallow = !!options.shallow;

		/**
		 * Flag indicating whether iterator should ignore `ELEMENT_END` tags. If the option is true walker will not
		 * return a parent node of the start position. If this option is `true` each {@link engine.view.Element} will
		 * be returned once, while if the option is `false` they might be returned twice:
		 * for `'ELEMENT_START'` and `'ELEMENT_END'`.
		 *
		 * @readonly
		 * @member {Boolean} engine.view.TreeWalker#ignoreElementEnd
		 */
		this.ignoreElementEnd = !!options.ignoreElementEnd;

		/**
		 * Start boundary cached for optimization purposes.
		 *
		 * @private
		 * @member {engine.view.Element} engine.view.TreeWalker#_boundaryStartParent
		 */
		this._boundaryStartParent = this.boundaries ? this.boundaries.start.parent : null;

		/**
		 * End boundary cached for optimization purposes.
		 *
		 * @private
		 * @member {engine.view.Element} engine.view.TreeWalker#_boundaryEndParent
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
	 * Iterator interface method.
	 * Detects walking direction and makes step forward or backward.
	 *
	 * @returns {Object} Object implementing iterator interface, returning information about taken step.
	 */
	next() {
		if ( this.direction == 'FORWARD' ) {
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
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {engine.view.TreeWalkerValue} return.value Information about taken step.
	 */
	_next() {
		let position = Position.createFromPosition( this.position );
		const previousPosition = this.position;
		const parent = position.parent;

		// We are at the end of the root.
		if ( parent.parent === null && position.offset === parent.getChildCount() ) {
			return { done: true };
		}

		// We reached the walker boundary.
		if ( parent === this._boundaryEndParent && position.offset == this.boundaries.end.offset ) {
			return { done: true };
		}

		// Get node just after current position.
		let node;

		// Text {@link engine.view.Text} element is a specific parent because it contains string instead of child nodes.
		if ( parent instanceof Text ) {
			node = parent._data[ position.offset ];
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

			return this._formatReturnValue( 'ELEMENT_START', node, previousPosition, position, 1 );
		} else if ( node instanceof Text ) {
			if ( this.singleCharacters ) {
				position = new Position( node, 0 );
				this.position = position;

				return this._next();
			} else {
				let charactersCount = node._data.length;
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

				return this._formatReturnValue( 'TEXT', item, previousPosition, position, charactersCount );
			}
		} else if ( typeof node == 'string' ) {
			let textLength;

			if ( this.singleCharacters ) {
				textLength = 1;
			} else {
				// Check if text stick out of walker range.
				const endOffset = parent === this._boundaryEndParent ? this.boundaries.end.offset : parent._data.length;

				textLength = endOffset - position.offset;
			}

			const textProxy = new TextProxy( parent, position.offset, textLength );

			position.offset += textLength;
			this.position = position;

			return this._formatReturnValue( 'TEXT', textProxy, previousPosition, position, textLength );
		} else {
			// `node` is not set, we reached the end of current `parent`.
			position = Position.createAfter( parent );
			this.position = position;

			if ( this.ignoreElementEnd ) {
				return this._next();
			} else {
				return this._formatReturnValue( 'ELEMENT_END', parent, previousPosition, position );
			}
		}
	}

	/**
	 * Makes a step backward in view. Moves the {@link #position} to the previous position and returns the encountered value.
	 *
	 * @private
	 * @returns {Object}
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {engine.view.TreeWalkerValue} return.value Information about taken step.
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

		// Text {@link engine.view.Text} element is a specific parent because contains string instead of child nodes.
		if ( parent instanceof Text ) {
			node = parent._data[ position.offset - 1 ];
		} else {
			node = parent.getChild( position.offset - 1 );
		}

		if ( node instanceof Element ) {
			if ( !this.shallow ) {
				position = new Position( node, node.getChildCount() );
				this.position = position;

				if ( this.ignoreElementEnd ) {
					return this._previous();
				} else {
					return this._formatReturnValue( 'ELEMENT_END', node, previousPosition, position );
				}
			} else {
				position.offset--;
				this.position = position;

				return this._formatReturnValue( 'ELEMENT_START', node, previousPosition, position, 1 );
			}
		} else if ( node instanceof Text ) {
			if ( this.singleCharacters ) {
				position = new Position( node, node._data.length );
				this.position = position;

				return this._previous();
			} else {
				let charactersCount = node._data.length;
				let item = node;

				// If text stick out of walker range, we need to cut it and wrap by TextProxy.
				if ( node == this._boundaryStartParent ) {
					const offset = this.boundaries.start.offset;

					item = new TextProxy( node, offset );
					charactersCount = item._data.length;
					position = Position.createBefore( item );
				} else {
					// If not just keep moving backward.
					position.offset--;
				}

				this.position = position;

				return this._formatReturnValue( 'TEXT', item, previousPosition, position, charactersCount );
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

			// Position at the beginning of Text is always out of Text node, not inside.
			// if ( position.offset === 0 ) {
			// 	position = new Position( parent.parent, parent.getIndex() );
			// }

			this.position = position;

			return this._formatReturnValue( 'TEXT', textProxy, previousPosition, position, textLength );
		} else {
			// `node` is not set, we reached the beginning of current `parent`.
			position = Position.createBefore( parent );
			this.position = position;

			return this._formatReturnValue( 'ELEMENT_START', parent, previousPosition, position, 1 );
		}
	}

	/**
	 * Format returned data and adjust `previousPosition` and `nextPosition` if reach the bound of the {@link engine.view.Text}.
	 *
	 * @private
	 * @param {engine.view.TreeWalkerValueType} type Type of step.
	 * @param {engine.view.Item} item Item between old and new position.
	 * @param {engine.view.Position} previousPosition Previous position of iterator.
	 * @param {engine.view.Position} nextPosition Next position of iterator.
	 * @param {Number} [length] Length of the item.
	 * @returns {engine.view.TreeWalkerValue}
	 */
	_formatReturnValue( type, item, previousPosition, nextPosition, length ) {
		// Text is a specific parent, because contains string instead of childs.
		// We decided to not enter to the Text except situations when walker is iterating over every single character,
		// or the bound starts/ends inside the Text. So when the position is at the beginning or at the end of the Text
		// we move it just before or just after Text.
		if ( item instanceof TextProxy ) {
			// Position is at the end of Text.
			if ( item._index + item._data.length == item._textNode._data.length ) {
				if ( this.direction == 'FORWARD' ) {
					nextPosition = Position.createAfter( item._textNode );
					// When we change nextPosition of returned value we need also update walker current position.
					this.position = nextPosition;
				} else {
					previousPosition = Position.createAfter( item._textNode );
				}
			}

			// Position is at the begining ot the text.
			if ( item._index === 0 ) {
				if ( this.direction == 'FORWARD' ) {
					previousPosition = Position.createBefore( item._textNode );
				} else {
					nextPosition = Position.createBefore( item._textNode );
					// When we change nextPosition of returned value we need also update walker current position.
					this.position = nextPosition;
				}
			}
		}

		return {
			done: false,
			value: {
				type: type,
				item: item,
				previousPosition: previousPosition,
				nextPosition: nextPosition,
				length: length
			}
		};
	}
}

/**
 * Type of the step made by {@link engine.view.TreeWalker}.
 * Possible values: `'ELEMENT_START'` if walker is at the beginning of a node, `'ELEMENT_END'` if walker is at the end
 * of node, or `'TEXT'` if walker traversed over single and multiple characters.
 *
 * @typedef {String} engine.view.TreeWalkerValueType
 */

/**
 * Object returned by {@link engine.view.TreeWalker} when traversing tree view.
 *
 * @typedef {Object} engine.view.TreeWalkerValue
 * @property {engine.view.TreeWalkerValueType} type
 * @property {engine.view.Item} item Item between old and new positions of {@link engine.view.TreeWalker}.
 * @property {engine.view.Position} previousPosition Previous position of the iterator.
 * * Forward iteration: For `'ELEMENT_END'` it is the last position inside the element. For all other types it is the
 * position before the item. Note that it is more efficient to use this position then calculate the position before
 * the node using {@link engine.view.Position.createBefore}.
 * * Backward iteration: For `'ELEMENT_START'` it is the first position inside the element. For all other types it is
 * the position after item.
 * @property {engine.view.Position} nextPosition Next position of the iterator.
 * * Forward iteration: For `'ELEMENT_START'` it is the first position inside the element. For all other types it is
 * the position after the item.
 * * Backward iteration: For `'ELEMENT_END'` it is last position inside element. For all other types it is the position
 * before the item.
 * @property {Number} [length] Length of the item. For `'ELEMENT_START'` it is 1. For `'TEXT'` it is
 * the length of the text. For `'ELEMENT_END'` it is undefined.
 */

/**
 * Tree walking directions.
 *
 * @typedef {'FORWARD'|'BACKWARD'} engine.view.TreeWalkerDirection
 */
