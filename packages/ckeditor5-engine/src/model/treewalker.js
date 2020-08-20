/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/treewalker
 */

import Text from './text';
import TextProxy from './textproxy';
import Element from './element';
import {
	default as Position,
	getTextNodeAtPosition,
	getNodeAfterPosition,
	getNodeBeforePosition
} from './position';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Position iterator class. It allows to iterate forward and backward over the document.
 */
export default class TreeWalker {
	/**
	 * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `startPosition`.
	 *
	 * @constructor
	 * @param {Object} [options={}] Object with configuration.
	 * @param {'forward'|'backward'} [options.direction='forward'] Walking direction.
	 * @param {module:engine/model/range~Range} [options.boundaries=null] Range to define boundaries of the iterator.
	 * @param {module:engine/model/position~Position} [options.startPosition] Starting position.
	 * @param {Boolean} [options.singleCharacters=false] Flag indicating whether all consecutive characters with the same attributes
	 * should be returned one by one as multiple {@link module:engine/model/textproxy~TextProxy} (`true`) objects or as one
	 * {@link module:engine/model/textproxy~TextProxy} (`false`).
	 * @param {Boolean} [options.shallow=false] Flag indicating whether iterator should enter elements or not. If the
	 * iterator is shallow child nodes of any iterated node will not be returned along with `elementEnd` tag.
	 * @param {Boolean} [options.ignoreElementEnd=false] Flag indicating whether iterator should ignore `elementEnd`
	 * tags. If the option is true walker will not return a parent node of start position. If this option is `true`
	 * each {@link module:engine/model/element~Element} will be returned once, while if the option is `false` they might be returned
	 * twice: for `'elementStart'` and `'elementEnd'`.
	 */
	constructor( options = {} ) {
		if ( !options.boundaries && !options.startPosition ) {
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
			throw new CKEditorError(
				'model-tree-walker-unknown-direction',
				options,
				{ direction }
			);
		}

		/**
		 * Walking direction. Defaults `'forward'`.
		 *
		 * @readonly
		 * @member {'backward'|'forward'} module:engine/model/treewalker~TreeWalker#direction
		 */
		this.direction = direction;

		/**
		 * Iterator boundaries.
		 *
		 * When the iterator is walking `'forward'` on the end of boundary or is walking `'backward'`
		 * on the start of boundary, then `{ done: true }` is returned.
		 *
		 * If boundaries are not defined they are set before first and after last child of the root node.
		 *
		 * @readonly
		 * @member {module:engine/model/range~Range} module:engine/model/treewalker~TreeWalker#boundaries
		 */
		this.boundaries = options.boundaries || null;

		/**
		 * Iterator position. This is always static position, even if the initial position was a
		 * {@link module:engine/model/liveposition~LivePosition live position}. If start position is not defined then position depends
		 * on {@link #direction}. If direction is `'forward'` position starts form the beginning, when direction
		 * is `'backward'` position starts from the end.
		 *
		 * @readonly
		 * @member {module:engine/model/position~Position} module:engine/model/treewalker~TreeWalker#position
		 */
		if ( options.startPosition ) {
			this.position = options.startPosition.clone();
		} else {
			this.position = Position._createAt( this.boundaries[ this.direction == 'backward' ? 'end' : 'start' ] );
		}

		// Reset position stickiness in case it was set to other value, as the stickiness is kept after cloning.
		this.position.stickiness = 'toNone';

		/**
		 * Flag indicating whether all consecutive characters with the same attributes should be
		 * returned as one {@link module:engine/model/textproxy~TextProxy} (`true`) or one by one (`false`).
		 *
		 * @readonly
		 * @member {Boolean} module:engine/model/treewalker~TreeWalker#singleCharacters
		 */
		this.singleCharacters = !!options.singleCharacters;

		/**
		 * Flag indicating whether iterator should enter elements or not. If the iterator is shallow child nodes of any
		 * iterated node will not be returned along with `elementEnd` tag.
		 *
		 * @readonly
		 * @member {Boolean} module:engine/model/treewalker~TreeWalker#shallow
		 */
		this.shallow = !!options.shallow;

		/**
		 * Flag indicating whether iterator should ignore `elementEnd` tags. If the option is true walker will not
		 * return a parent node of the start position. If this option is `true` each {@link module:engine/model/element~Element} will
		 * be returned once, while if the option is `false` they might be returned twice:
		 * for `'elementStart'` and `'elementEnd'`.
		 *
		 * @readonly
		 * @member {Boolean} module:engine/model/treewalker~TreeWalker#ignoreElementEnd
		 */
		this.ignoreElementEnd = !!options.ignoreElementEnd;

		/**
		 * Start boundary cached for optimization purposes.
		 *
		 * @private
		 * @member {module:engine/model/element~Element} module:engine/model/treewalker~TreeWalker#_boundaryStartParent
		 */
		this._boundaryStartParent = this.boundaries ? this.boundaries.start.parent : null;

		/**
		 * End boundary cached for optimization purposes.
		 *
		 * @private
		 * @member {module:engine/model/element~Element} module:engine/model/treewalker~TreeWalker#_boundaryEndParent
		 */
		this._boundaryEndParent = this.boundaries ? this.boundaries.end.parent : null;

		/**
		 * Parent of the most recently visited node. Cached for optimization purposes.
		 *
		 * @private
		 * @member {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment}
		 * module:engine/model/treewalker~TreeWalker#_visitedParent
		 */
		this._visitedParent = this.position.parent;
	}

