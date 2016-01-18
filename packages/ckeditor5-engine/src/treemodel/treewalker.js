/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CharacterProxy from './characterproxy.js';
import TextFragment from './textfragment.js';
import Element from './element.js';
import Position from './position.js';
import CKEditorError from '../ckeditorerror.js';

const ELEMENT_START = 0;
const ELEMENT_END = 1;
const TEXT = 2;
const CHARACTER = 3;

/**
 * Position iterator class. It allows to iterate forward and backward over the tree document.
 *
 * @class treeModel.TreeWalker
 */
export default class TreeWalker {
	/**
	 * Creates a range iterator. All parameters are optional, but you have to specify either `boundaries` or `position`.
	 *
	 * @param {Object} options Object with configuration.
	 * @param {treeModel.Range} [options.boundaries] Range to define boundaries of the iterator.
	 * @param {treeModel.Position} [options.position] Starting position.
	 * @param {Boolean} [options.mergeCharacters] Flag indicating whether all consecutive characters with the same attributes
	 * should be returned as one {@link treeModel.TextFragment} (`true`) or one by one as multiple {@link treeModel.CharacterProxy}
	 * (`false`) objects. Defaults to `false`.
	 * @constructor
	 */
	constructor( options ) {
		if ( !options || ( !options.boundaries && !options.position ) ) {
			/**
			 * Neither boundaries nor starting position have been defined.
			 *
			 * @error tree-walker-no-start-position
			 */
			throw new CKEditorError( 'tree-walker-no-start-position: Neither boundaries nor starting position have been defined.' );
		}

		/**
		 * Iterator boundaries.
		 *
		 * When the {@link #next} method is called on the end boundary or the {@link #previous} method
		 * on the start boundary, then `{ done: true }` is returned.
		 *
		 * If boundaries are not defined they are set before first and after last child of the root node.
		 *
		 * @property {treeModel.Range} boundaries
		 */
		this.boundaries = options.boundaries ? options.boundaries : null;

		/**
		 * Start boundary cached for optimization purposes.
		 *
		 * @private
		 * @property {treeModel.Element} boundaryStartParent
		 */
		this._boundaryStartParent = this.boundaries ? this.boundaries.start.parent : null;

		/**
		 * End boundary cached for optimization purposes.
		 *
		 * @private
		 * @property {treeModel.Element} boundaryEndParent
		 */
		this._boundaryEndParent = this.boundaries ? this.boundaries.end.parent : null;

		/**
		 * Iterator position.
		 *
		 * @property {treeModel.Position} position
		 */
		this.position = options.position ?
			Position.createFromPosition( options.position ) :
			Position.createFromPosition( options.boundaries.start );

		/**
		 * Flag indicating whether all consecutive characters with the same attributes should be
		 * returned as one {@link treeModel.CharacterProxy} (`true`) or one by one (`false`).
		 *
		 * @property {Boolean} mergeCharacters
		 */
		this.mergeCharacters = !!options.mergeCharacters;

		/**
		 * Parent of the most recently visited node. Cached for optimization purposes.
		 *
		 * @private
		 * @property {treeModel.Element} visitedParent
		 */
		this._visitedParent = this.position.parent;
	}

