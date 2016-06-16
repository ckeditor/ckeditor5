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
	constructor( {
		boundaries = null,
		startPosition,
		direction = 'FORWARD',
		singleCharacters = false,
		shallow = false,
		ignoreElementEnd = false,
	} = {} ) {
		if ( !boundaries && !startPosition ) {
			/**
			 * Neither boundaries nor starting position have been defined.
			 *
			 * @error tree-walker-no-start-position
			 */
			throw new CKEditorError( 'tree-walker-no-start-position: Neither boundaries nor starting position have been defined.' );
		}

		if ( direction != 'FORWARD' && direction != 'BACKWARD' ) {
			throw new CKEditorError(
				'tree-walker-unknown-direction: Only `BACKWARD` and `FORWARD` direction allowed.',
				{ direction }
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
		this.boundaries = boundaries;

		/**
		 * Iterator position. If start position is not defined then position depends on {@link #direction}. If direction is
		 * `FORWARD` position starts form the beginning, when direction is `BACKWARD` position starts from the end.
		 *
		 * @readonly
		 * @member {engine.view.Position} engine.view.TreeWalker#position
		 */
		if ( startPosition ) {
			this.position = Position.createFromPosition( startPosition );
		} else {
			this.position = Position.createFromPosition( boundaries[ direction == 'BACKWARD' ? 'end' : 'start' ] );
		}

		/**
		 * Walking direction. Defaults `FORWARD`.
		 *
		 * @readonly
		 * @member {'BACKWARD'|'FORWARD'} engine.view.TreeWalker#direction
		 */
		this.direction = direction;

		/**
		 * Flag indicating whether all characters from {@link engine.view.Text} should be returned as one
		 * {@link engine.view.Text} or one by one as {@link.engine.TextProxy}.
		 *
		 * @readonly
		 * @member {Boolean} engine.view.TreeWalker#singleCharacters
		 */
		this.singleCharacters = !!singleCharacters;

		/**
		 * Flag indicating whether iterator should enter elements or not. If the iterator is shallow child nodes of any
		 * iterated node will not be returned along with `ELEMENT_END` tag.
		 *
		 * @readonly
		 * @member {Boolean} engine.view.TreeWalker#shallow
		 */
		this.shallow = !!shallow;

		/**
		 * Flag indicating whether iterator should ignore `ELEMENT_END` tags. If the option is true walker will not
		 * return a parent node of the start position. If this option is `true` each {@link engine.view.Element} will
		 * be returned once, while if the option is `false` they might be returned twice:
		 * for `'ELEMENT_START'` and `'ELEMENT_END'`.
		 *
		 * @readonly
		 * @member {Boolean} engine.view.TreeWalker#ignoreElementEnd
		 */
		this.ignoreElementEnd = !!ignoreElementEnd;

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

			return formatReturnValue( 'ELEMENT_START', node, previousPosition, position, 1 );
		} else if ( node instanceof Text ) {
			if ( this.singleCharacters ) {
				position = new Position( node, 0 );
				this.position = position;

				return this._next();
			} else {
				let charactersCount = node._data.length;
				let item = node;

				// If text stick out of walker range, we need to cut it.
				if ( node == this._boundaryEndParent ) {
					const offset = this.boundaries.end.offset;
					const textFragment = node._data.substring( 0, offset );

					charactersCount = textFragment.length;
					item = new TextProxy( textFragment, node.parent, node, 0 );
					position = Position.createAfter( item );
				} else {
					// If not just move forward.
					position.offset++;
				}

				this.position = position;

				return formatReturnValue( 'TEXT', item, previousPosition, position, charactersCount );
			}
		} else if ( typeof node == 'string' ) {
			position.offset++;

			const textProxy = new TextProxy( node, parent.parent, parent, position.offset );

			this.position = position;

			return formatReturnValue( 'TEXT', textProxy, previousPosition, position, 1 );
		} else {
			// `node` is not set, we reached the end of current `parent`.
			position = Position.createAfter( parent );
			this.position = position;

			// We don't return `ELEMENT_END` for {@link engine.view.Text} element.
			if ( this.ignoreElementEnd || parent instanceof Text ) {
				return this._next();
			} else {
				return formatReturnValue( 'ELEMENT_END', parent, previousPosition, position );
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
					return formatReturnValue( 'ELEMENT_END', node, previousPosition, position );
				}
			} else {
				position.offset--;
				this.position = position;

				return formatReturnValue( 'ELEMENT_START', node, previousPosition, position, 1 );
			}
		} else if ( node instanceof Text ) {
			if ( this.singleCharacters ) {
				position = new Position( node, node._data.length );
				this.position = position;

				return this._previous();
			} else {
				let charactersCount = node._data.length;
				let item = node;

				// If text stick out of walker range, we need to cut it.
				if ( node == this._boundaryStartParent ) {
					const offset = this.boundaries.start.offset;
					const textFragment = node._data.substring( offset, charactersCount );

					charactersCount = textFragment.length;
					item = new TextProxy( textFragment, node.parent, node, offset );
					position = Position.createBefore( item );
				} else {
					// If not just move backward.
					position.offset--;
				}

				this.position = position;

				return formatReturnValue( 'TEXT', item, previousPosition, position, charactersCount );
			}
		} else if ( typeof node == 'string' ) {
			position.offset--;

			const textProxy = new TextProxy( node, parent.parent, parent, position.offset );

			this.position = position;

			return formatReturnValue( 'TEXT', textProxy, previousPosition, position, 1 );
		} else {
			// `node` is not set, we reached the beginning of current `parent`.
			position = Position.createBefore( parent );
			this.position = position;

			// We don't return `ELEMENT_START` for {@link engine.view.Text} element.
			if ( parent instanceof Text ) {
				return this._previous();
			}

			return formatReturnValue( 'ELEMENT_START', parent, previousPosition, position, 1 );
		}
	}
}

function formatReturnValue( type, item, previousPosition, nextPosition, length ) {
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