	/**
	 * Iterable interface.
	 *
	 * @returns {Iterable.<module:engine/model/treewalker~TreeWalkerValue>}
	 */
	[ Symbol.iterator ]() {
		return this;
	}

	/**
	 * Moves {@link #position} in the {@link #direction} skipping values as long as the callback function returns `true`.
	 *
	 * For example:
	 *
	 * 		walker.skip( value => value.type == 'text' ); // <paragraph>[]foo</paragraph> -> <paragraph>foo[]</paragraph>
	 * 		walker.skip( () => true ); // Move the position to the end: <paragraph>[]foo</paragraph> -> <paragraph>foo</paragraph>[]
	 * 		walker.skip( () => false ); // Do not move the position.
	 *
	 * @param {Function} skip Callback function. Gets {@link module:engine/model/treewalker~TreeWalkerValue} and should
	 * return `true` if the value should be skipped or `false` if not.
	 */
	skip( skip ) {
		let done, value, prevPosition, prevVisitedParent;

		do {
			prevPosition = this.position;
			prevVisitedParent = this._visitedParent;

			( { done, value } = this.next() );
		} while ( !done && skip( value ) );

		if ( !done ) {
			this.position = prevPosition;
			this._visitedParent = prevVisitedParent;
		}
	}

	/**
	 * Gets the next tree walker's value.
	 *
	 * @returns {module:engine/model/treewalker~TreeWalkerValue} Next tree walker's value.
	 */
	next() {
		if ( this.direction == 'forward' ) {
			return this._next();
		} else {
			return this._previous();
		}
	}

	/**
	 * Makes a step forward in model. Moves the {@link #position} to the next position and returns the encountered value.
	 *
	 * @private
	 * @returns {Object}
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {module:engine/model/treewalker~TreeWalkerValue} return.value Information about taken step.
	 */
	_next() {
		const previousPosition = this.position;
		const position = this.position.clone();
		const parent = this._visitedParent;

		// We are at the end of the root.
		if ( parent.parent === null && position.offset === parent.maxOffset ) {
			return { done: true };
		}

		// We reached the walker boundary.
		if ( parent === this._boundaryEndParent && position.offset == this.boundaries.end.offset ) {
			return { done: true };
		}

		// Get node just after the current position.
		// Use a highly optimized version instead of checking the text node first and then getting the node after. See #6582.
		const positionParent = position.parent;
		const textNodeAtPosition = getTextNodeAtPosition( position, positionParent );
		const node = textNodeAtPosition ? textNodeAtPosition : getNodeAfterPosition( position, positionParent, textNodeAtPosition );

		if ( node instanceof Element ) {
			if ( !this.shallow ) {
				// Manual operations on path internals for optimization purposes. Here and in the rest of the method.
				position.path.push( 0 );
				this._visitedParent = node;
			} else {
				position.offset++;
			}

			this.position = position;

			return formatReturnValue( 'elementStart', node, previousPosition, position, 1 );
		} else if ( node instanceof Text ) {
			let charactersCount;

			if ( this.singleCharacters ) {
				charactersCount = 1;
			} else {
				let offset = node.endOffset;

				if ( this._boundaryEndParent == parent && this.boundaries.end.offset < offset ) {
					offset = this.boundaries.end.offset;
				}

				charactersCount = offset - position.offset;
			}

			const offsetInTextNode = position.offset - node.startOffset;
			const item = new TextProxy( node, offsetInTextNode, charactersCount );

			position.offset += charactersCount;
			this.position = position;

			return formatReturnValue( 'text', item, previousPosition, position, charactersCount );
		} else {
			// `node` is not set, we reached the end of current `parent`.
			position.path.pop();
			position.offset++;
			this.position = position;
			this._visitedParent = parent.parent;

			if ( this.ignoreElementEnd ) {
				return this._next();
			} else {
				return formatReturnValue( 'elementEnd', parent, previousPosition, position );
			}
		}
	}