	/**
	 * Moves the {@link #position} to the next position and returns the encountered value.
	 *
	 * @returns {Object} Value between the previous and the new {@link #position}.
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {Object} return.value
	 * @returns {Number} return.value.type Encountered value type, possible options: {@link TreeWalker#ELEMENT_START},
	 * {@link TreeWalker#ELEMENT_END}, {@link TreeWalker#CHARACTER} or {@link TreeWalker#TEXT}.
	 * @returns {treeModel.Node} return.value.node Encountered node.
	 */
	next() {
		const position = Position.createFromPosition( this.position );
		const parent = this._visitedParent;

		// We are at the end of the root.
		if ( parent.parent === null && position.offset === parent.getChildCount() ) {
			return { done: true };
		}

		// Parent can't be null so by comparing with boundaryParent we check if boundaryParent is set at all.
		if ( parent == this._boundaryEndParent && position.offset == this.boundaries.end.offset ) {
			return { done: true };
		}

		const node = parent.getChild( position.offset );

		if ( node instanceof Element ) {
			// Manual operations on path internals for optimization purposes. Here and in the rest of the method.
			position.path.push( 0 );
			this.position = position;

			this._visitedParent = node;

			return formatReturnValue( ELEMENT_START, node );
		} else if ( node instanceof CharacterProxy ) {
			if ( this.mergeCharacters ) {
				let charactersCount = node._nodeListText.text.length - node._index;
				let offset = position.offset + charactersCount;

				if ( this._boundaryEndParent == parent && this.boundaries.end.offset < offset ) {
					offset = this.boundaries.end.offset;
					charactersCount = offset - position.offset;
				}

				let text = node._nodeListText.text.substr( node._index, charactersCount );
				let textFragment = new TextFragment( position, text );

				position.offset = offset;
				this.position = position;

				return formatReturnValue( TEXT, textFragment );
			} else {
				position.offset++;
				this.position = position;

				return formatReturnValue( CHARACTER, node );
			}
		} else {
			position.path.pop();
			position.offset++;
			this.position = position;

			this._visitedParent = parent.parent;

			return formatReturnValue( ELEMENT_END, parent );
		}
	}

	/**
	 * Moves the {@link #position} to the previous position and returns the encountered value.
	 *
	 * @returns {Object} Value between the previous and the new {@link #position}.
	 * @returns {Boolean} return.done True if iterator is done.
	 * @returns {Object} return.value
	 * @returns {Number} return.value.type Encountered value type, possible options: {@link TreeWalker#ELEMENT_START},
	 * {@link TreeWalker#ELEMENT_END}, {@link TreeWalker#CHARACTER} or {@link TreeWalker#TEXT}.
	 * @returns {treeModel.Node} return.value.item Scanned node.
	 */
	previous() {
		const position = Position.createFromPosition( this.position );
		const parent = this._visitedParent;

		// We are at the end of the root.
		if ( parent.parent === null && position.offset === 0 ) {
			return { done: true };
		}

		// Parent can't be null so by comparing with boundaryParent we check if boundaryParent is set at all.
		if ( parent == this._boundaryStartParent && position.offset == this.boundaries.start.offset ) {
			return { done: true };
		}

		const node = parent.getChild( position.offset - 1 );

		if ( node instanceof Element ) {
			// Manual operations on path internals for optimization purposes. Here and in the rest of the method.
			position.offset--;
			position.path.push( node.getChildCount() );
			this.position = position;

			this._visitedParent = node;

			return formatReturnValue( ELEMENT_END, node );
		} else if ( node instanceof CharacterProxy ) {
			if ( this.mergeCharacters ) {
				let charactersCount = node._index + 1;
				let offset = position.offset - charactersCount;

				if ( this._boundaryStartParent == parent && this.boundaries.start.offset > offset ) {
					offset = this.boundaries.start.offset;
					charactersCount = position.offset - offset;
				}

				let text = node._nodeListText.text.substr( node._index + 1 - charactersCount, charactersCount );

				position.offset = offset;
				this.position = position;

				let textFragment = new TextFragment( this.position, text );

				return formatReturnValue( TEXT, textFragment );
			} else {
				position.offset--;
				this.position = position;

				return formatReturnValue( CHARACTER, node );
			}
		} else {
			position.path.pop();
			this.position = position;

			this._visitedParent = parent.parent;

			return formatReturnValue( ELEMENT_START, parent );
		}
	}
}

function formatReturnValue( type, item ) {
	return {
		done: false,
		value: {
			type: type,
			item: item
		}
	};
}

/**
 * Flag for encountering start of an element.
 *
 * @static
 * @readonly
 * @property {Number}
 */
TreeWalker.ELEMENT_START = ELEMENT_START;

/**
 * Flag for encountering end of an element.
 *
 * @static
 * @readonly
 * @property {Number}
 */
TreeWalker.ELEMENT_END = ELEMENT_END;

/**
 * Flag for text.
 *
 * @static
 * @readonly
 * @property {Number}
 */
TreeWalker.TEXT = TEXT;

/**
 * Flag for character.
 *
 * @static
 * @readonly
 * @property {Number}
 */
TreeWalker.CHARACTER = CHARACTER;
