/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CharacterProxy from './characterproxy.js';
import TextProxy from './textproxy.js';
import Element from './element.js';
import Position from './position.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * Position iterator class. It allows to iterate forward and backward over the tree document.
 *
 * @memberOf engine.treeModel
 */
export default class TreeWalker {
	/**
	 * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
	 *
	 * @param {Object} options Object with configuration.
	 * @param {engine.treeModel.Range} [options.boundaries] Range to define boundaries of the iterator.
	 * @param {engine.treeModel.Position} [options.startPosition] Starting position.
	 * @param {Boolean} [options.singleCharacters=false] Flag indicating whether all consecutive characters with the same attributes
	 * should be returned one by one as multiple {@link engine.treeModel.CharacterProxy} (`true`) objects or as one
	 * {@link engine.treeModel.TextProxy} (`false`).
	 * @param {Boolean} [options.shallow=false] Flag indicating whether iterator should enter elements or not. If the
	 * iterator is shallow child nodes of any iterated node will not be returned along with `ELEMENT_END` tag.
	 * @param {Boolean} [options.ignoreElementEnd=false] Flag indicating whether iterator should ignore `ELEMENT_END`
	 * tags. If the option is true walker will not return a parent node of start position. If this option is `true`
	 * each {@link engine.treeModel.Element} will be returned once, while if the option is `false` they might be returned
	 * twice: for `'ELEMENT_START'` and `'ELEMENT_END'`.
	 * @constructor
	 */
	constructor( options ) {
		if ( !options || ( !options.boundaries && !options.startPosition ) ) {
			/**
			 * Neither boundaries nor starting position have been defined.
			 *
			 * @error tree-walker-no-start-position
			 */
			throw new CKEditorError( 'tree-walker-no-start-position: Neither boundaries nor starting position have been defined.' );
		}

		if ( options && options.direction && [ 'FORWARD', 'BACKWARD' ].indexOf( options.direction ) < 0 ) {
			/**
			 * Unknown direction.
			 *
			 * @error tree-walker-unknown-direction
			 */
			throw new CKEditorError(
				'tree-walker-unknown-direction: Only `BACKWARD` and `FORWARD` direction allowed.',
				{ direction: options.direction }
			);
		}

		/**
		 * Iterator boundaries.
		 *
		 * When the {@link #next} method is called on the end boundary or the {@link #previous} method
		 * on the start boundary, then `{ done: true }` is returned.
		 *
		 * If boundaries are not defined they are set before first and after last child of the root node.
		 *
		 * @member {engine.treeModel.Range} engine.treeModel.TreeWalker#boundaries
		 */
		this.boundaries = options.boundaries || null;

		/**
		 * Start boundary cached for optimization purposes.
		 *
		 * @private
		 * @member {engine.treeModel.Element} engine.treeModel.TreeWalker#_boundaryStartParent
		 */
		this._boundaryStartParent = this.boundaries ? this.boundaries.start.parent : null;

		/**
		 * End boundary cached for optimization purposes.
		 *
		 * @private
		 * @member {engine.treeModel.Element} engine.treeModel.TreeWalker#_boundaryEndParent
		 */
		this._boundaryEndParent = this.boundaries ? this.boundaries.end.parent : null;

		/**
		 * Iterator position. This is always static position, even if the initial position was a
		 * {@link engine.treeModel.LivePosition live position}.
		 *
		 * @member {engine.treeModel.Position} engine.treeModel.TreeWalker#position
		 */
		this.position = options.startPosition ?
			Position.createFromPosition( options.startPosition ) :
			Position.createFromPosition( options.boundaries.start );

		/**
		 * Walking direction. Defaults `FORWARD`.
		 *
		 * @member engine.treeModel.TreeWalker#direction
		 * @type {String} core.treeModel.TreeWalkerDirection
		 */
		this.direction = !options.direction ? 'FORWARD' : options.direction;

		/**
		 * Flag indicating whether all consecutive characters with the same attributes should be
		 * returned as one {@link engine.treeModel.CharacterProxy} (`true`) or one by one (`false`).
		 *
		 * @member {Boolean} engine.treeModel.TreeWalker#singleCharacters
		 */
		this.singleCharacters = !!options.singleCharacters;

		/**
		 * Flag indicating whether iterator should enter elements or not. If the iterator is shallow child nodes of any
		 * iterated node will not be returned along with `ELEMENT_END` tag.
		 *
		 * @member {Boolean} engine.treeModel.TreeWalker#shallow
		 */
		this.shallow = !!options.shallow;

		/**
		 * Flag indicating whether iterator should ignore `ELEMENT_END` tags. If the option is true walker will not
		 * return a parent node of the start position. If this option is `true` each {@link engine.treeModel.Element} will
		 * be returned once, while if the option is `false` they might be returned twice:
		 * for `'ELEMENT_START'` and `'ELEMENT_END'`.
		 *
		 * @member {Boolean} engine.treeModel.TreeWalker#ignoreElementEnd
		 */
		this.ignoreElementEnd = !!options.ignoreElementEnd;

		/**
		 * Parent of the most recently visited node. Cached for optimization purposes.
		 *
		 * @private
		 * @member {engine.treeModel.Element|engine.treeModel.DocumentFragment} engine.treeModel.TreeWalker#_visitedParent
		 */
		this._visitedParent = this.position.parent;
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
		} else if ( this.direction == 'BACKWARD' ) {
			return this._previous();
		} else {
			/**
			 * Unknown direction.
			 *
			 * @error tree-walker-unknown-direction
			 */
			throw new CKEditorError(
				'tree-walker-unknown-direction: Only `BACKWARD` and `FORWARD` direction allowed.',
				{ direction: this.direction }
			);
		}
	}

	/**
	 * Makes a step forward in tree model. Moves the {@link #position} to the next position and returns the encountered value.
	 *
	 * @private
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {engine.treeModel.TreeWalkerValue} return.value Information about taken step.
	 */
	_next() {
		const previousPosition = this.position;
		const position = Position.createFromPosition( this.position );
		const parent = this._visitedParent;

		// We are at the end of the root.
		if ( parent.parent === null && position.offset === parent.getChildCount() ) {
			return { done: true };
		}

		// We reached the walker boundary.
		if ( parent === this._boundaryEndParent && position.offset == this.boundaries.end.offset ) {
			return { done: true };
		}

		const node = parent.getChild( position.offset );

		if ( node instanceof Element ) {
			if ( !this.shallow ) {
				// Manual operations on path internals for optimization purposes. Here and in the rest of the method.
				position.path.push( 0 );
				this._visitedParent = node;
			} else {
				position.offset++;
			}

			this.position = position;

			return formatReturnValue( 'ELEMENT_START', node, previousPosition, position, 1 );
		} else if ( node instanceof CharacterProxy ) {
			if ( this.singleCharacters ) {
				position.offset++;
				this.position = position;

				return formatReturnValue( 'CHARACTER', node, previousPosition, position, 1 );
			} else {
				let charactersCount = node._nodeListText.text.length - node._index;
				let offset = position.offset + charactersCount;

				if ( this._boundaryEndParent == parent && this.boundaries.end.offset < offset ) {
					offset = this.boundaries.end.offset;
					charactersCount = offset - position.offset;
				}

				let textProxy = new TextProxy( node, charactersCount );

				position.offset = offset;
				this.position = position;

				return formatReturnValue( 'TEXT', textProxy, previousPosition, position, charactersCount );
			}
		} else {
			// `node` is not set, we reached the end of current `parent`.
			position.path.pop();
			position.offset++;
			this.position = position;
			this._visitedParent = parent.parent;

			if ( this.ignoreElementEnd ) {
				return this._next();
			} else {
				return formatReturnValue( 'ELEMENT_END', parent, previousPosition, position );
			}
		}
	}

	/**
	 * Makes a step backward in tree model. Moves the {@link #position} to the previous position and returns the encountered value.
	 *
	 * @private
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {core.treeModel.TreeWalkerValue} return.value Information about taken step.
	 */
	_previous() {
		const previousPosition = this.position;
		const position = Position.createFromPosition( this.position );
		const parent = this._visitedParent;

		// We are at the beginning of the root.
		if ( parent.parent === null && position.offset === 0 ) {
			return { done: true };
		}

		// We reached the walker boundary.
		if ( parent == this._boundaryStartParent && position.offset == this.boundaries.start.offset ) {
			return { done: true };
		}

		// Get node just before current position
		const node = parent.getChild( position.offset - 1 );

		if ( node instanceof Element ) {
			position.offset--;

			if ( !this.shallow ) {
				position.path.push( node.getChildCount() );
				this.position = position;
				this._visitedParent = node;

				if ( this.ignoreElementEnd ) {
					return this._previous();
				} else {
					return formatReturnValue( 'ELEMENT_END', node, position, previousPosition );
				}
			} else {
				this.position = position;

				return formatReturnValue( 'ELEMENT_START', node, position, previousPosition, 1 );
			}
		} else if ( node instanceof CharacterProxy ) {
			if ( this.singleCharacters ) {
				position.offset--;
				this.position = position;

				return formatReturnValue( 'CHARACTER', node, position, previousPosition, 1 );
			} else {
				let charactersCount = node._index + 1;
				let offset = position.offset - charactersCount;

				if ( this._boundaryStartParent == parent && this.boundaries.start.offset > offset ) {
					offset = this.boundaries.start.offset;
					charactersCount = position.offset - offset;
				}

				let textFragment = new TextProxy( parent.getChild( offset ), charactersCount );

				position.offset = offset;
				this.position = position;

				return formatReturnValue( 'TEXT', textFragment, position, previousPosition, charactersCount );
			}
		} else {
			position.path.pop();
			this.position = position;
			this._visitedParent = parent.parent;

			return formatReturnValue( 'ELEMENT_START', parent, position, previousPosition, 1 );
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
 * Type of the step made by {@link engine.treeModel.TreeWalker}.
 * Possible values: `'ELEMENT_START'` if walker is at the beginning of a node, `'ELEMENT_END'` if walker is at the end of node,
 * `'CHARACTER'` if walker traversed over a character, or `'TEXT'` if walker traversed over multiple characters (available in
 * character merging mode, see {@link engine.treeModel.TreeWalker#constructor}).
 *
 * @typedef {String} engine.treeModel.TreeWalkerValueType
 */

/**
 * Object returned by {@link engine.treeModel.TreeWalker} when traversing tree model.
 *
 * @typedef {Object} engine.treeModel.TreeWalkerValue
 * @property {engine.treeModel.TreeWalkerValueType} type
 * @property {engine.treeModel.Item} item Item between old and new positions of {@link engine.treeModel.TreeWalker}.
 * @property {engine.treeModel.Position} previousPosition Previous position of the iterator. For `'ELEMENT_END'` it is the last
 * position inside the element. For all other types it is the position before the item. Note that it is more
 * efficient to use this position then calculate the position before the node using
 * {@link engine.treeModel.Position.createBefore}. It is also more efficient to get the position after node by shifting
 * `previousPosition` by `length`, using {@link engine.treeModel.Position#getShiftedBy}, then calculate the position using
 * {@link engine.treeModel.Position.createAfter}.
 * @property {engine.treeModel.Position} nextPosition Next position of the iterator. For `'ELEMENT_START'` it is the first
 * position inside the element. For all other types it is the position after the item.
 * @property {Number} [length] Length of the item. For `'ELEMENT_START'` and `'CHARACTER'` it is 1. For `'TEXT'` it is
 * the length of the text. For `'ELEMENT_END'` it is undefined.
 */

/**
 * Tree walking directions.
 *
 * Possible values: `'FORWARD'`, `'BACKWARD'`.
 *
 * @typedef {String} core.treeModel.TreeWalkerDirection
 */