	/**
	 * Makes a step backward in model. Moves the {@link #position} to the previous position and returns the encountered value.
	 *
	 * @private
	 * @returns {Object}
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {module:engine/model/treewalker~TreeWalkerValue} return.value Information about taken step.
	 */
	_previous() {
		const previousPosition = this.position;
		const position = this.position.clone();
		const parent = this._visitedParent;

		// We are at the beginning of the root.
		if ( parent.parent === null && position.offset === 0 ) {
			return { done: true };
		}

		// We reached the walker boundary.
		if ( parent == this._boundaryStartParent && position.offset == this.boundaries.start.offset ) {
			return { done: true };
		}

		// Get node just before the current position.
		// Use a highly optimized version instead of checking the text node first and then getting the node before. See #6582.
		const positionParent = position.parent;
		const textNodeAtPosition = getTextNodeAtPosition( position, positionParent );
		const node = textNodeAtPosition ? textNodeAtPosition : getNodeBeforePosition( position, positionParent, textNodeAtPosition );

		if ( node instanceof Element ) {
			position.offset--;

			if ( !this.shallow ) {
				position.path.push( node.maxOffset );
				this.position = position;
				this._visitedParent = node;

				if ( this.ignoreElementEnd ) {
					return this._previous();
				} else {
					return formatReturnValue( 'elementEnd', node, previousPosition, position );
				}
			} else {
				this.position = position;

				return formatReturnValue( 'elementStart', node, previousPosition, position, 1 );
			}
		} else if ( node instanceof Text ) {
			let charactersCount;

			if ( this.singleCharacters ) {
				charactersCount = 1;
			} else {
				let offset = node.startOffset;

				if ( this._boundaryStartParent == parent && this.boundaries.start.offset > offset ) {
					offset = this.boundaries.start.offset;
				}

				charactersCount = position.offset - offset;
			}

			const offsetInTextNode = position.offset - node.startOffset;
			const item = new TextProxy( node, offsetInTextNode - charactersCount, charactersCount );

			position.offset -= charactersCount;
			this.position = position;

			return formatReturnValue( 'text', item, previousPosition, position, charactersCount );
		} else {
			// `node` is not set, we reached the beginning of current `parent`.
			position.path.pop();
			this.position = position;
			this._visitedParent = parent.parent;

			return formatReturnValue( 'elementStart', parent, previousPosition, position, 1 );
		}
	}
}

function formatReturnValue( type, item, previousPosition, nextPosition, length ) {
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
 * `'character'` if walker traversed over a character, or `'text'` if walker traversed over multiple characters (available in
 * character merging mode, see {@link module:engine/model/treewalker~TreeWalker#constructor}).
 *
 * @typedef {'elementStart'|'elementEnd'|'character'|'text'} module:engine/model/treewalker~TreeWalkerValueType
 */

/**
 * Object returned by {@link module:engine/model/treewalker~TreeWalker} when traversing tree model.
 *
 * @typedef {Object} module:engine/model/treewalker~TreeWalkerValue
 * @property {module:engine/model/treewalker~TreeWalkerValueType} type
 * @property {module:engine/model/item~Item} item Item between old and new positions of {@link module:engine/model/treewalker~TreeWalker}.
 * @property {module:engine/model/position~Position} previousPosition Previous position of the iterator.
 * * Forward iteration: For `'elementEnd'` it is the last position inside the element. For all other types it is the
 * position before the item.
 * * Backward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
 * the position after item.
 * @property {module:engine/model/position~Position} nextPosition Next position of the iterator.
 * * Forward iteration: For `'elementStart'` it is the first position inside the element. For all other types it is
 * the position after the item.
 * * Backward iteration: For `'elementEnd'` it is last position inside element. For all other types it is the position
 * before the item.
 * @property {Number} [length] Length of the item. For `'elementStart'` and `'character'` it is 1. For `'text'` it is
 * the length of the text. For `'elementEnd'` it is `undefined`.
 */

/**
 * Tree walking directions.
 *
 * @typedef {'forward'|'backward'} module:engine/model/treewalker~TreeWalkerDirection
 */
